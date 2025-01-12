import request from '../utils/request';
import { User } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export const userApi = {
  login: (data: LoginParams) => {
    return request.post<{ token: string; user: User }>('/users/login', data);
  },

  register: (data: RegisterParams) => {
    return request.post<{ message: string }>('/users/register', data);
  },

  getCurrentUser: () => {
    return request.get<{ user: User }>('/users/me');
  },

  updateProfile: (data: Partial<User>) => {
    return request.put<{ user: User }>('/users/profile', data);
  }
}; 