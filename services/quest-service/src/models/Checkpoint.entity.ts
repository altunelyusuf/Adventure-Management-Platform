import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Quest } from './Quest.entity';
import { CheckpointCompletion } from './CheckpointCompletion.entity';

export enum ValidationType {
  GPS = 'GPS',
  PHOTO = 'PHOTO',
  QR_CODE = 'QR_CODE',
  QUESTION = 'QUESTION',
  AR_MARKER = 'AR_MARKER',
  TIME_BASED = 'TIME_BASED',
}

@Entity({ schema: 'quests', name: 'checkpoints' })
@Index(['questId'])
@Index(['questId', 'orderIndex'], { unique: true })
@Index(['latitude', 'longitude'])
export class Checkpoint {
  @PrimaryGeneratedColumn('uuid', { name: 'checkpoint_id' })
  checkpointId!: string;

  @Column({ type: 'uuid', name: 'quest_id' })
  questId!: string;

  @Column({ type: 'integer', name: 'order_index' })
  orderIndex!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Location
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ type: 'integer', default: 50 })
  radius!: number;

  @Column({ type: 'text', nullable: true })
  address?: string;

  // Validation
  @Column({ type: 'enum', enum: ValidationType, name: 'validation_type', default: ValidationType.GPS })
  validationType!: ValidationType;

  @Column({ type: 'jsonb', name: 'validation_data', default: '{}' })
  validationData!: {
    requirePhoto?: boolean;
    photoPrompt?: string;
    qrCodeData?: string;
    question?: string;
    correctAnswer?: string;
    timeStart?: string;
    timeEnd?: string;
  };

  // Rewards
  @Column({ type: 'integer', name: 'points_reward', default: 0 })
  pointsReward!: number;

  // Metadata
  @Column({ type: 'simple-array', nullable: true })
  hints?: string[];

  @Column({ type: 'boolean', name: 'is_optional', default: false })
  isOptional!: boolean;

  @Column({ type: 'integer', name: 'estimated_time', nullable: true })
  estimatedTime?: number;

  // Images
  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Quest, (quest) => quest.checkpoints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quest_id' })
  quest!: Quest;

  @OneToMany(() => CheckpointCompletion, (completion) => completion.checkpoint)
  completions!: CheckpointCompletion[];
}
