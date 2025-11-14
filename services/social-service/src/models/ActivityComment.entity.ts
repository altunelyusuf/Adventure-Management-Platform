import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ActivityComment Entity
 * Stores comments on activities with nested comment support
 */
@Entity({ schema: 'social', name: 'activity_comments' })
@Index(['activityId'])
@Index(['userId'])
@Index(['parentCommentId'])
@Index(['createdAt'])
export class ActivityComment {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' })
  commentId!: string;

  @Column({ type: 'uuid', name: 'activity_id' })
  activityId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'parent_comment_id', nullable: true })
  parentCommentId?: string;

  @Column({ type: 'text', name: 'content' })
  content!: string;

  @Column({ type: 'integer', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'integer', name: 'reply_count', default: 0 })
  replyCount!: number;

  @Column({ type: 'boolean', name: 'is_edited', default: false })
  isEdited!: boolean;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
