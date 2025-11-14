import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  QUEST_COMPLETED = 'QUEST_COMPLETED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  LEVEL_UP = 'LEVEL_UP',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity({ schema: 'notifications', name: 'notifications' })
@Index(['userId', 'createdAt'])
@Index(['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notificationId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority!: NotificationPriority;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'action_url' })
  actionUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt?: Date;

  @Column({ type: 'boolean', default: false, name: 'email_sent' })
  emailSent!: boolean;

  @Column({ type: 'boolean', default: false, name: 'push_sent' })
  pushSent!: boolean;
}
