export const SERVICE_ROUTES = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    pathPrefix: '/api/auth',
  },
  quests: {
    target: process.env.QUEST_SERVICE_URL || 'http://localhost:3002',
    pathPrefix: '/api/quests',
  },
  profiles: {
    target: process.env.PROFILE_SERVICE_URL || 'http://localhost:3003',
    pathPrefix: '/api/profiles',
  },
  gamification: {
    target: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3004',
    pathPrefix: '/api/gamification',
  },
  social: {
    target: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3005',
    pathPrefix: '/api/social',
  },
  geospatial: {
    target: process.env.GEOSPATIAL_SERVICE_URL || 'http://localhost:3006',
    pathPrefix: '/api/geospatial',
  },
  notifications: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    pathPrefix: '/api/notifications',
  },
  payments: {
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008',
    pathPrefix: '/api/payments',
  },
  media: {
    target: process.env.MEDIA_SERVICE_URL || 'http://localhost:3009',
    pathPrefix: '/api/media',
  },
  analytics: {
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3010',
    pathPrefix: '/api/analytics',
  },
  admin: {
    target: process.env.ADMIN_SERVICE_URL || 'http://localhost:3011',
    pathPrefix: '/api/admin',
  },
};

export const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/quests/public',
  '/health',
  '/metrics',
];
