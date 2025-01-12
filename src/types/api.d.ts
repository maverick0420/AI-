import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    headers?: {
      Authorization?: string;
      [key: string]: any;
    };
  }
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
} 