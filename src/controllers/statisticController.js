const statisticService = require('../services/statisticService');
const logger = require('../utils/logger');

const StatisticController = {
  /**
   * 获取直播间统计数据
   */
  async getRoomStats(req, res) {
    try {
      const { roomId } = req.params;
      const { startDate, endDate, type } = req.query;

      const stats = await statisticService.getRoomStats(roomId, {
        startDate,
        endDate,
        type
      });

      res.json({ stats });
    } catch (error) {
      logger.error('获取直播间统计失败:', error);
      res.status(500).json({
        message: '获取统计数据失败'
      });
    }
  },

  /**
   * 获取用户统计数据
   */
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await statisticService.getUserStats(userId, {
        startDate,
        endDate
      });

      res.json({ stats });
    } catch (error) {
      logger.error('获取用户统计失败:', error);
      res.status(500).json({
        message: '获取统计数据失败'
      });
    }
  }
};

module.exports = StatisticController; 