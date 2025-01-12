const mongoose = require('mongoose');

/**
 * 直播间模型
 * 管理直播间的基本信息、状态和统计数据
 */
const liveRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  // 直播间状态：准备中、直播中、已结束
  status: {
    type: String,
    enum: ['preparing', 'live', 'ended'],
    default: 'preparing'
  },
  // 推流密钥，用于OBS等推流软件
  streamKey: {
    type: String,
    unique: true
  },
  // 当前观看人数
  viewers: {
    type: Number,
    default: 0
  },
  // 直播分类
  category: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LiveRoom', liveRoomSchema); 