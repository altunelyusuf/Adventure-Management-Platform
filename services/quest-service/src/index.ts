import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { initializeDatabase } from './config/database';
import routes from './routes';
import { authenticate, optionalAuth } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { QuestController } from './controllers/quest.controller';

const app: Application = express();

const questController = new QuestController();

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', questController.healthCheck);

// Public routes (optional auth for view tracking)
app.get('/api/v1/quests/search', optionalAuth, routes);
app.get('/api/v1/quests/categories', routes);
app.get('/api/v1/quests/slug/:slug', optionalAuth, routes);
app.get('/api/v1/quests/:questId', optionalAuth, routes);
app.get('/api/v1/checkpoints/:checkpointId', optionalAuth, routes);

// Protected routes (require authentication)
app.use('/api/v1', authenticate, routes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();

    const port = config.port;
    app.listen(port, () => {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║         🗺️  Quest Service - Adventure Platform           ║');
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log(`║  Port:        ${port}                                       ║`);
      console.log(`║  Environment: ${config.nodeEnv.padEnd(43)}║`);
      console.log(`║  Database:    ${config.database.host}:${config.database.port.toString().padEnd(35)}║`);
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log('║  Status:      ✅ Ready to accept requests                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
    });
  } catch (error) {
    console.error('❌ Failed to start Quest Service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
