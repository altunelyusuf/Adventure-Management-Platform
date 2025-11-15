import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './config/database';
import { connectRedis } from './config/redis';
import mediaRoutes from './routes/media.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (for local storage)
if (process.env.STORAGE_TYPE === 'local') {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  app.use('/uploads', express.static(path.resolve(uploadDir)));
}

// Routes
app.use('/api/media', mediaRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Connect to Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🖼️  MEDIA SERVICE RUNNING                               ║
║                                                           ║
║   Port:        ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}  ║
║   Storage:     ${process.env.STORAGE_TYPE || 'local'}    ║
║                                                           ║
║   Endpoints:                                              ║
║   POST   /api/media/upload                                ║
║   GET    /api/media/assets/:id                            ║
║   GET    /api/media/users/:userId/assets                  ║
║   PUT    /api/media/assets/:id                            ║
║   DELETE /api/media/assets/:id                            ║
║   GET    /api/media/health                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
