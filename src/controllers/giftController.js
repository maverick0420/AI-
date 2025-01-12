const mongoose = require('mongoose');
const Gift = require('../models/giftModel');
const GiftRecord = require('../models/giftRecordModel');
const User = require('../models/userModel');
const LiveRoom = require('../models/liveRoomModel');

const GiftController = {
  // 创建礼物
  async create(req, res) {
    try {
      const { name, price, icon, animation, description } = req.body;
      
      const gift = await Gift.create({
        name,
        price,
        icon,
        animation,
        description
      });

      res.status(201).json({
        message: '礼物创建成功',
        gift
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取礼物列表
  async getList(req, res) {
    try {
      const gifts = await Gift.find({ isActive: true });
      res.json({ gifts });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 发送礼物
  async sendGift(req, res) {
    try {
      const { roomId, giftId, quantity = 1 } = req.body;
      const senderId = req.user._id;

      // 查找直播间
      const room = await LiveRoom.findById(roomId);
      if (!room) {
        return res.status(404).json({ 
          message: '直播间不存在' 
        });
      }

      // 查找礼物
      const gift = await Gift.findOne({ 
        _id: giftId, 
        isActive: true 
      });
      if (!gift) {
        return res.status(404).json({ 
          message: '礼物不存在或已下架' 
        });
      }

      const totalPrice = gift.price * quantity;

      // 检查用户余额
      const sender = await User.findById(senderId);
      if (sender.balance < totalPrice) {
        return res.status(400).json({ 
          message: '余额不足' 
        });
      }

      // 开始事务
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 扣除发送者余额
        const updatedSender = await User.findByIdAndUpdate(
          senderId,
          { 
            $inc: { 
              balance: -totalPrice,
              totalSent: totalPrice
            } 
          },
          { session, new: true }
        );

        // 增加接收者余额
        const updatedReceiver = await User.findByIdAndUpdate(
          room.host,
          { 
            $inc: { 
              balance: totalPrice,
              totalReceived: totalPrice
            } 
          },
          { session, new: true }
        );

        // 创建礼物记录
        const giftRecord = await GiftRecord.create([{
          roomId,
          sender: senderId,
          receiver: room.host,
          gift: giftId,
          quantity,
          totalPrice
        }], { session });

        await session.commitTransaction();

        // 通过WebSocket广播礼物消息
        const socketService = req.app.get('socketService');
        if (socketService) {
          socketService.broadcastGift(roomId, {
            giftRecord: giftRecord[0],
            sender: {
              id: sender._id,
              username: sender.username,
              avatar: sender.avatar
            },
            gift: {
              id: gift._id,
              name: gift.name,
              icon: gift.icon,
              animation: gift.animation
            },
            quantity
          });
        }

        res.json({
          message: '礼物发送成功',
          giftRecord: giftRecord[0],
          balance: updatedSender.balance
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 获取礼物记录
  async getRecords(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const records = await GiftRecord.find({ roomId })
        .populate('sender', 'username avatar')
        .populate('gift', 'name icon')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await GiftRecord.countDocuments({ roomId });

      res.json({
        records,
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
  }
};

module.exports = GiftController; 