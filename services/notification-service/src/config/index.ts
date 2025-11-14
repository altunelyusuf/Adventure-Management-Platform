import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3008', 10),
  serviceName: process.env.SERVICE_NAME || 'notification-service',

  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'adventure_user',
    password: process.env.POSTGRES_PASSWORD || 'adventure_pass',
    database: process.env.POSTGRES_DB || 'adventure_platform',
    ssl: process.env.POSTGRES_SSL === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '6', 10),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
  },

  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3003',

  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@adventure-platform.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Adventure Platform',
  },

  fcm: {
    projectId: process.env.FCM_PROJECT_ID,
    privateKey: process.env.FCM_PRIVATE_KEY,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
  },

  notifications: {
    maxPerUser: parseInt(process.env.MAX_NOTIFICATIONS_PER_USER || '1000', 10),
    retentionDays: parseInt(process.env.NOTIFICATION_RETENTION_DAYS || '90', 10),
    enableEmail: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
    enablePush: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
    enableInApp: process.env.ENABLE_IN_APP_NOTIFICATIONS !== 'false',
  },
};

export default config;
