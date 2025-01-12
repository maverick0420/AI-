// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  balance: number;
  isStreamer: boolean;
}

// 直播间相关类型
export interface LiveRoom {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  status: 'preparing' | 'live' | 'ended';
  streamKey: string;
  host: User;
  viewers: number;
  category: string;
}

// 消息相关类型
export interface Message {
  id: string;
  content: string;
  type: 'text' | 'gift';
  sender?: User;
  createdAt: string;
}

// 礼物相关类型
export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
} 