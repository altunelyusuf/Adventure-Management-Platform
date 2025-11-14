import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.GATEWAY_PORT || '3000', 10),
  serviceName: process.env.SERVICE_NAME || 'api-gateway',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '8', 10),
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    quest: process.env.QUEST_SERVICE_URL || 'http://localhost:3004',
    gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3005',
    social: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3006',
    geospatial: process.env.GEOSPATIAL_SERVICE_URL || 'http://localhost:3007',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3009',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS !== 'false',
  },

  request: {
    maxSize: process.env.MAX_REQUEST_SIZE || '10mb',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
  },

  security: {
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    trustProxy: process.env.TRUST_PROXY === 'true',
  },
};

export default config;
