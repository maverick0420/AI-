import { LiveRoom, User, Gift } from '../types';

interface LiveStats {
  viewers: number;
  duration: number;
  gifts: Gift[];
  totalIncome: number;
  maxViewers: number;
  messages: number;
}

class StatisticService {
  private stats: Map<string, LiveStats> = new Map();

  initRoom(roomId: string) {
    this.stats.set(roomId, {
      viewers: 0,
      duration: 0,
      gifts: [],
      totalIncome: 0,
      maxViewers: 0,
      messages: 0
    });
  }

  updateViewers(roomId: string, count: number) {
    const stats = this.stats.get(roomId);
    if (stats) {
      stats.viewers = count;
      stats.maxViewers = Math.max(stats.maxViewers, count);
    }
  }

  addGift(roomId: string, gift: Gift) {
    const stats = this.stats.get(roomId);
    if (stats) {
      stats.gifts.push(gift);
      stats.totalIncome += gift.price;
    }
  }

  incrementMessages(roomId: string) {
    const stats = this.stats.get(roomId);
    if (stats) {
      stats.messages += 1;
    }
  }

  getRoomStats(roomId: string): LiveStats | null {
    return this.stats.get(roomId) || null;
  }
}

export const statisticService = new StatisticService(); 