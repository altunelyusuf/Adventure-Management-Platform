import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * LeaderboardEntry Entity
 * Tracks user rankings in leaderboards
 */
@Entity({ schema: 'gamification', name: 'leaderboard_entries' })
@Index(['leaderboardId'])
@Index(['userId'])
@Index(['leaderboardId', 'userId'], { unique: true })
@Index(['leaderboardId', 'rank'])
@Index(['leaderboardId', 'score'])
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid', { name: 'entry_id' })
  entryId!: string;

  @Column({ type: 'uuid', name: 'leaderboard_id' })
  leaderboardId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'bigint', name: 'score' })
  score!: number;

  @Column({ type: 'integer', name: 'rank' })
  rank!: number;

  @Column({ type: 'integer', name: 'previous_rank', nullable: true })
  previousRank?: number;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    username?: string;
    avatarUrl?: string;
    level?: number;
    questCount?: number;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
