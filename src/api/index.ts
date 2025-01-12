import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://aty-live.vercel.app/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true
});

// 添加请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 