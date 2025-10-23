import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ schema: 'users', name: 'profiles' })
@Index(['userId'], { unique: true })
@Index(['username'], { unique: true })
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'avatar_thumbnails' })
  avatarThumbnails?: {
    small: string;
    medium: string;
    large: string;
  };

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  // Location
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'location_city' })
  locationCity?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'location_state' })
  locationState?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'location_country' })
  locationCountry?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, name: 'location_latitude' })
  locationLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, name: 'location_longitude' })
  locationLongitude?: number;

  // Social Links
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'website_url' })
  websiteUrl?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'social_links' })
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Statistics (cached from other services)
  @Column({ type: 'integer', default: 0, name: 'quests_completed' })
  questsCompleted!: number;

  @Column({ type: 'integer', default: 0, name: 'quests_created' })
  questsCreated!: number;

  @Column({ type: 'integer', default: 0, name: 'total_xp' })
  totalXp!: number;

  @Column({ type: 'integer', default: 1 })
  level!: number;

  @Column({ type: 'integer', default: 0, name: 'followers_count' })
  followersCount!: number;

  @Column({ type: 'integer', default: 0, name: 'following_count' })
  followingCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_seen_at' })
  lastSeenAt?: Date;
}
