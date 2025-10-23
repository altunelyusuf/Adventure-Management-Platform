import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateConfig } from './config';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './utils/logger.util';
import authRoutes from './routes/auth.routes';

// Validate configuration
validateConfig();

// Create Express application
const app: Application = express();

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Adventure Platform - Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/auth/health',
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      verifyEmail: 'GET /api/v1/auth/verify-email',
      refresh: 'POST /api/v1/auth/refresh',
      forgotPassword: 'POST /api/v1/auth/forgot-password',
      resetPassword: 'POST /api/v1/auth/reset-password',
      logout: 'POST /api/v1/auth/logout',
      me: 'GET /api/v1/auth/me',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'Endpoint not found',
    statusCode: 404,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, starting graceful shutdown...`);

  try {
    // Close database connection
    await closeDatabase();

    // Close Redis connection
    await closeRedis();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Start server
async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize Redis
    await initializeRedis();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`🚀 Auth Service started successfully`);
      logger.info(`📡 Server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📊 Database: ${config.database.host}:${config.database.port}`);
      logger.info(`🔴 Redis: ${config.redis.host}:${config.redis.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
