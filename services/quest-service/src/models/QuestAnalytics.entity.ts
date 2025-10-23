import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AnalyticsEventType {
  VIEW = 'VIEW',
  START = 'START',
  CHECKPOINT_COMPLETE = 'CHECKPOINT_COMPLETE',
  COMPLETE = 'COMPLETE',
  ABANDON = 'ABANDON',
  RATE = 'RATE',
  SHARE = 'SHARE',
  BOOKMARK = 'BOOKMARK',
}

@Entity({ schema: 'quests', name: 'quest_analytics' })
@Index(['questId'])
@Index(['eventType'])
@Index(['createdAt'])
@Index(['questId', 'eventType'])
export class QuestAnalytics {
  @PrimaryGeneratedColumn('uuid', { name: 'analytics_id' })
  analyticsId!: string;

  @Column({ type: 'uuid', name: 'quest_id' })
  questId!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @Column({ type: 'enum', enum: AnalyticsEventType, name: 'event_type' })
  eventType!: AnalyticsEventType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}
