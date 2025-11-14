import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.GEOSPATIAL_SERVICE_PORT || '3007', 10),
  serviceName: process.env.SERVICE_NAME || 'geospatial-service',

  // PostgreSQL
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'adventure_user',
    password: process.env.POSTGRES_PASSWORD || 'adventure_pass',
    database: process.env.POSTGRES_DB || 'adventure_platform',
    ssl: process.env.POSTGRES_SSL === 'true',
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/adventure_platform',
    database: process.env.MONGODB_DATABASE || 'adventure_platform',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '5', 10),
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
  },

  // Service URLs
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  questServiceUrl: process.env.QUEST_SERVICE_URL || 'http://localhost:3004',

  // Geospatial Settings
  geofence: {
    defaultRadius: parseInt(process.env.DEFAULT_GEOFENCE_RADIUS || '50', 10), // meters
    maxTrackingDistance: parseInt(process.env.MAX_TRACKING_DISTANCE_KM || '500', 10), // km
  },

  tracking: {
    updateInterval: parseInt(process.env.LOCATION_UPDATE_INTERVAL_MS || '5000', 10), // ms
    maxHistoryLength: parseInt(process.env.MAX_LOCATION_HISTORY || '1000', 10),
    enableRealTime: process.env.ENABLE_REAL_TIME_TRACKING === 'true',
  },

  routing: {
    defaultProfile: process.env.DEFAULT_ROUTING_PROFILE || 'walking',
    maxWaypoints: parseInt(process.env.MAX_WAYPOINTS || '25', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
