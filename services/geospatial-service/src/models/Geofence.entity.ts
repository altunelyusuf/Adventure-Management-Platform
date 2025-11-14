import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GeofenceType {
  CHECKPOINT = 'CHECKPOINT',
  ZONE = 'ZONE',
  BOUNDARY = 'BOUNDARY',
  CUSTOM = 'CUSTOM',
}

export enum GeofenceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity({ schema: 'geospatial', name: 'geofences' })
export class Geofence {
  @PrimaryGeneratedColumn('uuid', { name: 'geofence_id' })
  geofenceId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'uuid', name: 'quest_id', nullable: true })
  questId?: string;

  @Column({ type: 'uuid', name: 'checkpoint_id', nullable: true })
  checkpointId?: string;

  @Column({ type: 'enum', enum: GeofenceType, default: GeofenceType.CHECKPOINT })
  type!: GeofenceType;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'center_latitude' })
  centerLatitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'center_longitude' })
  centerLongitude!: number;

  @Column({ type: 'integer' }) // radius in meters
  radius!: number;

  @Column({ type: 'enum', enum: GeofenceStatus, default: GeofenceStatus.ACTIVE })
  status!: GeofenceStatus;

  @Column({ type: 'jsonb', nullable: true })
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON polygon format
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    description?: string;
    triggerAction?: string;
    notifyOnEnter?: boolean;
    notifyOnExit?: boolean;
  };
}
