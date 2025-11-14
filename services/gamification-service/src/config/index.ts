import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.GAMIFICATION_SERVICE_PORT || '3005', 10),
  serviceName: process.env.SERVICE_NAME || 'gamification-service',

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
    db: parseInt(process.env.REDIS_DB || '3', 10),
  },

  // Authentication
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  },

  // External Services
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    quest: process.env.QUEST_SERVICE_URL || 'http://localhost:3004',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  },

  // XP System
  xp: {
    checkpoint: {
      easy: parseInt(process.env.XP_CHECKPOINT_EASY || '50', 10),
      medium: parseInt(process.env.XP_CHECKPOINT_MEDIUM || '100', 10),
      hard: parseInt(process.env.XP_CHECKPOINT_HARD || '200', 10),
      expert: parseInt(process.env.XP_CHECKPOINT_EXPERT || '400', 10),
    },
    quest: {
      easy: parseInt(process.env.XP_QUEST_EASY || '500', 10),
      medium: parseInt(process.env.XP_QUEST_MEDIUM || '1000', 10),
      hard: parseInt(process.env.XP_QUEST_HARD || '2000', 10),
      expert: parseInt(process.env.XP_QUEST_EXPERT || '4000', 10),
    },
    daily: {
      login: parseInt(process.env.XP_DAILY_LOGIN || '50', 10),
      firstQuest: parseInt(process.env.XP_FIRST_QUEST_DAILY || '200', 10),
    },
    activity: {
      socialShare: parseInt(process.env.XP_SOCIAL_SHARE || '25', 10),
      photoUpload: parseInt(process.env.XP_PHOTO_UPLOAD || '10', 10),
      questReview: parseInt(process.env.XP_QUEST_REVIEW || '50', 10),
      friendReferral: parseInt(process.env.XP_FRIEND_REFERRAL || '1000', 10),
    },
    bonus: {
      perfectCompletion: parseFloat(process.env.XP_PERFECT_COMPLETION_BONUS || '25') / 100,
      speedCompletion: parseFloat(process.env.XP_SPEED_COMPLETION_BONUS || '15') / 100,
      firstCompletion: parseFloat(process.env.XP_FIRST_COMPLETION_BONUS || '50') / 100,
      weekend: parseFloat(process.env.XP_WEEKEND_BONUS || '10') / 100,
    },
  },

  // Level System
  level: {
    baseXP: parseInt(process.env.LEVEL_BASE_XP || '1000', 10),
    growthRate: parseFloat(process.env.LEVEL_GROWTH_RATE || '1.15'),
    maxLevel: parseInt(process.env.MAX_LEVEL || '100', 10),
  },

  // Achievement System
  achievement: {
    xpReward: parseInt(process.env.ACHIEVEMENT_XP_REWARD || '100', 10),
  },

  // Leaderboard
  leaderboard: {
    pageSize: parseInt(process.env.LEADERBOARD_PAGE_SIZE || '50', 10),
    cacheTTL: parseInt(process.env.LEADERBOARD_CACHE_TTL || '300', 10),
    topN: parseInt(process.env.LEADERBOARD_TOP_N || '100', 10),
  },

  // Challenge System
  challenge: {
    resetHour: parseInt(process.env.CHALLENGE_RESET_HOUR || '0', 10),
    xpMultiplier: parseFloat(process.env.CHALLENGE_XP_MULTIPLIER || '1.5'),
  },

  // Streak System
  streak: {
    gracePeriodHours: parseInt(process.env.STREAK_GRACE_PERIOD_HOURS || '6', 10),
    maxFreezeCount: parseInt(process.env.STREAK_MAX_FREEZE_COUNT || '3', 10),
    xpPerDay: parseInt(process.env.STREAK_XP_PER_DAY || '50', 10),
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
