const CDN_CONFIG = {
  provider: 'cloudflare', // 或其他 CDN 提供商
  endpoints: {
    rtmp: 'rtmp://live-push.yourcdn.com/live',
    hls: 'https://live-pull.yourcdn.com/live',
    flv: 'https://live-pull.yourcdn.com/live'
  },
  auth: {
    key: process.env.CDN_AUTH_KEY,
    secret: process.env.CDN_AUTH_SECRET
  }
};

module.exports = CDN_CONFIG; 