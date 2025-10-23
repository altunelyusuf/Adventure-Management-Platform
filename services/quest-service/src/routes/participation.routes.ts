import { Router } from 'express';
import { ParticipationController } from '../controllers/participation.controller';

const router = Router();
const participationController = new ParticipationController();

// All participation routes require authentication
router.post('/quests/:questId/start', participationController.startQuest);
router.get('/me', participationController.getMyParticipations);
router.get('/:participationId', participationController.getParticipation);
router.post('/:participationId/checkpoints/:checkpointId/complete', participationController.completeCheckpoint);
router.post('/:participationId/abandon', participationController.abandonQuest);
router.post('/:participationId/rate', participationController.rateQuest);

export default router;
