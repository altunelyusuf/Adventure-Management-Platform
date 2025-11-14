import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * ActivityLike Entity
 * Stores likes on activities
 */
@Entity({ schema: 'social', name: 'activity_likes' })
@Index(['activityId', 'userId'], { unique: true })
@Index(['activityId'])
@Index(['userId'])
@Index(['createdAt'])
export class ActivityLike {
  @PrimaryGeneratedColumn('uuid', { name: 'like_id' })
  likeId!: string;

  @Column({ type: 'uuid', name: 'activity_id' })
  activityId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
