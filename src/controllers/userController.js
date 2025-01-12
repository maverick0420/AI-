const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserController = {
  // 用户注册
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      
      // 验证用户输入
      if (!username || !password || !email) {
        return res.status(400).json({ 
          message: '请填写完整的注册信息' 
        });
      }
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: '用户名或邮箱已被注册' 
        });
      }
      
      // 创建新用户
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword
      });
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 用户登录
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: '用户不存在' 
        });
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: '密码错误' 
        });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: '登录成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: '服务器错误，请稍后重试' 
      });
    }
  },

  // 更新用户信息
  async updateProfile(req, res) {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['username', 'email', 'avatar'];
      const isValidOperation = updates.every(update => 
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({ message: '无效的更新字段' });
      }

      // 检查用户名或邮箱是否已被使用
      if (req.body.username || req.body.email) {
        const existingUser = await User.findOne({
          $and: [
            { _id: { $ne: req.user._id } },
            {
              $or: [
                { username: req.body.username },
                { email: req.body.email }
              ]
            }
          ]
        });

        if (existingUser) {
          return res.status(400).json({ 
            message: '用户名或邮箱已被使用' 
          });
        }
      }

      updates.forEach(update => {
        req.user[update] = req.body[update];
      });
      
      await req.user.save();
      
      res.json({
        message: '更新成功',
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          avatar: req.user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
  },

  // 修改密码
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: '请提供当前密码和新密码' 
        });
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(
        currentPassword, 
        req.user.password
      );

      if (!isValidPassword) {
        return res.status(401).json({ message: '当前密码错误' });
      }

      // 更新为新密码
      req.user.password = await bcrypt.hash(newPassword, 10);
      await req.user.save();

      res.json({ message: '密码修改成功' });
    } catch (error) {
      res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
  }
};

module.exports = UserController; 