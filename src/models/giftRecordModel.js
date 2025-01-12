const mongoose = require('mongoose');

/**
 * 礼物记录模型
 * 记录礼物赠送的详细信息
 */
const giftRecordSchema = new mongoose.Schema({
  // 所属直播间
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveRoom',
    required: true
  },
  // 赠送者
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 接收者（主播）
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 礼物类型
  gift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift',
    required: true
  },
  // 礼物数量
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // 总价值
  totalPrice: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GiftRecord', giftRecordSchema); 