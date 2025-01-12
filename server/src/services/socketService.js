const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
      }
    });

    this.rooms = new Map(); // 存储房间信息
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      const roomId = socket.handshake.query.roomId;
      const token = socket.handshake.auth.token;

      // 验证用户
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user;
      } catch (error) {
        socket.disconnect();
        return;
      }

      // 加入房间
      socket.join(roomId);
      this.updateViewers(roomId);

      // 处理消息
      socket.on('send-message', (data) => {
        this.handleMessage(socket, data);
      });

      // 处理礼物
      socket.on('send-gift', (data) => {
        this.handleGift(socket, data);
      });

      // 断开连接
      socket.on('disconnect', () => {
        socket.leave(roomId);
        this.updateViewers(roomId);
      });
    });
  }

  // 更新观众数量
  updateViewers(roomId) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    const viewerCount = room ? room.size : 0;
    this.io.to(roomId).emit('viewers-update', viewerCount);
  }

  // 处理消息
  handleMessage(socket, data) {
    const message = {
      content: data.content,
      type: data.type,
      sender: socket.user,
      timestamp: new Date()
    };
    this.io.to(data.roomId).emit('new-message', message);
  }

  // 处理礼物
  handleGift(socket, data) {
    // 处理礼物逻辑
  }
}

module.exports = SocketService; 