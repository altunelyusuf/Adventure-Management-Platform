import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Block Entity
 * Stores user blocks
 */
@Entity({ schema: 'social', name: 'blocks' })
@Index(['blockerId', 'blockedId'], { unique: true })
@Index(['blockerId'])
@Index(['blockedId'])
export class Block {
  @PrimaryGeneratedColumn('uuid', { name: 'block_id' })
  blockId!: string;

  @Column({ type: 'uuid', name: 'blocker_id' })
  blockerId!: string;

  @Column({ type: 'uuid', name: 'blocked_id' })
  blockedId!: string;

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
