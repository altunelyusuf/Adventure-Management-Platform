import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import config from './config';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';

const app: Application = express();

/**
 * Middleware
 */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

/**
 * Routes
 */
app.use('/api/social', routes);

/**
 * Error handling
 */
app.use(notFoundMiddleware);
app.use(errorMiddleware);

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Sync database schema (development only)
    if (config.nodeEnv === 'development') {
      await AppDataSource.synchronize();
      console.log('✅ Database schema synchronized');
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Social Service running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
      console.log(`💾 Redis: ${config.redis.host}:${config.redis.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await AppDataSource.destroy();
  process.exit(0);
});

// Start the server
startServer();

export default app;
