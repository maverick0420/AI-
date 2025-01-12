declare module 'flv.js' {
  export interface FlvPlayer {
    attachMediaElement(element: HTMLMediaElement): void;
    load(): void;
    play(): void;
    pause(): void;
    destroy(): void;
  }

  export interface FlvConfig {
    type: string;
    url: string;
    isLive?: boolean;
    cors?: boolean;
    withCredentials?: boolean;
  }

  export interface FlvJs {
    createPlayer(config: FlvConfig): FlvPlayer;
    isSupported(): boolean;
  }

  const flvjs: FlvJs;
  export default flvjs;
} 