const mongoose = require('mongoose');

/**
 * 用户模型
 * 存储用户基本信息、账户余额和交易统计
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // 用户余额，用于礼物系统
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  // 收到的礼物总价值
  totalReceived: {
    type: Number,
    default: 0
  },
  // 发送的礼物总价值
  totalSent: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema); 