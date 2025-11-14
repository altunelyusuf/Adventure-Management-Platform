import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserChallengeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

/**
 * UserChallenge Entity
 * Tracks user's progress on challenges
 */
@Entity({ schema: 'gamification', name: 'user_challenges' })
@Index(['userId'])
@Index(['challengeId'])
@Index(['userId', 'challengeId'], { unique: true })
@Index(['status'])
@Index(['completedAt'])
export class UserChallenge {
  @PrimaryGeneratedColumn('uuid', { name: 'user_challenge_id' })
  userChallengeId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'challenge_id' })
  challengeId!: string;

  @Column({ type: 'integer', name: 'progress', default: 0 })
  progress!: number;

  @Column({ type: 'integer', name: 'target' })
  target!: number;

  @Column({
    type: 'enum',
    enum: UserChallengeStatus,
    name: 'status',
    default: UserChallengeStatus.ACTIVE,
  })
  status!: UserChallengeStatus;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    progressDetails?: any;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
