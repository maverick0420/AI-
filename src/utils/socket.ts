import { io, Socket } from 'socket.io-client';
import EventEmitter from 'eventemitter3';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_WS_URL: string;
    }
  }
}

class SocketClient extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    super();
  }

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('max_reconnect_attempts');
      }
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('join-room', roomId);
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave-room', roomId);
  }

  sendMessage(roomId: string, content: string, type: string = 'text') {
    if (!this.socket?.connected) return;
    this.socket.emit('send-message', { roomId, content, type });
  }

  onMessage(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('new-message', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('user-left', callback);
  }

  onGiftReceived(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('gift-received', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) return;
    this.socket.emit(event, data);
  }

  sendGift(roomId: string, gift: any, sender: any) {
    this.emit('send-gift', { roomId, gift, sender });
  }
}

export default new SocketClient(); 