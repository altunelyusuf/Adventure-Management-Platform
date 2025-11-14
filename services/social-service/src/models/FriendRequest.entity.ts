import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * FriendRequest Entity
 * Stores friend request state
 */
@Entity({ schema: 'social', name: 'friend_requests' })
@Index(['senderId', 'receiverId'], { unique: true })
@Index(['senderId'])
@Index(['receiverId'])
@Index(['status'])
@Index(['createdAt'])
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  requestId!: string;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId!: string;

  @Column({ type: 'uuid', name: 'receiver_id' })
  receiverId!: string;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    name: 'status',
    default: FriendRequestStatus.PENDING,
  })
  status!: FriendRequestStatus;

  @Column({ type: 'text', name: 'message', nullable: true })
  message?: string;

  @Column({ type: 'timestamp', name: 'responded_at', nullable: true })
  respondedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt?: Date;
}
