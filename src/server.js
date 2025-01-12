const app = require('./app');
const http = require('http');
const connectDB = require('./config/database');
const SocketService = require('./services/socketService');
const mediaService = require('./services/mediaService');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// 创建HTTP服务器
const server = http.createServer(app);

// 连接数据库
connectDB();

// 初始化WebSocket服务
const socketService = new SocketService(server);

// 将socketService添加到app以便其他地方使用
app.set('socketService', socketService);

// 启动流媒体服务
mediaService.run();

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 