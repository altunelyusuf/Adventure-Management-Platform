import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AchievementCategory {
  QUEST_COMPLETION = 'QUEST_COMPLETION',
  DISTANCE_TRAVELED = 'DISTANCE_TRAVELED',
  SOCIAL = 'SOCIAL',
  EXPLORATION = 'EXPLORATION',
  MILESTONE = 'MILESTONE',
  SPEED = 'SPEED',
  COLLECTION = 'COLLECTION',
  SPECIAL = 'SPECIAL',
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Achievement Entity
 * Defines achievable goals with requirements and rewards
 */
@Entity({ schema: 'gamification', name: 'achievements' })
@Index(['category'])
@Index(['rarity'])
@Index(['isHidden'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid', { name: 'achievement_id' })
  achievementId!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 200, name: 'description' })
  description!: string;

  @Column({
    type: 'enum',
    enum: AchievementCategory,
    name: 'category',
  })
  category!: AchievementCategory;

  @Column({
    type: 'enum',
    enum: AchievementRarity,
    name: 'rarity',
    default: AchievementRarity.COMMON,
  })
  rarity!: AchievementRarity;

  @Column({ type: 'varchar', length: 255, name: 'icon_url', nullable: true })
  iconUrl?: string;

  @Column({ type: 'integer', name: 'xp_reward', default: 100 })
  xpReward!: number;

  @Column({ type: 'integer', name: 'coin_reward', default: 0 })
  coinReward!: number;

  @Column({ type: 'uuid', name: 'badge_reward_id', nullable: true })
  badgeRewardId?: string;

  @Column({ type: 'jsonb', name: 'requirements' })
  requirements!: {
    type: string; // e.g., 'QUEST_COUNT', 'DISTANCE', 'SOCIAL_SHARES'
    target: number;
    conditions?: any;
  };

  @Column({ type: 'boolean', name: 'is_hidden', default: false })
  isHidden!: boolean;

  @Column({ type: 'boolean', name: 'is_repeatable', default: false })
  isRepeatable!: boolean;

  @Column({ type: 'boolean', name: 'is_seasonal', default: false })
  isSeasonal!: boolean;

  @Column({ type: 'timestamp', name: 'available_from', nullable: true })
  availableFrom?: Date;

  @Column({ type: 'timestamp', name: 'available_until', nullable: true })
  availableUntil?: Date;

  @Column({ type: 'integer', name: 'unlock_count', default: 0 })
  unlockCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
