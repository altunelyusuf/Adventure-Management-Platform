import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Auth Service
router.use(
  '/auth',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/v1/auth',
    },
  })
);

// User Service
router.use(
  '/users',
  createProxyMiddleware({
    target: config.services.user,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/v1/profiles',
    },
  })
);

// Quest Service
router.use(
  '/quests',
  createProxyMiddleware({
    target: config.services.quest,
    changeOrigin: true,
    pathRewrite: {
      '^/api/quests': '/api/quests',
    },
  })
);

// Gamification Service
router.use(
  '/gamification',
  createProxyMiddleware({
    target: config.services.gamification,
    changeOrigin: true,
    pathRewrite: {
      '^/api/gamification': '/api/v1',
    },
  })
);

// Social Service
router.use(
  '/social',
  createProxyMiddleware({
    target: config.services.social,
    changeOrigin: true,
    pathRewrite: {
      '^/api/social': '/api/social',
    },
  })
);

// Geospatial Service
router.use(
  '/geospatial',
  createProxyMiddleware({
    target: config.services.geospatial,
    changeOrigin: true,
    pathRewrite: {
      '^/api/geospatial': '/api/geospatial',
    },
  })
);

// Notification Service
router.use(
  '/notifications',
  createProxyMiddleware({
    target: config.services.notification,
    changeOrigin: true,
    pathRewrite: {
      '^/api/notifications': '/api/notifications',
    },
  })
);

// Payment Service
router.use(
  '/payments',
  createProxyMiddleware({
    target: config.services.payment,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payments': '/api/payments',
    },
  })
);

export default router;
