import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateConfig } from './config';
import { initializeDatabase, closeDatabase } from './config/database';
import profileRoutes from './routes/profile.routes';

// Validate configuration
validateConfig();

// Create Express application
const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/profiles', profileRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Adventure Platform - User Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/profiles/health',
      profile: 'GET /api/v1/profiles/:userId',
      myProfile: 'GET /api/v1/profiles/me',
      updateProfile: 'PUT /api/v1/profiles/:userId',
      uploadAvatar: 'POST /api/v1/profiles/:userId/avatar',
      search: 'GET /api/v1/profiles/search?q=query',
      preferences: 'GET/PUT /api/v1/profiles/:userId/preferences',
      privacy: 'GET/PUT /api/v1/profiles/:userId/privacy',
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

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  });
});

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`${signal} received, starting graceful shutdown...`);
  try {
    await closeDatabase();
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer(): Promise<void> {
  try {
    await initializeDatabase();

    app.listen(config.port, () => {
      console.log(`🚀 User Service started successfully`);
      console.log(`📡 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
