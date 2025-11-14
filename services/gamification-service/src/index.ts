import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { initializeDatabase, closeDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { optionalAuth } from './middleware/auth.middleware';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional authentication for all routes
app.use(optionalAuth);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🎮  Gamification Service                                ║
║                                                            ║
║    Environment:  ${config.nodeEnv.padEnd(42)} ║
║    Port:         ${config.port.toString().padEnd(42)} ║
║    Service:      ${config.serviceName.padEnd(42)} ║
║                                                            ║
║    Endpoints:                                               ║
║    - XP & Levels:      /api/v1/xp                         ║
║    - Achievements:     /api/v1/achievements               ║
║    - Badges:           /api/v1/badges                     ║
║    - Leaderboards:     /api/v1/leaderboards               ║
║    - Challenges:       /api/v1/challenges                 ║
║    - Streaks:          /api/v1/streaks                    ║
║    - Health:           /api/v1/health                     ║
║                                                            ║
║    ✅ Service ready to handle requests                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('\n🛑 Shutting down gracefully...');

  try {
    await closeDatabase();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

export default app;
