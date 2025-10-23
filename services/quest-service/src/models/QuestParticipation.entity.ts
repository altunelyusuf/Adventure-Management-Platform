import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Quest } from './Quest.entity';
import { CheckpointCompletion } from './CheckpointCompletion.entity';

export enum ParticipationStatus {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity({ schema: 'quests', name: 'participations' })
@Index(['userId'])
@Index(['questId'])
@Index(['status'])
@Index(['questId', 'userId'], { unique: true })
export class QuestParticipation {
  @PrimaryGeneratedColumn('uuid', { name: 'participation_id' })
  participationId!: string;

  @Column({ type: 'uuid', name: 'quest_id' })
  questId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: ParticipationStatus, default: ParticipationStatus.STARTED })
  status!: ParticipationStatus;

  @Column({ type: 'integer', default: 0 })
  progress!: number;

  @Column({ type: 'integer', name: 'checkpoints_completed', default: 0 })
  checkpointsCompleted!: number;

  @Column({ type: 'integer', name: 'total_checkpoints', default: 0 })
  totalCheckpoints!: number;

  @Column({ type: 'integer', name: 'points_earned', default: 0 })
  pointsEarned!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'distance_traveled', nullable: true })
  distanceTraveled?: number;

  @CreateDateColumn({ type: 'timestamp', name: 'started_at' })
  startedAt!: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', name: 'last_activity_at', nullable: true })
  lastActivityAt?: Date;

  // Rating given by user after completion
  @Column({ type: 'integer', nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  review?: string;

  // Relationships
  @ManyToOne(() => Quest, (quest) => quest.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quest_id' })
  quest!: Quest;

  @OneToMany(() => CheckpointCompletion, (completion) => completion.participation)
  checkpointCompletions!: CheckpointCompletion[];
}
