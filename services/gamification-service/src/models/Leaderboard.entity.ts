import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LeaderboardType {
  GLOBAL_XP = 'GLOBAL_XP',
  GLOBAL_QUESTS = 'GLOBAL_QUESTS',
  CATEGORY_XP = 'CATEGORY_XP',
  CATEGORY_QUESTS = 'CATEGORY_QUESTS',
  WEEKLY_XP = 'WEEKLY_XP',
  MONTHLY_XP = 'MONTHLY_XP',
  STREAK = 'STREAK',
}

export enum LeaderboardTimeframe {
  ALL_TIME = 'ALL_TIME',
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

/**
 * Leaderboard Entity
 * Defines different types of leaderboards
 */
@Entity({ schema: 'gamification', name: 'leaderboards' })
@Index(['type'])
@Index(['timeframe'])
@Index(['isActive'])
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid', { name: 'leaderboard_id' })
  leaderboardId!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 200, name: 'description' })
  description!: string;

  @Column({
    type: 'enum',
    enum: LeaderboardType,
    name: 'type',
  })
  type!: LeaderboardType;

  @Column({
    type: 'enum',
    enum: LeaderboardTimeframe,
    name: 'timeframe',
    default: LeaderboardTimeframe.ALL_TIME,
  })
  timeframe!: LeaderboardTimeframe;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', name: 'reset_at', nullable: true })
  resetAt?: Date;

  @Column({ type: 'timestamp', name: 'last_updated', nullable: true })
  lastUpdated?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
