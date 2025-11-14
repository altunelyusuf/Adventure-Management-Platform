import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * UserAchievement Entity
 * Tracks user's unlocked achievements with progress
 */
@Entity({ schema: 'gamification', name: 'user_achievements' })
@Index(['userId'])
@Index(['achievementId'])
@Index(['userId', 'achievementId'], { unique: true })
@Index(['unlockedAt'])
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid', { name: 'user_achievement_id' })
  userAchievementId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'achievement_id' })
  achievementId!: string;

  @Column({ type: 'integer', name: 'progress', default: 0 })
  progress!: number;

  @Column({ type: 'integer', name: 'target' })
  target!: number;

  @Column({ type: 'boolean', name: 'is_unlocked', default: false })
  isUnlocked!: boolean;

  @Column({ type: 'timestamp', name: 'unlocked_at', nullable: true })
  unlockedAt?: Date;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    completionDetails?: any;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
