import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BadgeTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

/**
 * Badge Entity
 * Defines collectible badges with tiers and requirements
 */
@Entity({ schema: 'gamification', name: 'badges' })
@Index(['tier'])
@Index(['isExclusive'])
export class Badge {
  @PrimaryGeneratedColumn('uuid', { name: 'badge_id' })
  badgeId!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 200, name: 'description' })
  description!: string;

  @Column({
    type: 'enum',
    enum: BadgeTier,
    name: 'tier',
    default: BadgeTier.BRONZE,
  })
  tier!: BadgeTier;

  @Column({ type: 'varchar', length: 255, name: 'icon_url', nullable: true })
  iconUrl?: string;

  @Column({ type: 'varchar', length: 7, name: 'color', default: '#CD7F32' })
  color!: string;

  @Column({ type: 'boolean', name: 'is_exclusive', default: false })
  isExclusive!: boolean;

  @Column({ type: 'integer', name: 'required_level', nullable: true })
  requiredLevel?: number;

  @Column({ type: 'uuid', name: 'required_achievement_id', nullable: true })
  requiredAchievementId?: string;

  @Column({ type: 'integer', name: 'holder_count', default: 0 })
  holderCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
