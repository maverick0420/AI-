import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types/api';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://aty-live.vercel.app/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true
});

// 添加请求拦截器
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 