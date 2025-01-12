const mongoose = require('mongoose');

/**
 * 关注系统模型
 * 管理用户之间的关注关系
 */
const followSchema = new mongoose.Schema({
  // 关注者
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 被关注者
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建复合唯一索引，确保不能重复关注
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema); 