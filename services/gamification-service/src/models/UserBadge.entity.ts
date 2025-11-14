import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * UserBadge Entity
 * Tracks user's earned badges
 */
@Entity({ schema: 'gamification', name: 'user_badges' })
@Index(['userId'])
@Index(['badgeId'])
@Index(['userId', 'badgeId'], { unique: true })
@Index(['earnedAt'])
export class UserBadge {
  @PrimaryGeneratedColumn('uuid', { name: 'user_badge_id' })
  userBadgeId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'badge_id' })
  badgeId!: string;

  @Column({ type: 'timestamp', name: 'earned_at' })
  earnedAt!: Date;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    sourceType?: string;
    sourceId?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
