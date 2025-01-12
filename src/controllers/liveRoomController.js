const LiveRoom = require('../models/liveRoomModel');
const crypto = require('crypto');
const ChatMessage = require('../models/chatMessageModel');
const User = require('../models/userModel');
const mediaService = require('../services/mediaService');

const LiveRoomController = {
  // 创建直播间
  async create(req, res) {
    try {
      const { title, description, category } = req.body;
      
      // 生成唯一的推流密钥
      const streamKey = crypto.randomBytes(16).toString('hex');
      
      const liveRoom = await LiveRoom.create({
        title,
        description,
        category,
        host: req.user._id,
        streamKey
      });

      res.status(201).json({
        message: '直播间创建成功',
        liveRoom: {
          id: liveRoom._id,
          title: liveRoom.title,
          description: liveRoom.description,
          category: liveRoom.category,
          streamKey: liveRoom.streamKey
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取直播间列表
  async getList(req, res) {
    try {
      const { category, status, page = 1, limit = 10 } = req.query;
      
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;

      const rooms = await LiveRoom.find(query)
        .populate('host', 'username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await LiveRoom.countDocuments(query);

      res.json({
        rooms,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取直播间详情
  async getDetail(req, res) {
    try {
      const room = await LiveRoom.findById(req.params.id)
        .populate('host', 'username avatar');

      if (!room) {
        return res.status(404).json({ 
          message: '直播间不存在' 
        });
      }

      res.json({ room });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 更新直播间信息
  async update(req, res) {
    try {
      const { title, description, category } = req.body;
      const room = await LiveRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ 
          message: '直播间不存在' 
        });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: '没有权限修改此直播间' 
        });
      }

      const updatedRoom = await LiveRoom.findByIdAndUpdate(
        req.params.id,
        { title, description, category },
        { new: true }
      );

      res.json({
        message: '更新成功',
        room: updatedRoom
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 开始直播
  async startLive(req, res) {
    try {
      const room = await LiveRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ 
          message: '直播间不存在' 
        });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: '没有权限操作此直播间' 
        });
      }

      room.status = 'live';
      await room.save();

      res.json({
        message: '直播已开始',
        room
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 结束直播
  async endLive(req, res) {
    try {
      const room = await LiveRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ 
          message: '直播间不存在' 
        });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: '没有权限操作此直播间' 
        });
      }

      room.status = 'ended';
      await room.save();

      res.json({
        message: '直播已结束',
        room
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取聊天记录
  async getChatHistory(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await ChatMessage.find({ roomId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await ChatMessage.countDocuments({ roomId });

      res.json({
        messages: messages.reverse(),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取推荐直播间
  async getRecommended(req, res) {
    try {
      const rooms = await LiveRoom.find({ status: 'live' })
        .populate('host', 'username avatar')
        .sort({ viewers: -1 })
        .limit(10);

      res.json({ rooms });
    } catch (error) {
      res.status(500).json({
        message: '服务器错误，请稍后重试'
      });
    }
  },

  // 获取用户关注的直播间
  async getFollowing(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate('following');
      
      const rooms = await LiveRoom.find({
        host: { $in: user.following },
        status: 'live'
      }).populate('host', 'username avatar');

      res.json({ rooms });
    } catch (error) {
      res.status(500).json({
        message: '服务器错误，请稍后重试'
      });
    }
  },

  /**
   * 获取推拉流地址
   */
  async getStreamUrls(req, res) {
    try {
      const { id } = req.params;
      const room = await LiveRoom.findById(id);

      if (!room) {
        return res.status(404).json({
          message: '直播间不存在'
        });
      }

      // 检查权限
      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: '没有权限获取推流地址'
        });
      }

      const urls = mediaService.getStreamUrls(room.streamKey);
      res.json({ urls });
    } catch (error) {
      res.status(500).json({
        message: '服务器错误，请稍后重试'
      });
    }
  }
};

module.exports = LiveRoomController; 