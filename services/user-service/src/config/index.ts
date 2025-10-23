import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.USER_SERVICE_PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'adventure_user',
    password: process.env.POSTGRES_PASSWORD || 'adventure_pass',
    database: process.env.POSTGRES_DB || 'adventure_platform',
    ssl: process.env.POSTGRES_SSL === 'true',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '1', 10),
  },

  // Auth Service Configuration
  authService: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    jwtSecret: process.env.JWT_ACCESS_SECRET || 'change-this-secret-in-production',
  },

  // Minio (S3-compatible) Configuration
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'adventure_user',
    secretKey: process.env.MINIO_SECRET_KEY || 'adventure_pass',
    bucket: process.env.MINIO_BUCKET || 'user-avatars',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    avatarSizes: {
      small: 50,
      medium: 200,
      large: 400,
    },
  },
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = ['JWT_ACCESS_SECRET'];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
