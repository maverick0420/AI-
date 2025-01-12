const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// 配置 CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 配置 Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// 解析 JSON
app.use(express.json());

// 测试路由
app.get('/api/rooms', (req, res) => {
  // 模拟数据
  const rooms = [
    {
      id: '1',
      title: '测试直播间',
      description: '这是一个测试直播间',
      coverImage: 'https://via.placeholder.com/300x200',
      status: 'live',
      host: {
        id: '1',
        username: '测试主播',
        avatar: 'https://via.placeholder.com/100'
      },
      viewers: 100
    }
  ];
  res.json({ rooms });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 