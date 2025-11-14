import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PAYMENT_SERVICE_PORT || '3009', 10),
  serviceName: process.env.SERVICE_NAME || 'payment-service',

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
    db: parseInt(process.env.REDIS_DB || '7', 10),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
  },

  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2023-10-16' as const,
  },

  payment: {
    platformFeePercentage: parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '30', 10),
    creatorSharePercentage: parseInt(process.env.CREATOR_SHARE_PERCENTAGE || '70', 10),
    currency: process.env.CURRENCY || 'USD',
    minSubscriptionPrice: parseFloat(process.env.MIN_SUBSCRIPTION_PRICE || '4.99'),
    maxSubscriptionPrice: parseFloat(process.env.MAX_SUBSCRIPTION_PRICE || '99.99'),
  },

  payout: {
    minAmount: parseFloat(process.env.MIN_PAYOUT_AMOUNT || '50.00'),
    schedule: process.env.PAYOUT_SCHEDULE || 'monthly',
    autoPayoutEnabled: process.env.AUTO_PAYOUT_ENABLED !== 'false',
  },
};

export default config;
