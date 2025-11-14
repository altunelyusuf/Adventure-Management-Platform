import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity({ schema: 'payments', name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId!: string;

  @Column({ type: 'uuid', name: 'subscription_id' })
  subscriptionId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'creator_id' })
  creatorId!: string;

  @Column({ type: 'varchar', length: 255, name: 'stripe_payment_intent_id' })
  stripePaymentIntentId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'platform_fee' })
  platformFee!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'creator_amount' })
  creatorAmount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'succeeded_at' })
  succeededAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'failure_reason' })
  failureReason?: string;
}
