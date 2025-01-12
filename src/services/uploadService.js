const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const OSS = require('ali-oss');
const config = require('../config/uploadConfig');
const logger = require('../utils/logger');

/**
 * 文件上传服务
 * 支持本地存储和阿里云OSS
 */
class UploadService {
  constructor() {
    // 创建OSS客户端
    this.ossClient = new OSS(config.alioss);
    this.initialize();
  }

  /**
   * 初始化上传服务
   */
  async initialize() {
    try {
      // 确保上传目录存在
      await fs.mkdir(config.local.uploadDir, { recursive: true });
      await fs.mkdir(config.local.tempDir, { recursive: true });
    } catch (error) {
      logger.error('创建上传目录失败:', error);
    }
  }

  /**
   * 获取Multer配置
   * @param {string} type - 文件类型（avatar/cover）
   * @returns {Object} Multer配置对象
   */
  getMulterConfig(type) {
    const limits = config.limits[type];

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, config.local.tempDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const fileFilter = (req, file, cb) => {
      if (!limits.allowedTypes.includes(file.mimetype)) {
        cb(new Error('不支持的文件类型'), false);
        return;
      }
      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: limits.maxSize
      }
    });
  }

  /**
   * 上传文件到OSS
   * @param {string} localPath - 本地文件路径
   * @param {string} ossPath - OSS存储路径
   * @returns {Promise<string>} 文件的访问URL
   */
  async uploadToOSS(localPath, ossPath) {
    try {
      const result = await this.ossClient.put(ossPath, localPath);
      await fs.unlink(localPath); // 删除临时文件
      return result.url;
    } catch (error) {
      logger.error('上传文件到OSS失败:', error);
      throw new Error('文件上传失败');
    }
  }

  /**
   * 删除OSS文件
   * @param {string} ossPath - OSS文件路径
   */
  async deleteFromOSS(ossPath) {
    try {
      await this.ossClient.delete(ossPath);
    } catch (error) {
      logger.error('删除OSS文件失败:', error);
    }
  }

  /**
   * 生成OSS路径
   * @param {string} type - 文件类型
   * @param {string} filename - 文件名
   * @returns {string} OSS路径
   */
  generateOSSPath(type, filename) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${type}/${year}/${month}/${filename}`;
  }
}

module.exports = new UploadService(); 