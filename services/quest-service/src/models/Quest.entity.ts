import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Checkpoint } from './Checkpoint.entity';
import { QuestParticipation } from './QuestParticipation.entity';
import { QuestCategory } from './QuestCategory.entity';

export enum QuestDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum QuestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

@Entity({ schema: 'quests', name: 'quests' })
@Index(['creatorId'])
@Index(['status'])
@Index(['difficulty'])
@Index(['categoryId'])
@Index(['publishedAt'])
@Index(['startLatitude', 'startLongitude'])
export class Quest {
  @PrimaryGeneratedColumn('uuid', { name: 'quest_id' })
  questId!: string;

  @Column({ type: 'uuid', name: 'creator_id' })
  creatorId!: string;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 200, name: 'short_description', nullable: true })
  shortDescription?: string;

  @Column({ type: 'text', name: 'featured_image_url', nullable: true })
  featuredImageUrl?: string;

  @Column({ type: 'enum', enum: QuestDifficulty, default: QuestDifficulty.MEDIUM })
  difficulty!: QuestDifficulty;

  @Column({ type: 'enum', enum: QuestStatus, default: QuestStatus.DRAFT })
  status!: QuestStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'integer', name: 'estimated_duration', nullable: true })
  estimatedDuration?: number;

  @Column({ type: 'integer', name: 'xp_reward', default: 0 })
  xpReward!: number;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', name: 'published_at', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'timestamp', name: 'archived_at', nullable: true })
  archivedAt?: Date;

  // Statistics (denormalized for performance)
  @Column({ type: 'integer', name: 'participant_count', default: 0 })
  participantCount!: number;

  @Column({ type: 'integer', name: 'completion_count', default: 0 })
  completionCount!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'average_rating', default: 0.0 })
  averageRating!: number;

  @Column({ type: 'integer', name: 'view_count', default: 0 })
  viewCount!: number;

  // Geospatial
  @Column({ type: 'decimal', precision: 10, scale: 8, name: 'start_latitude', nullable: true })
  startLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, name: 'start_longitude', nullable: true })
  startLongitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_distance', nullable: true })
  totalDistance?: number;

  // Premium features
  @Column({ type: 'boolean', name: 'is_premium', default: false })
  isPremium!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  // Relationships
  @ManyToOne(() => QuestCategory, (category) => category.quests, { nullable: true })
  category?: QuestCategory;

  @OneToMany(() => Checkpoint, (checkpoint) => checkpoint.quest)
  checkpoints!: Checkpoint[];

  @OneToMany(() => QuestParticipation, (participation) => participation.quest)
  participations!: QuestParticipation[];
}
