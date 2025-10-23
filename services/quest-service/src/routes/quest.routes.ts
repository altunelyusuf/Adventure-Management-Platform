import { Router } from 'express';
import { QuestController } from '../controllers/quest.controller';

const router = Router();
const questController = new QuestController();

// Public routes
router.get('/search', questController.searchQuests);
router.get('/categories', questController.getCategories);
router.get('/slug/:slug', questController.getQuestBySlug);
router.get('/:questId', questController.getQuest);

// Protected routes (require authentication)
// Note: Authentication middleware should be added in main index.ts
router.post('/', questController.createQuest);
router.get('/my/quests', questController.getMyQuests);
router.put('/:questId', questController.updateQuest);
router.delete('/:questId', questController.deleteQuest);
router.post('/:questId/publish', questController.publishQuest);
router.post('/:questId/unpublish', questController.unpublishQuest);

export default router;
