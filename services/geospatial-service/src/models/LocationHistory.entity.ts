import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'geospatial', name: 'location_history' })
@Index(['userId', 'timestamp'])
@Index(['questId', 'timestamp'])
export class LocationHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' })
  locationId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'quest_id', nullable: true })
  questId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  altitude?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  accuracy?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heading?: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    deviceId?: string;
    batteryLevel?: number;
    networkType?: string;
    activityType?: string; // walking, running, cycling, driving
  };
}
