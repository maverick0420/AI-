const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ChatMessage = require('../models/chatMessageModel');
const LiveRoom = require('../models/liveRoomModel');

/**
 * WebSocket服务类
 * 处理实时通信，包括聊天、礼物通知等功能
 */
class SocketService {
  /**
   * 初始化Socket.IO服务
   * @param {Object} server - HTTP服务器实例
   */
  constructor(server) {
    this.io = socketIO(server);
    // 用户ID到socket连接的映射
    this.userSockets = new Map();
    this.initialize();
  }

  /**
   * 初始化WebSocket服务
   * 设置认证中间件和连接处理
   */
  initialize() {
    // Socket认证中间件
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * 处理新的Socket连接
   * @param {Object} socket - Socket实例
   */
  handleConnection(socket) {
    const userId = socket.user._id;
    this.userSockets.set(userId.toString(), socket);

    // 加入直播间事件处理
    socket.on('join-room', async (roomId) => {
      try {
        const room = await LiveRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: '直播间不存在' });
          return;
        }

        socket.join(roomId);
        room.viewers += 1;
        await room.save();

        // 广播用户加入消息
        this.io.to(roomId).emit('user-joined', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          },
          viewers: room.viewers
        });
      } catch (error) {
        socket.emit('error', { message: '加入直播间失败' });
      }
    });

    // 离开直播间事件处理
    socket.on('leave-room', async (roomId) => {
      try {
        const room = await LiveRoom.findById(roomId);
        if (room) {
          room.viewers = Math.max(0, room.viewers - 1);
          await room.save();
        }
        socket.leave(roomId);
        
        this.io.to(roomId).emit('user-left', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          },
          viewers: room ? room.viewers : 0
        });
      } catch (error) {
        socket.emit('error', { message: '离开直播间失败' });
      }
    });

    // 发送消息事件处理
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, type = 'text' } = data;
        
        const message = await ChatMessage.create({
          roomId,
          sender: socket.user._id,
          content,
          type
        });

        const populatedMessage = await message.populate('sender', 'username avatar');
        
        this.io.to(roomId).emit('new-message', {
          message: {
            id: populatedMessage._id,
            content: populatedMessage.content,
            type: populatedMessage.type,
            sender: {
              id: populatedMessage.sender._id,
              username: populatedMessage.sender.username,
              avatar: populatedMessage.sender.avatar
            },
            createdAt: populatedMessage.createdAt
          }
        });
      } catch (error) {
        socket.emit('error', { message: '发送消息失败' });
      }
    });

    // 断开连接事件处理
    socket.on('disconnect', () => {
      this.userSockets.delete(userId.toString());
    });
  }

  /**
   * 发送系统消息
   * @param {string} roomId - 直播间ID
   * @param {string} content - 消息内容
   */
  async sendSystemMessage(roomId, content) {
    try {
      const message = await ChatMessage.create({
        roomId,
        content,
        type: 'system',
        sender: null
      });

      this.io.to(roomId).emit('new-message', {
        message: {
          id: message._id,
          content: message.content,
          type: 'system',
          createdAt: message.createdAt
        }
      });
    } catch (error) {
      console.error('发送系统消息失败:', error);
    }
  }

  /**
   * 广播礼物消息
   * @param {string} roomId - 直播间ID
   * @param {Object} giftData - 礼物数据
   */
  broadcastGift(roomId, giftData) {
    this.io.to(roomId).emit('gift-received', giftData);
  }
}

module.exports = SocketService; 