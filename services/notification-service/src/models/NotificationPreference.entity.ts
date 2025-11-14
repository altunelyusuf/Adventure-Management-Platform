import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'notifications', name: 'notification_preferences' })
export class NotificationPreference {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'boolean', default: true, name: 'email_enabled' })
  emailEnabled!: boolean;

  @Column({ type: 'boolean', default: true, name: 'push_enabled' })
  pushEnabled!: boolean;

  @Column({ type: 'boolean', default: true, name: 'in_app_enabled' })
  inAppEnabled!: boolean;

  @Column({ type: 'boolean', default: true, name: 'quest_notifications' })
  questNotifications!: boolean;

  @Column({ type: 'boolean', default: true, name: 'social_notifications' })
  socialNotifications!: boolean;

  @Column({ type: 'boolean', default: true, name: 'achievement_notifications' })
  achievementNotifications!: boolean;

  @Column({ type: 'boolean', default: true, name: 'payment_notifications' })
  paymentNotifications!: boolean;

  @Column({ type: 'boolean', default: false, name: 'marketing_emails' })
  marketingEmails!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
