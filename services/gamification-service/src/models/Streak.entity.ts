import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StreakType {
  LOGIN = 'LOGIN',
  QUEST_COMPLETION = 'QUEST_COMPLETION',
}

/**
 * Streak Entity
 * Tracks user's login and quest completion streaks
 */
@Entity({ schema: 'gamification', name: 'streaks' })
@Index(['userId', 'type'], { unique: true })
@Index(['currentStreak'])
@Index(['longestStreak'])
export class Streak {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({
    type: 'enum',
    enum: StreakType,
    name: 'type',
  })
  type!: StreakType;

  @Column({ type: 'integer', name: 'current_streak', default: 0 })
  currentStreak!: number;

  @Column({ type: 'integer', name: 'longest_streak', default: 0 })
  longestStreak!: number;

  @Column({ type: 'date', name: 'last_activity_date', nullable: true })
  lastActivityDate?: Date;

  @Column({ type: 'integer', name: 'freeze_count', default: 0 })
  freezeCount!: number;

  @Column({ type: 'boolean', name: 'is_frozen', default: false })
  isFrozen!: boolean;

  @Column({ type: 'timestamp', name: 'frozen_until', nullable: true })
  frozenUntil?: Date;

  @Column({ type: 'integer', name: 'total_xp_earned', default: 0 })
  totalXpEarned!: number;

  @Column({ type: 'jsonb', name: 'milestones', default: [] })
  milestones!: Array<{
    streak: number;
    achievedAt: Date;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
