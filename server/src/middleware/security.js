const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const securityMiddleware = (app) => {
  // 基础安全头
  app.use(helmet());

  // API 限流
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 100次请求
  });
  app.use('/api/', limiter);
};

module.exports = securityMiddleware; 