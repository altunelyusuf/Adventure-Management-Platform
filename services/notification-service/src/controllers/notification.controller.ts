import { Request, Response } from 'express';
import { NotificationService, PushService } from '../services';

export class NotificationController {
  private notificationService: NotificationService;
  private pushService: PushService;

  constructor() {
    this.notificationService = new NotificationService();
    this.pushService = new PushService();
  }

  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const notification = await this.notificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await this.notificationService.getUserNotifications(
        userId,
        limit,
        offset,
        unreadOnly
      );

      res.json({ notifications, count: notifications.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;
      const { userId } = (req as any).user;

      const notification = await this.notificationService.markAsRead(notificationId, userId);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const count = await this.notificationService.markAllAsRead(userId);
      res.json({ message: 'Notifications marked as read', count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const preferences = await this.notificationService.getUserPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const preferences = await this.notificationService.updatePreferences(userId, req.body);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  registerDevice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { token, platform, deviceName } = req.body;

      const device = await this.pushService.registerDeviceToken(userId, token, platform, deviceName);
      res.status(201).json(device);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
