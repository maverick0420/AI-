const Redis = require('ioredis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (error) => {
      logger.error('Redis错误:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis连接成功');
    });
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expireTime = 3600) {
    try {
      await this.client.set(
        key,
        JSON.stringify(value),
        'EX',
        expireTime
      );
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  // 批量获取
  async mget(keys) {
    try {
      const values = await this.client.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  // 设置哈希表
  async hset(key, field, value) {
    try {
      await this.client.hset(
        key,
        field,
        JSON.stringify(value)
      );
      return true;
    } catch (error) {
      logger.error('Cache hset error:', error);
      return false;
    }
  }

  // 获取哈希表字段
  async hget(key, field) {
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache hget error:', error);
      return null;
    }
  }

  // 清除缓存
  async flush() {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = new CacheService(); 