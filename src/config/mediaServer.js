const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: 'https://www.aty.live'
  },
  https: {
    port: 8443,
    key: '/etc/letsencrypt/live/cdn.aty.live/privkey.pem',
    cert: '/etc/letsencrypt/live/cdn.aty.live/fullchain.pem'
  }
};

const nms = new NodeMediaServer(config);

module.exports = nms; 