import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  isStreamer: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      message.success('登录成功');
    } catch (error) {
      message.error('登录失败');
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      message.success('注册成功');
    } catch (error) {
      message.error('注册失败');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('已退出登录');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data.user);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth }; 