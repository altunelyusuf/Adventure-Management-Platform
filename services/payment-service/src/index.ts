import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import config from './config';
import routes from './routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use('/api/payments/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.use('/api/payments', routes);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`🚀 Payment Service running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await AppDataSource.destroy();
  process.exit(0);
});

startServer();

export default app;
