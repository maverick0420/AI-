const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // 需要创建app.js
const User = require('../models/userModel');

describe('用户API测试', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  beforeEach(async () => {
    // 清空测试数据
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 测试用户注册
  describe('POST /api/users/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('应该拒绝重复的邮箱注册', async () => {
      // 先创建一个用户
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'password123'
        });

      // 尝试使用相同邮箱注册
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'user2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('已被注册');
    });
  });

  // 测试用户登录
  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('应该成功登录', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('密码错误');
    });
  });

  // 测试更新用户信息
  describe('PUT /api/users/profile', () => {
    let token;

    beforeEach(async () => {
      // 创建用户并获取token
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      token = response.body.token;
    });

    it('应该成功更新用户信息', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
          avatar: 'new-avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('newusername');
    });

    it('未授权访问应该被拒绝', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          username: 'newusername'
        });

      expect(response.status).toBe(401);
    });
  });

  // 测试修改密码
  describe('PUT /api/users/change-password', () => {
    let token;

    beforeEach(async () => {
      // 创建用户并获取token
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      token = response.body.token;
    });

    it('应该成功修改密码', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('密码修改成功');

      // 验证新密码可以登录
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword123'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('错误的当前密码应该被拒绝', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('当前密码错误');
    });
  });
}); 