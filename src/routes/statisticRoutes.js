const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');
const auth = require('../middleware/authMiddleware');

// 获取直播间统计
router.get('/rooms/:roomId', auth, StatisticController.getRoomStats);

// 获取用户统计
router.get('/users/:userId', auth, StatisticController.getUserStats);

module.exports = router; 