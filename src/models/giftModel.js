const mongoose = require('mongoose');

/**
 * 礼物模型
 * 定义平台支持的礼物类型
 */
const giftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // 礼物价格（平台币）
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // 礼物图标URL
  icon: {
    type: String,
    required: true
  },
  // 礼物动画效果URL
  animation: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  // 礼物是否可用
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Gift', giftSchema); 