const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // 记录错误
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // MongoDB验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: '数据验证错误',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB重复键错误
  if (err.code === 11000) {
    return res.status(400).json({
      message: '数据重复错误',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // JWT认证错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: '无效的认证令牌'
    });
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: '认证令牌已过期'
    });
  }

  // 默认服务器错误
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// 捕获未处理的Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise rejection:', reason);
});

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  logger.error('未处理的异常:', error);
  // 给进程一点时间来记录日志后退出
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = errorHandler; 