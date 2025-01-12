const Statistic = require('../models/statisticModel');
const LiveRoom = require('../models/liveRoomModel');
const GiftRecord = require('../models/giftRecordModel');
const ChatMessage = require('../models/chatMessageModel');
const logger = require('../utils/logger');
const cacheService = require('./cacheService');

/**
 * 统计服务类
 * 处理数据统计和分析
 */
class StatisticService {
  /**
   * 更新直播间实时统计
   * @param {string} roomId - 直播间ID
   * @param {Object} data - 统计数据
   */
  async updateRoomRealtime(roomId, data) {
    const cacheKey = `room:stats:${roomId}`;
    try {
      const stats = await cacheService.hget(cacheKey, 'realtime') || {
        viewers: 0,
        messages: 0,
        gifts: 0,
        startTime: Date.now()
      };

      // 更新统计数据
      Object.assign(stats, data);
      await cacheService.hset(cacheKey, 'realtime', stats);
    } catch (error) {
      logger.error('更新直播间实时统计失败:', error);
    }
  }

  /**
   * 生成直播间日统计
   * @param {string} roomId - 直播间ID
   * @param {Date} date - 统计日期
   */
  async generateRoomDailyStats(roomId, date) {
    try {
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      // 获取礼物统计
      const giftStats = await GiftRecord.aggregate([
        {
          $match: {
            roomId: mongoose.Types.ObjectId(roomId),
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: '$quantity' },
            value: { $sum: '$totalPrice' },
            uniqueSenders: { $addToSet: '$sender' }
          }
        }
      ]);

      // 获取消息统计
      const messageCount = await ChatMessage.countDocuments({
        roomId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      // 获取缓存的实时数据
      const cacheKey = `room:stats:${roomId}`;
      const realtimeStats = await cacheService.hget(cacheKey, 'realtime') || {};

      // 创建或更新统计记录
      await Statistic.findOneAndUpdate(
        {
          targetId: roomId,
          targetType: 'LiveRoom',
          date: startOfDay
        },
        {
          viewerStats: {
            peak: realtimeStats.peakViewers || 0,
            total: realtimeStats.totalViewers || 0,
            average: realtimeStats.averageViewers || 0
          },
          giftStats: {
            count: giftStats[0]?.count || 0,
            value: giftStats[0]?.value || 0,
            uniqueSenders: giftStats[0]?.uniqueSenders?.length || 0
          },
          duration: realtimeStats.duration || 0,
          interactionStats: {
            messages: messageCount,
            likes: realtimeStats.likes || 0,
            shares: realtimeStats.shares || 0
          }
        },
        { upsert: true }
      );

      // 清除缓存的实时数据
      await cacheService.del(cacheKey);
    } catch (error) {
      logger.error('生成直播间日统计失败:', error);
    }
  }

  /**
   * 获取直播间统计数据
   * @param {string} roomId - 直播间ID
   * @param {Object} options - 查询选项
   */
  async getRoomStats(roomId, options = {}) {
    try {
      const { startDate, endDate, type = 'daily' } = options;
      const query = {
        targetId: roomId,
        targetType: 'LiveRoom'
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const stats = await Statistic.find(query).sort({ date: 1 });
      return stats;
    } catch (error) {
      logger.error('获取直播间统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计数据
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   */
  async getUserStats(userId, options = {}) {
    try {
      const { startDate, endDate } = options;
      const query = {
        targetId: userId,
        targetType: 'User'
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const stats = await Statistic.find(query).sort({ date: 1 });
      return stats;
    } catch (error) {
      logger.error('获取用户统计数据失败:', error);
      throw error;
    }
  }
}

module.exports = new StatisticService(); 