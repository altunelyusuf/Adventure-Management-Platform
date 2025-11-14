import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Friendship Entity
 * Stores bidirectional friend relationships
 */
@Entity({ schema: 'social', name: 'friendships' })
@Index(['user1Id', 'user2Id'], { unique: true })
@Index(['user1Id'])
@Index(['user2Id'])
@Index(['createdAt'])
export class Friendship {
  @PrimaryGeneratedColumn('uuid', { name: 'friendship_id' })
  friendshipId!: string;

  @Column({ type: 'uuid', name: 'user1_id' })
  user1Id!: string;

  @Column({ type: 'uuid', name: 'user2_id' })
  user2Id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: {
    initiatorId?: string;
    friendshipSource?: string;
    [key: string]: any;
  };
}
