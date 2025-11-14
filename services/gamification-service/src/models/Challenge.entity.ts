import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ChallengeType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
}

export enum ChallengeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

/**
 * Challenge Entity
 * Defines daily, weekly, and special challenges
 */
@Entity({ schema: 'gamification', name: 'challenges' })
@Index(['type'])
@Index(['difficulty'])
@Index(['isActive'])
@Index(['startDate'])
@Index(['endDate'])
export class Challenge {
  @PrimaryGeneratedColumn('uuid', { name: 'challenge_id' })
  challengeId!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 200, name: 'description' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
    name: 'type',
  })
  type!: ChallengeType;

  @Column({
    type: 'enum',
    enum: ChallengeDifficulty,
    name: 'difficulty',
    default: ChallengeDifficulty.MEDIUM,
  })
  difficulty!: ChallengeDifficulty;

  @Column({ type: 'jsonb', name: 'requirements' })
  requirements!: {
    type: string; // e.g., 'COMPLETE_QUESTS', 'TRAVEL_DISTANCE', 'VISIT_CHECKPOINTS'
    target: number;
    conditions?: any;
  };

  @Column({ type: 'integer', name: 'xp_reward' })
  xpReward!: number;

  @Column({ type: 'integer', name: 'coin_reward', default: 0 })
  coinReward!: number;

  @Column({ type: 'uuid', name: 'badge_reward_id', nullable: true })
  badgeRewardId?: string;

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'timestamp', name: 'end_date' })
  endDate!: Date;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'integer', name: 'completion_count', default: 0 })
  completionCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
