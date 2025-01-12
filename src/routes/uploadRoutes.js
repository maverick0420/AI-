const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const uploadService = require('../services/uploadService');
const auth = require('../middleware/authMiddleware');

// 上传头像
router.post('/avatar', 
  auth, 
  uploadService.getMulterConfig('avatar').single('avatar'),
  UploadController.uploadAvatar
);

// 上传直播间封面
router.post('/cover',
  auth,
  uploadService.getMulterConfig('cover').single('cover'),
  UploadController.uploadCover
);

module.exports = router; 