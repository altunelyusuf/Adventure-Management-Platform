import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * UserXP Entity
 * Stores user's total XP, current level, and XP statistics
 */
@Entity({ schema: 'gamification', name: 'user_xp' })
@Index(['totalXp'])
@Index(['currentLevel'])
export class UserXP {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'bigint', name: 'total_xp', default: 0 })
  totalXp!: number;

  @Column({ type: 'integer', name: 'current_level', default: 1 })
  currentLevel!: number;

  @Column({ type: 'bigint', name: 'lifetime_xp', default: 0 })
  lifetimeXp!: number;

  @Column({ type: 'bigint', name: 'xp_this_week', default: 0 })
  xpThisWeek!: number;

  @Column({ type: 'bigint', name: 'xp_this_month', default: 0 })
  xpThisMonth!: number;

  @Column({ type: 'timestamp', name: 'week_reset_at', nullable: true })
  weekResetAt?: Date;

  @Column({ type: 'timestamp', name: 'month_reset_at', nullable: true })
  monthResetAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
