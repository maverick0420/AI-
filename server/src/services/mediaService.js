const NodeMediaServer = require('node-media-server');
const path = require('path');
const fs = require('fs');

class MediaService {
  constructor() {
    this.config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: 8000,
        allow_origin: '*',
        mediaroot: './media', // 媒体文件存储路径
      },
      trans: {
        ffmpeg: '/usr/local/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            dash: true,
            dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
            // 添加录制配置
            record: true,
            recordFlags: '[f=flv:duration=3600]' // 每小时分割一次录制文件
          }
        ]
      }
    };

    this.nms = new NodeMediaServer(this.config);
    this.setupHooks();
  }

  setupHooks() {
    this.nms.on('prePublish', (id, StreamPath, args) => {
      // 验证推流密钥
      const streamKey = args.key;
      if (!this.validateStreamKey(streamKey)) {
        const session = this.nms.getSession(id);
        session.reject();
      }
    });

    this.nms.on('postPublish', (id, StreamPath, args) => {
      // 开始录制
      const roomId = StreamPath.split('/')[2];
      this.startRecording(roomId);
    });

    this.nms.on('donePublish', (id, StreamPath, args) => {
      // 结束录制
      const roomId = StreamPath.split('/')[2];
      this.stopRecording(roomId);
    });
  }

  startRecording(roomId) {
    const recordPath = path.join(this.config.http.mediaroot, 'records', roomId);
    if (!fs.existsSync(recordPath)) {
      fs.mkdirSync(recordPath, { recursive: true });
    }
  }

  stopRecording(roomId) {
    // 处理录制文件，可以上传到云存储等
  }

  validateStreamKey(key) {
    // 实现推流密钥验证逻辑
    return true;
  }

  run() {
    this.nms.run();
    console.log('Media Server is running');
  }
}

module.exports = new MediaService(); 