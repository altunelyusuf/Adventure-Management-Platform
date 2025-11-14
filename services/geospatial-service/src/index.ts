import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource, connectMongo } from './config/database';
import config from './config';
import routes from './routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/geospatial', routes);

// Start server
const startServer = async () => {
  try {
    // Initialize PostgreSQL
    await AppDataSource.initialize();
    console.log('✅ PostgreSQL connected');

    // Initialize MongoDB
    await connectMongo();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Geospatial Service running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await AppDataSource.destroy();
  process.exit(0);
});

startServer();

export default app;
