import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? '/api'  // Vercel 部署时使用相对路径
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

export default api; 