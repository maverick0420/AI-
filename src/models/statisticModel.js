const mongoose = require('mongoose');

/**
 * 统计数据模型
 * 记录直播间和用户的各项统计数据
 */
const statisticSchema = new mongoose.Schema({
  // 关联的对象（直播间或用户）
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  // 目标类型（LiveRoom/User）
  targetType: {
    type: String,
    required: true,
    enum: ['LiveRoom', 'User']
  },
  // 统计日期
  date: {
    type: Date,
    required: true
  },
  // 观看人数统计
  viewerStats: {
    peak: { type: Number, default: 0 }, // 峰值观众
    total: { type: Number, default: 0 }, // 累计观众
    average: { type: Number, default: 0 } // 平均观众
  },
  // 礼物统计
  giftStats: {
    count: { type: Number, default: 0 }, // 礼物数量
    value: { type: Number, default: 0 }, // 礼物价值
    uniqueSenders: { type: Number, default: 0 } // 独立赠送人数
  },
  // 直播时长（分钟）
  duration: {
    type: Number,
    default: 0
  },
  // 互动统计
  interactionStats: {
    messages: { type: Number, default: 0 }, // 消息数
    likes: { type: Number, default: 0 }, // 点赞数
    shares: { type: Number, default: 0 } // 分享数
  }
}, {
  timestamps: true
});

// 创建复合索引
statisticSchema.index({ targetId: 1, date: 1 });
statisticSchema.index({ targetType: 1, date: 1 });

module.exports = mongoose.model('Statistic', statisticSchema); 