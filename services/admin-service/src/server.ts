import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚙️  ADMIN SERVICE RUNNING                               ║
║                                                           ║
║   Port:        ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}  ║
║                                                           ║
║   Endpoints:                                              ║
║   GET    /api/admin/users                                 ║
║   POST   /api/admin/users/:id/ban                         ║
║   POST   /api/admin/users/:id/unban                       ║
║   GET    /api/admin/quests/pending                        ║
║   POST   /api/admin/quests/:id/approve                    ║
║   POST   /api/admin/quests/:id/reject                     ║
║   GET    /api/admin/stats                                 ║
║   GET    /api/admin/activity                              ║
║   GET    /api/admin/health                                ║
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
