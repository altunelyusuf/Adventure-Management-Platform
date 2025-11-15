import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// User Management
router.get('/users', adminController.getUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);

// Content Moderation
router.get('/quests/pending', adminController.getPendingQuests);
router.post('/quests/:questId/approve', adminController.approveQuest);
router.post('/quests/:questId/reject', adminController.rejectQuest);

// Analytics
router.get('/stats', adminController.getSystemStats);
router.get('/activity', adminController.getActivityLog);

// Health
router.get('/health', adminController.healthCheck);

export default router;
