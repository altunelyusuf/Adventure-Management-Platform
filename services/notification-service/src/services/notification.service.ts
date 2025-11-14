import { AppDataSource } from '../config/database';
import { Notification, NotificationType, NotificationPriority } from '../models/Notification.entity';
import { NotificationPreference } from '../models/NotificationPreference.entity';
import { Repository } from 'typeorm';
import { EmailService } from './email.service';
import { PushService } from './push.service';
import config from '../config';

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  actionUrl?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private preferenceRepository: Repository<NotificationPreference>;
  private emailService: EmailService;
  private pushService: PushService;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.preferenceRepository = AppDataSource.getRepository(NotificationPreference);
    this.emailService = new EmailService();
    this.pushService = new PushService();
  }

  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    // Check user preferences
    const preferences = await this.getUserPreferences(data.userId);

    if (!preferences.inAppEnabled) {
      throw new Error('In-app notifications disabled');
    }

    // Create notification
    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || NotificationPriority.MEDIUM,
      data: data.data,
      actionUrl: data.actionUrl,
    });

    const saved = await this.notificationRepository.save(notification);

    // Send email if requested and enabled
    if (data.sendEmail && config.notifications.enableEmail && preferences.emailEnabled) {
      try {
        await this.emailService.sendNotificationEmail(data.userId, data.title, data.message);
        saved.emailSent = true;
        await this.notificationRepository.save(saved);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    // Send push if requested and enabled
    if (data.sendPush && config.notifications.enablePush && preferences.pushEnabled) {
      try {
        await this.pushService.sendPushNotification(data.userId, data.title, data.message, data.data);
        saved.pushSent = true;
        await this.notificationRepository.save(saved);
      } catch (error) {
        console.error('Error sending push:', error);
      }
    }

    return saved;
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    return this.notificationRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();

    return result.affected || 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({ userId });
      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    let preferences = await this.getUserPreferences(userId);

    Object.assign(preferences, updates);
    return this.preferenceRepository.save(preferences);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ notificationId, userId });
  }

  async deleteOldNotifications(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .andWhere('is_read = true')
      .execute();

    return result.affected || 0;
  }
}
