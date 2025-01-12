declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      CORS_ORIGIN: string;
      MEDIA_SERVER_RTMP_PORT: string;
      MEDIA_SERVER_HTTP_PORT: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
    }
  }
} 