import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ schema: 'geospatial', name: 'routes' })
export class Route {
  @PrimaryGeneratedColumn('uuid', { name: 'route_id' })
  routeId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'quest_id', nullable: true })
  questId?: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'jsonb', name: 'waypoints' })
  waypoints!: {
    latitude: number;
    longitude: number;
    order: number;
    name?: string;
  }[];

  @Column({ type: 'jsonb', name: 'path' })
  path!: {
    type: 'LineString';
    coordinates: number[][]; // GeoJSON LineString format
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_distance' })
  totalDistance!: number; // in meters

  @Column({ type: 'integer', name: 'estimated_duration' })
  estimatedDuration!: number; // in seconds

  @Column({ type: 'varchar', length: 50, default: 'walking' })
  profile!: string; // walking, cycling, driving

  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.ACTIVE })
  status!: RouteStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'started_at' })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    elevationGain?: number;
    elevationLoss?: number;
    surface?: string;
    difficulty?: string;
  };
}
