export interface Room {
  id: string;
  title: string;
  coverImage: string;
  status: 'preparing' | 'live' | 'ended';
  viewers: number;
  host: {
    username: string;
  };
}

export interface GiftRecord {
  id: string;
  gift: {
    name: string;
    icon: string;
    price: number;
  };
  receiver: {
    username: string;
  };
  createdAt: string;
} 