import { Router } from 'express';
import questRoutes from './quest.routes';
import checkpointRoutes from './checkpoint.routes';
import participationRoutes from './participation.routes';
import templateRoutes from './template.routes';
import discoveryRoutes from './discovery.routes';
import { CheckpointController } from '../controllers/checkpoint.controller';

const router = Router();
const checkpointController = new CheckpointController();

// Quest routes
router.use('/quests', questRoutes);

// Checkpoint routes (nested under quests for creation)
router.post('/quests/:questId/checkpoints', checkpointController.createCheckpoint);
router.get('/quests/:questId/checkpoints', checkpointController.getQuestCheckpoints);
router.post('/quests/:questId/checkpoints/reorder', checkpointController.reorderCheckpoints);
router.put('/checkpoints/:checkpointId', checkpointController.updateCheckpoint);
router.delete('/checkpoints/:checkpointId', checkpointController.deleteCheckpoint);
router.use('/checkpoints', checkpointRoutes);

// Participation routes
router.use('/participations', participationRoutes);

// Template routes
router.use('/templates', templateRoutes);

// Discovery routes (bookmarks, featured, trending, recommendations, analytics)
router.use('/discovery', discoveryRoutes);

export default router;
