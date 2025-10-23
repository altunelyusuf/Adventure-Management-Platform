import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  JA = 'ja',
  ZH = 'zh',
}

export enum DistanceUnit {
  MILES = 'miles',
  KILOMETERS = 'kilometers',
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Entity({ schema: 'users', name: 'preferences' })
@Index(['userId'], { unique: true })
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId!: string;

  // App Preferences
  @Column({ type: 'enum', enum: Theme, default: Theme.AUTO })
  theme!: Theme;

  @Column({ type: 'enum', enum: Language, default: Language.EN })
  language!: Language;

  @Column({ type: 'enum', enum: DistanceUnit, default: DistanceUnit.MILES, name: 'distance_unit' })
  distanceUnit!: DistanceUnit;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  // Notification Preferences
  @Column({ type: 'jsonb', default: '{}', name: 'email_notifications' })
  emailNotifications!: {
    questUpdates?: boolean;
    socialActivity?: boolean;
    marketing?: boolean;
    achievements?: boolean;
    weeklyDigest?: boolean;
  };

  @Column({ type: 'jsonb', default: '{}', name: 'push_notifications' })
  pushNotifications!: {
    questReminders?: boolean;
    friendRequests?: boolean;
    messages?: boolean;
    liveStreams?: boolean;
    achievements?: boolean;
  };

  // Quest Preferences
  @Column({
    type: 'enum',
    enum: QuestDifficulty,
    default: QuestDifficulty.MEDIUM,
    name: 'default_quest_difficulty',
  })
  defaultQuestDifficulty!: QuestDifficulty;

  @Column({ type: 'jsonb', nullable: true, name: 'preferred_quest_categories' })
  preferredQuestCategories?: string[];

  @Column({ type: 'integer', default: 10, name: 'max_quest_distance_miles' })
  maxQuestDistanceMiles!: number;

  // Display Preferences
  @Column({ type: 'boolean', default: true, name: 'show_online_status' })
  showOnlineStatus!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_activity_feed' })
  showActivityFeed!: boolean;

  @Column({ type: 'boolean', default: true, name: 'show_achievements' })
  showAchievements!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
