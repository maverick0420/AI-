import request from '../utils/request';
import { Gift } from '../types';

export interface SendGiftParams {
  giftId: string;
  roomId: string;
  receiverId: string;
}

export const giftApi = {
  getGifts: () => {
    return request.get<{ gifts: Gift[] }>('/gifts');
  },

  sendGift: (data: SendGiftParams) => {
    return request.post<{ message: string }>('/gifts/send', data);
  }
}; 