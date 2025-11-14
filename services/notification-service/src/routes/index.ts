import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

// Notification routes
router.post('/notifications', notificationController.createNotification);
router.get('/notifications/:userId', notificationController.getUserNotifications);
router.put('/notifications/:notificationId/read', notificationController.markAsRead);
router.put('/notifications/read/all', notificationController.markAllAsRead);
router.get('/notifications/:userId/unread/count', notificationController.getUnreadCount);

// Preference routes
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Device routes
router.post('/devices', notificationController.registerDevice);

export default router;
