import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  EXPIRED = 'EXPIRED',
}

export enum SubscriptionTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

@Entity({ schema: 'payments', name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid', { name: 'subscription_id' })
  subscriptionId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'creator_id' })
  creatorId!: string;

  @Column({ type: 'varchar', length: 255, name: 'stripe_subscription_id' })
  stripeSubscriptionId!: string;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.BASIC })
  tier!: SubscriptionTier;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'current_period_start' })
  currentPeriodStart?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'current_period_end' })
  currentPeriodEnd?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt?: Date;
}
