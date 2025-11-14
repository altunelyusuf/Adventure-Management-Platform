import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Follow Entity
 * Stores unidirectional follow relationships
 */
@Entity({ schema: 'social', name: 'follows' })
@Index(['followerId', 'followingId'], { unique: true })
@Index(['followerId'])
@Index(['followingId'])
@Index(['createdAt'])
export class Follow {
  @PrimaryGeneratedColumn('uuid', { name: 'follow_id' })
  followId!: string;

  @Column({ type: 'uuid', name: 'follower_id' })
  followerId!: string;

  @Column({ type: 'uuid', name: 'following_id' })
  followingId!: string;

  @Column({ type: 'boolean', name: 'notify_on_activity', default: true })
  notifyOnActivity!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
