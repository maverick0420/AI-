const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const logger = require('../utils/logger');

const securityMiddleware = (app) => {
  // 添加基本安全头
  app.use(helmet());

  // 配置CORS
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('不允许的来源'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24小时
  }));

  // API请求限制
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 100次请求
    message: '请求过于频繁，请稍后再试',
    handler: (req, res) => {
      logger.warn({
        type: 'rate_limit_exceeded',
        ip: req.ip,
        path: req.path
      });
      res.status(429).json({
        message: '请求过于频繁，请稍后再试'
      });
    }
  });
  app.use('/api/', apiLimiter);

  // 登录请求限制
  const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5, // 限制每个IP 5次失败尝试
    message: '登录失败次数过多，请稍后再试',
    handler: (req, res) => {
      logger.warn({
        type: 'login_attempt_limit_exceeded',
        ip: req.ip
      });
      res.status(429).json({
        message: '登录失败次数过多，请稍后再试'
      });
    }
  });
  app.use('/api/users/login', loginLimiter);

  // 防止 XSS 攻击
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 防止点击劫持
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
};

module.exports = securityMiddleware; 