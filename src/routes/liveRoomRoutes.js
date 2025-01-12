const express = require('express');
const router = express.Router();
const LiveRoomController = require('../controllers/liveRoomController');
const auth = require('../middleware/authMiddleware');

// 公开路由
router.get('/', LiveRoomController.getList);
router.get('/:id', LiveRoomController.getDetail);

// 需要认证的路由
router.post('/', auth, LiveRoomController.create);
router.put('/:id', auth, LiveRoomController.update);
router.post('/:id/start', auth, LiveRoomController.startLive);
router.post('/:id/end', auth, LiveRoomController.endLive);

// 获取聊天记录
router.get('/:roomId/chat', auth, LiveRoomController.getChatHistory);

// 获取推拉流地址
router.get('/:id/stream', auth, LiveRoomController.getStreamUrls);

module.exports = router; 