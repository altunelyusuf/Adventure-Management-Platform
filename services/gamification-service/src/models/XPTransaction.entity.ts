import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum XPSource {
  CHECKPOINT_COMPLETION = 'CHECKPOINT_COMPLETION',
  QUEST_COMPLETION = 'QUEST_COMPLETION',
  DAILY_LOGIN = 'DAILY_LOGIN',
  FRIEND_REFERRAL = 'FRIEND_REFERRAL',
  SOCIAL_SHARE = 'SOCIAL_SHARE',
  PHOTO_UPLOAD = 'PHOTO_UPLOAD',
  QUEST_REVIEW = 'QUEST_REVIEW',
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  CHALLENGE_COMPLETION = 'CHALLENGE_COMPLETION',
  STREAK_BONUS = 'STREAK_BONUS',
  LEVEL_UP = 'LEVEL_UP',
  BONUS_AWARD = 'BONUS_AWARD',
}

/**
 * XPTransaction Entity
 * Tracks all XP awards with source, amount, and bonuses
 */
@Entity({ schema: 'gamification', name: 'xp_transactions' })
@Index(['userId'])
@Index(['source'])
@Index(['createdAt'])
@Index(['source', 'sourceId'])
export class XPTransaction {
  @PrimaryGeneratedColumn('uuid', { name: 'transaction_id' })
  transactionId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: XPSource,
    name: 'source',
  })
  source!: XPSource;

  @Column({ type: 'uuid', name: 'source_id', nullable: true })
  sourceId?: string;

  @Column({ type: 'integer', name: 'amount' })
  amount!: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    name: 'bonus_multiplier',
    default: 1.0,
  })
  bonusMultiplier!: number;

  @Column({ type: 'integer', name: 'total_awarded' })
  totalAwarded!: number;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    questId?: string;
    checkpointId?: string;
    difficulty?: string;
    bonusType?: string;
    achievementId?: string;
    challengeId?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
