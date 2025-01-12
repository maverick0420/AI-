const express = require('express');
const router = express.Router();
const GiftController = require('../controllers/giftController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// 公开路由
router.get('/', GiftController.getList);

// 需要认证的路由
router.post('/send', auth, GiftController.sendGift);
router.get('/records/:roomId', auth, GiftController.getRecords);

// 管理员路由
router.post('/', auth, admin, GiftController.create);

module.exports = router; 