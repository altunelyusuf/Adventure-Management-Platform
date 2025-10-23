import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
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
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT Configuration
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'change-this-secret-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@adventure-platform.com',
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
      keyId: process.env.APPLE_KEY_ID || '',
      privateKey: process.env.APPLE_PRIVATE_KEY || '',
      redirectUri: process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/auth/apple/callback',
    },
  },

  // Security Configuration
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
      max: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
    },
    accountLockout: {
      maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MS || '900000', 10), // 15 minutes
    },
    tokenExpiry: {
      verification: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || '24', 10),
      passwordReset: parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS || '1', 10),
    },
  },

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validation function to ensure critical configs are set
export function validateConfig(): void {
  const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
