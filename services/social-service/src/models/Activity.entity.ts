import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ActivityType {
  QUEST_COMPLETED = 'QUEST_COMPLETED',
  QUEST_STARTED = 'QUEST_STARTED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  BADGE_EARNED = 'BADGE_EARNED',
  LEVEL_UP = 'LEVEL_UP',
  CHECKPOINT_COMPLETED = 'CHECKPOINT_COMPLETED',
  QUEST_CREATED = 'QUEST_CREATED',
  FRIEND_ADDED = 'FRIEND_ADDED',
  QUEST_RATED = 'QUEST_RATED',
  PHOTO_SHARED = 'PHOTO_SHARED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
}

export enum ActivityVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

/**
 * Activity Entity
 * Stores user activity feed items
 */
@Entity({ schema: 'social', name: 'activities' })
@Index(['userId'])
@Index(['type'])
@Index(['visibility'])
@Index(['createdAt'])
@Index(['userId', 'createdAt'])
export class Activity {
  @PrimaryGeneratedColumn('uuid', { name: 'activity_id' })
  activityId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    name: 'type',
  })
  type!: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityVisibility,
    name: 'visibility',
    default: ActivityVisibility.PUBLIC,
  })
  visibility!: ActivityVisibility;

  @Column({ type: 'jsonb', name: 'data' })
  data!: {
    questId?: string;
    questTitle?: string;
    achievementId?: string;
    achievementName?: string;
    badgeId?: string;
    badgeName?: string;
    level?: number;
    checkpointId?: string;
    friendId?: string;
    friendUsername?: string;
    rating?: number;
    photoUrl?: string;
    milestoneType?: string;
    milestoneValue?: number;
    challengeId?: string;
    challengeName?: string;
    streakType?: string;
    streakDays?: number;
    [key: string]: any;
  };

  @Column({ type: 'integer', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'integer', name: 'comment_count', default: 0 })
  commentCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
