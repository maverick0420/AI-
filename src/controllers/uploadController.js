const uploadService = require('../services/uploadService');
const path = require('path');
const logger = require('../utils/logger');

const UploadController = {
  /**
   * 上传头像
   */
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: '请选择要上传的文件'
        });
      }

      const ossPath = uploadService.generateOSSPath(
        'avatars',
        path.basename(req.file.path)
      );

      const url = await uploadService.uploadToOSS(req.file.path, ossPath);

      // 如果用户之前有头像，删除旧头像
      if (req.user.avatar && !req.user.avatar.includes('default-avatar')) {
        const oldPath = req.user.avatar.split('/').slice(-3).join('/');
        await uploadService.deleteFromOSS(oldPath);
      }

      // 更新用户头像
      req.user.avatar = url;
      await req.user.save();

      res.json({
        message: '头像上传成功',
        url
      });
    } catch (error) {
      logger.error('上传头像失败:', error);
      res.status(500).json({
        message: '文件上传失败'
      });
    }
  },

  /**
   * 上传直播间封面
   */
  async uploadCover(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: '请选择要上传的文件'
        });
      }

      const ossPath = uploadService.generateOSSPath(
        'covers',
        path.basename(req.file.path)
      );

      const url = await uploadService.uploadToOSS(req.file.path, ossPath);

      res.json({
        message: '封面上传成功',
        url
      });
    } catch (error) {
      logger.error('上传封面失败:', error);
      res.status(500).json({
        message: '文件上传失败'
      });
    }
  }
};

module.exports = UploadController; 