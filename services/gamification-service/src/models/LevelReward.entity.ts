import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RewardType {
  CURRENCY = 'CURRENCY',
  BADGE = 'BADGE',
  FEATURE_UNLOCK = 'FEATURE_UNLOCK',
  COSMETIC = 'COSMETIC',
  BOOST = 'BOOST',
}

/**
 * LevelReward Entity
 * Defines rewards for reaching specific levels
 */
@Entity({ schema: 'gamification', name: 'level_rewards' })
@Index(['level'], { unique: true })
@Index(['isMilestone'])
export class LevelReward {
  @PrimaryGeneratedColumn('uuid', { name: 'reward_id' })
  rewardId!: string;

  @Column({ type: 'integer', name: 'level' })
  level!: number;

  @Column({ type: 'integer', name: 'coin_reward', default: 100 })
  coinReward!: number;

  @Column({ type: 'uuid', name: 'badge_id', nullable: true })
  badgeId?: string;

  @Column({ type: 'jsonb', name: 'rewards' })
  rewards!: Array<{
    type: RewardType;
    value: any;
    description: string;
  }>;

  @Column({ type: 'boolean', name: 'is_milestone', default: false })
  isMilestone!: boolean;

  @Column({ type: 'varchar', length: 200, name: 'milestone_description', nullable: true })
  milestoneDescription?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
