import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.SOCIAL_SERVICE_PORT || '3006', 10),
  serviceName: process.env.SERVICE_NAME || 'social-service',

  // Database
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'adventure_user',
    password: process.env.POSTGRES_PASSWORD || 'adventure_pass',
    database: process.env.POSTGRES_DB || 'adventure_platform',
    ssl: process.env.POSTGRES_SSL === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '4', 10),
  },

  // Authentication
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  },

  // External Services
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    quest: process.env.QUEST_SERVICE_URL || 'http://localhost:3004',
    gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3005',
  },

  // Friend System
  friends: {
    maxFriends: parseInt(process.env.MAX_FRIENDS || '500', 10),
    requestExpiryDays: parseInt(process.env.FRIEND_REQUEST_EXPIRY_DAYS || '30', 10),
    maxPendingRequests: parseInt(process.env.MAX_PENDING_REQUESTS || '50', 10),
  },

  // Activity Feed
  feed: {
    pageSize: parseInt(process.env.FEED_PAGE_SIZE || '20', 10),
    maxFeedItems: parseInt(process.env.MAX_FEED_ITEMS || '1000', 10),
    retentionDays: parseInt(process.env.ACTIVITY_RETENTION_DAYS || '90', 10),
  },

  // Interaction
  interaction: {
    maxCommentLength: parseInt(process.env.MAX_COMMENT_LENGTH || '500', 10),
    enableNestedComments: process.env.ENABLE_NESTED_COMMENTS !== 'false',
    maxCommentDepth: parseInt(process.env.MAX_COMMENT_DEPTH || '3', 10),
  },

  // Notification
  notification: {
    enablePush: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100', 10),
  },

  // Follow System
  follow: {
    enabled: process.env.ENABLE_FOLLOW_SYSTEM !== 'false',
    maxFollowing: parseInt(process.env.MAX_FOLLOWING || '1000', 10),
  },

  // Privacy
  privacy: {
    defaultVisibility: process.env.DEFAULT_PROFILE_VISIBILITY || 'PUBLIC',
    allowAnonymous: process.env.ALLOW_ANONYMOUS_VIEWING === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
