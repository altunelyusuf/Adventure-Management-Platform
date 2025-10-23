import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';

@Entity({ schema: 'auth', name: 'login_attempts' })
@Index(['userId', 'attemptedAt'])
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid', { name: 'attempt_id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ipAddress!: string;

  @CreateDateColumn({ name: 'attempted_at' })
  attemptedAt!: Date;

  @Column({ type: 'boolean' })
  success!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'failure_reason' })
  failureReason?: string;
}
