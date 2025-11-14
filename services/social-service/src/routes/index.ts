import { Router } from 'express';
import friendRoutes from './friend.routes';
import feedRoutes from './feed.routes';
import interactionRoutes from './interaction.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'social-service' });
});

// Mount routes
router.use('/friends', friendRoutes);
router.use('/feed', feedRoutes);
router.use('/interactions', interactionRoutes);

export default router;
