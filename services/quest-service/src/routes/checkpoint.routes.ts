import { Router } from 'express';
import { CheckpointController } from '../controllers/checkpoint.controller';

const router = Router();
const checkpointController = new CheckpointController();

// Public routes
router.get('/:checkpointId', checkpointController.getCheckpoint);

// Protected routes (require authentication)
// Note: Authentication middleware should be added in main index.ts

export default router;
