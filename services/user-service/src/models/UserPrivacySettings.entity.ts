import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private',
}

@Entity({ schema: 'users', name: 'privacy_settings' })
@Index(['userId'], { unique: true })
export class UserPrivacySettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId!: string;

  // Profile Privacy
  @Column({
    type: 'enum',
    enum: ProfileVisibility,
    default: ProfileVisibility.PUBLIC,
    name: 'profile_visibility',
  })
  profileVisibility!: ProfileVisibility;

  @Column({ type: 'boolean', default: true, name: 'show_email' })
  showEmail!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_location' })
  showLocation!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_age' })
  showAge!: boolean;

  // Activity Privacy
  @Column({ type: 'boolean', default: true, name: 'show_activity_feed' })
  showActivityFeed!: boolean;

  @Column({
    type: 'enum',
    enum: ProfileVisibility,
    default: ProfileVisibility.PUBLIC,
    name: 'quest_history_visibility',
  })
  questHistoryVisibility!: ProfileVisibility;

  @Column({ type: 'boolean', default: true, name: 'show_online_status' })
  showOnlineStatus!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_last_seen' })
  showLastSeen!: boolean;

  // Social Privacy
  @Column({ type: 'boolean', default: true, name: 'allow_friend_requests' })
  allowFriendRequests!: boolean;

  @Column({ type: 'boolean', default: true, name: 'allow_messages' })
  allowMessages!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_followers' })
  showFollowers!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_following' })
  showFollowing!: boolean;

  // Location Privacy
  @Column({ type: 'boolean', default: false, name: 'share_precise_location' })
  sharePreciseLocation!: boolean;

  @Column({ type: 'boolean', default: true, name: 'share_city_only' })
  shareCityOnly!: boolean;

  // Data Privacy
  @Column({ type: 'boolean', default: false, name: 'allow_analytics' })
  allowAnalytics!: boolean;

  @Column({ type: 'boolean', default: false, name: 'allow_personalization' })
  allowPersonalization!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
