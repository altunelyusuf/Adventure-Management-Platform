import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { SERVICE_ROUTES } from './config/services';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Performance middleware
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'api-gateway',
  });
});

// Metrics endpoint (Prometheus format)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP gateway_uptime_seconds Gateway uptime in seconds
# TYPE gateway_uptime_seconds counter
gateway_uptime_seconds ${process.uptime()}

# HELP gateway_memory_usage_bytes Gateway memory usage in bytes
# TYPE gateway_memory_usage_bytes gauge
gateway_memory_usage_bytes ${process.memoryUsage().heapUsed}
  `.trim());
});

// Rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/media/upload', apiLimiter);
app.use(apiLimiter);

// Authentication middleware
app.use(authMiddleware);

// Proxy routes to microservices
Object.entries(SERVICE_ROUTES).forEach(([serviceName, config]) => {
  app.use(
    config.pathPrefix,
    createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${config.pathPrefix}`]: '',
      },
      onProxyReq: (proxyReq, req: any) => {
        // Forward user context headers
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.userId);
          proxyReq.setHeader('x-user-email', req.user.email);
          proxyReq.setHeader('x-user-role', req.user.role);
        }
        if (req.headers['x-correlation-id']) {
          proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id']);
        }
      },
      onError: (err, req, res: any) => {
        logger.error(`Proxy error for ${serviceName}:`, {
          error: err.message,
          target: config.target,
          path: req.url,
        });
        res.status(502).json({
          success: false,
          error: {
            message: `Service ${serviceName} is currently unavailable`,
            service: serviceName,
          },
        });
      },
      logLevel: 'warn',
    })
  );
  
  logger.info(`Registered proxy route: ${config.pathPrefix} -> ${config.target}`);
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  logger.info('Registered service routes:');
  Object.entries(SERVICE_ROUTES).forEach(([name, config]) => {
    logger.info(`  ${config.pathPrefix} -> ${config.target}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
