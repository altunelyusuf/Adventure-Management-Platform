import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config';
import routes from './routes';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

const app: Application = express();

// Security
if (config.security.enableHelmet) {
  app.use(helmet());
}

if (config.security.trustProxy) {
  app.set('trust proxy', 1);
}

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Compression
app.use(compression());

// Logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: config.request.maxSize }));
app.use(express.urlencoded({ extended: true, limit: config.request.maxSize }));

// Rate limiting
app.use(rateLimitMiddleware);

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(config.request.timeout);
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 API Gateway running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log('\n📡 Service Routes:');
  console.log(`  Auth:          ${config.services.auth}`);
  console.log(`  User:          ${config.services.user}`);
  console.log(`  Quest:         ${config.services.quest}`);
  console.log(`  Gamification:  ${config.services.gamification}`);
  console.log(`  Social:        ${config.services.social}`);
  console.log(`  Geospatial:    ${config.services.geospatial}`);
  console.log(`  Notification:  ${config.services.notification}`);
  console.log(`  Payment:       ${config.services.payment}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  process.exit(0);
});

export default app;
