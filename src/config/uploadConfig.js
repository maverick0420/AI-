/**
 * 文件上传配置
 */
module.exports = {
  // 本地存储配置
  local: {
    uploadDir: 'uploads',
    tempDir: 'uploads/temp',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    imageTypes: ['jpg', 'jpeg', 'png', 'gif']
  },

  // 阿里云OSS配置
  alioss: {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT,
    timeout: 60000,
    secure: true
  },

  // 文件类型限制
  limits: {
    avatar: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png']
    },
    cover: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png']
    }
  }
}; 