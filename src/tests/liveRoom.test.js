const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/userModel');
const LiveRoom = require('../models/liveRoomModel');

describe('直播间API测试', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  beforeEach(async () => {
    // 清空测试数据
    await User.deleteMany({});
    await LiveRoom.deleteMany({});

    // 创建测试用户并获取token
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    token = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 测试创建直播间
  describe('POST /api/rooms', () => {
    it('应该成功创建直播间', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '测试直播间',
          description: '这是一个测试直播间',
          category: '游戏'
        });

      expect(response.status).toBe(201);
      expect(response.body.liveRoom).toHaveProperty('title', '测试直播间');
      expect(response.body.liveRoom).toHaveProperty('streamKey');
    });

    it('未认证用户不能创建直播间', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({
          title: '测试直播间',
          category: '游戏'
        });

      expect(response.status).toBe(401);
    });

    it('标题为空时不能创建直播间', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: '这是一个测试直播间',
          category: '游戏'
        });

      expect(response.status).toBe(400);
    });
  });

  // 测试获取直播间列表
  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      // 创建测试直播间
      await LiveRoom.create([
        {
          title: '直播间1',
          category: '游戏',
          host: userId,
          streamKey: 'key1'
        },
        {
          title: '直播间2',
          category: '音乐',
          host: userId,
          streamKey: 'key2'
        }
      ]);
    });

    it('应该获取所有直播间列表', async () => {
      const response = await request(app).get('/api/rooms');

      expect(response.status).toBe(200);
      expect(response.body.rooms).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('total', 2);
    });

    it('应该按类别筛选直播间', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .query({ category: '游戏' });

      expect(response.status).toBe(200);
      expect(response.body.rooms).toHaveLength(1);
      expect(response.body.rooms[0].category).toBe('游戏');
    });
  });

  // 测试获取直播间详情
  describe('GET /api/rooms/:id', () => {
    let roomId;

    beforeEach(async () => {
      // 创建测试直播间
      const room = await LiveRoom.create({
        title: '测试直播间',
        category: '游戏',
        host: userId,
        streamKey: 'testkey'
      });
      roomId = room._id;
    });

    it('应该获取直播间详情', async () => {
      const response = await request(app)
        .get(`/api/rooms/${roomId}`);

      expect(response.status).toBe(200);
      expect(response.body.room).toHaveProperty('title', '测试直播间');
      expect(response.body.room.host).toHaveProperty('username', 'testuser');
    });

    it('不存在的直播间ID应返回404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/rooms/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  // 测试更新直播间
  describe('PUT /api/rooms/:id', () => {
    let roomId;

    beforeEach(async () => {
      // 创建测试直播间
      const room = await LiveRoom.create({
        title: '测试直播间',
        category: '游戏',
        host: userId,
        streamKey: 'testkey'
      });
      roomId = room._id;
    });

    it('主播应该能更新自己的直播间', async () => {
      const response = await request(app)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '新标题',
          description: '新描述'
        });

      expect(response.status).toBe(200);
      expect(response.body.room.title).toBe('新标题');
    });

    it('非主播不能更新直播间', async () => {
      // 创建另一个用户
      const otherUser = await request(app)
        .post('/api/users/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .send({
          title: '新标题'
        });

      expect(response.status).toBe(403);
    });
  });

  // 测试开始和结束直播
  describe('直播状态控制', () => {
    let roomId;

    beforeEach(async () => {
      // 创建测试直播间
      const room = await LiveRoom.create({
        title: '测试直播间',
        category: '游戏',
        host: userId,
        streamKey: 'testkey'
      });
      roomId = room._id;
    });

    it('主播应该能开始直播', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.room.status).toBe('live');
    });

    it('主播应该能结束直播', async () => {
      // 先开始直播
      await request(app)
        .post(`/api/rooms/${roomId}/start`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .post(`/api/rooms/${roomId}/end`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.room.status).toBe('ended');
    });
  });
}); 