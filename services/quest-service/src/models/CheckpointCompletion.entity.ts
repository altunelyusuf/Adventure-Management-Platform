import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { QuestParticipation } from './QuestParticipation.entity';
import { Checkpoint } from './Checkpoint.entity';

@Entity({ schema: 'quests', name: 'checkpoint_completions' })
@Index(['participationId'])
@Index(['checkpointId'])
@Index(['participationId', 'checkpointId'], { unique: true })
export class CheckpointCompletion {
  @PrimaryGeneratedColumn('uuid', { name: 'completion_id' })
  completionId!: string;

  @Column({ type: 'uuid', name: 'participation_id' })
  participationId!: string;

  @Column({ type: 'uuid', name: 'checkpoint_id' })
  checkpointId!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'completed_at' })
  completedAt!: Date;

  // Proof of completion
  @Column({ type: 'text', name: 'proof_url', nullable: true })
  proofUrl?: string;

  @Column({ type: 'boolean', default: false })
  validated!: boolean;

  @Column({ type: 'varchar', length: 20, name: 'validation_method', nullable: true })
  validationMethod?: string;

  // Location data at time of completion
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'distance_from_checkpoint', nullable: true })
  distanceFromCheckpoint?: number;

  // Answer for question-based checkpoints
  @Column({ type: 'text', nullable: true })
  answer?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => QuestParticipation, (participation) => participation.checkpointCompletions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participation_id' })
  participation!: QuestParticipation;

  @ManyToOne(() => Checkpoint, (checkpoint) => checkpoint.completions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checkpoint_id' })
  checkpoint!: Checkpoint;
}
