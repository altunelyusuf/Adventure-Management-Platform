import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.QUEST_SERVICE_PORT || '3004', 10),

  // Database
  database: {
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
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '2', 10),
  },

  // Authentication
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  },

  // External Services
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  },

  // Quest Configuration
  quest: {
    minCheckpoints: parseInt(process.env.MIN_CHECKPOINTS || '3', 10),
    maxCheckpoints: parseInt(process.env.MAX_CHECKPOINTS || '50', 10),
    defaultCheckpointRadius: parseInt(process.env.DEFAULT_CHECKPOINT_RADIUS || '50', 10),
    maxQuestDistanceKm: parseInt(process.env.MAX_QUEST_DISTANCE_KM || '100', 10),
  },

  // Geospatial
  geospatial: {
    defaultSearchRadiusKm: parseInt(process.env.DEFAULT_SEARCH_RADIUS_KM || '50', 10),
    maxSearchRadiusKm: parseInt(process.env.MAX_SEARCH_RADIUS_KM || '500', 10),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
