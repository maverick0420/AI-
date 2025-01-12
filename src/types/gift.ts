export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    username: string;
  };
  timestamp: Date;
} 