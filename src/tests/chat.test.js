const request = require('supertest');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const app = require('../app');
const User = require('../models/userModel');
const LiveRoom = require('../models/liveRoomModel');
const ChatMessage = require('../models/chatMessageModel');

describe('聊天功能测试', () => {
  let httpServer;
  let io;
  let clientSocket;
  let token;
  let roomId;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    httpServer = createServer(app);
    io = new Server(httpServer);
    httpServer.listen();

    // 创建测试用户
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    token = response.body.token;
    userId = response.body.user.id;

    // 创建测试直播间
    const roomResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '测试直播间',
        category: '测试'
      });

    roomId = roomResponse.body.liveRoom.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (clientSocket) {
      clientSocket.close();
    }
    httpServer.close();
  });

  beforeEach(async () => {
    await ChatMessage.deleteMany({});
    clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
      auth: { token }
    });
    await new Promise((resolve) => {
      clientSocket.on('connect', resolve);
    });
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.close();
    }
  });

  // 测试加入直播间
  it('应该成功加入直播间', (done) => {
    clientSocket.emit('join-room', roomId);
    clientSocket.on('user-joined', (data) => {
      expect(data.user.username).toBe('testuser');
      expect(data.viewers).toBe(1);
      done();
    });
  });

  // 测试发送消息
  it('应该成功发送和接收消息', (done) => {
    clientSocket.emit('join-room', roomId);
    
    clientSocket.emit('send-message', {
      roomId,
      content: '测试消息',
      type: 'text'
    });

    clientSocket.on('new-message', (data) => {
      expect(data.message.content).toBe('测试消息');
      expect(data.message.type).toBe('text');
      expect(data.message.sender.username).toBe('testuser');
      done();
    });
  });

  // 测试获取聊天历史
  it('应该成功获取聊天历史', async () => {
    // 先创建一些测试消息
    await ChatMessage.create([
      {
        roomId,
        sender: userId,
        content: '消息1',
        type: 'text'
      },
      {
        roomId,
        sender: userId,
        content: '消息2',
        type: 'text'
      }
    ]);

    const response = await request(app)
      .get(`/api/rooms/${roomId}/chat`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.messages).toHaveLength(2);
    expect(response.body.pagination.total).toBe(2);
  });

  // 测试离开直播间
  it('应该成功离开直播间', (done) => {
    clientSocket.emit('join-room', roomId);
    
    setTimeout(() => {
      clientSocket.emit('leave-room', roomId);
    }, 100);

    clientSocket.on('user-left', (data) => {
      expect(data.user.username).toBe('testuser');
      expect(data.viewers).toBe(0);
      done();
    });
  });

  // 测试错误处理
  it('应该处理无效的直播间ID', (done) => {
    const invalidRoomId = new mongoose.Types.ObjectId();
    clientSocket.emit('join-room', invalidRoomId);

    clientSocket.on('error', (data) => {
      expect(data.message).toBe('直播间不存在');
      done();
    });
  });
}); 