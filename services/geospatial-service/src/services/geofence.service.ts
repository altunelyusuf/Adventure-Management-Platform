import { AppDataSource } from '../config/database';
import { Geofence, GeofenceType, GeofenceStatus } from '../models/Geofence.entity';
import { Repository } from 'typeorm';
import { getDistance, isPointInPolygon } from 'geolib';
import config from '../config';

export interface CreateGeofenceDTO {
  name: string;
  questId?: string;
  checkpointId?: string;
  type: GeofenceType;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  polygon?: any;
  expiresAt?: Date;
  metadata?: any;
}

export class GeofenceService {
  private geofenceRepository: Repository<Geofence>;

  constructor() {
    this.geofenceRepository = AppDataSource.getRepository(Geofence);
  }

  /**
   * Create a geofence
   */
  async createGeofence(data: CreateGeofenceDTO): Promise<Geofence> {
    const geofence = this.geofenceRepository.create({
      ...data,
      status: GeofenceStatus.ACTIVE,
    });

    return this.geofenceRepository.save(geofence);
  }

  /**
   * Get geofence by ID
   */
  async getGeofence(geofenceId: string): Promise<Geofence | null> {
    return this.geofenceRepository.findOne({
      where: { geofenceId },
    });
  }

  /**
   * Get geofences for a quest
   */
  async getQuestGeofences(questId: string): Promise<Geofence[]> {
    return this.geofenceRepository.find({
      where: { questId, status: GeofenceStatus.ACTIVE },
    });
  }

  /**
   * Check if a location is within a geofence (circular)
   */
  isWithinCircularGeofence(
    latitude: number,
    longitude: number,
    geofence: Geofence
  ): boolean {
    const distance = getDistance(
      { latitude, longitude },
      { latitude: geofence.centerLatitude, longitude: geofence.centerLongitude }
    );

    return distance <= geofence.radius;
  }

  /**
   * Check if a location is within a geofence (polygon)
   */
  isWithinPolygonGeofence(
    latitude: number,
    longitude: number,
    geofence: Geofence
  ): boolean {
    if (!geofence.polygon || !geofence.polygon.coordinates) {
      return false;
    }

    const polygonCoords = geofence.polygon.coordinates[0].map(([lng, lat]: number[]) => ({
      latitude: lat,
      longitude: lng,
    }));

    return isPointInPolygon({ latitude, longitude }, polygonCoords);
  }

  /**
   * Check if a location is within any geofence
   */
  async checkGeofenceEntry(
    latitude: number,
    longitude: number,
    questId?: string
  ): Promise<Geofence[]> {
    let geofences: Geofence[];

    if (questId) {
      geofences = await this.getQuestGeofences(questId);
    } else {
      geofences = await this.geofenceRepository.find({
        where: { status: GeofenceStatus.ACTIVE },
      });
    }

    const enteredGeofences: Geofence[] = [];

    for (const geofence of geofences) {
      let isWithin = false;

      if (geofence.polygon) {
        isWithin = this.isWithinPolygonGeofence(latitude, longitude, geofence);
      } else {
        isWithin = this.isWithinCircularGeofence(latitude, longitude, geofence);
      }

      if (isWithin) {
        enteredGeofences.push(geofence);
      }
    }

    return enteredGeofences;
  }

  /**
   * Get nearby geofences
   */
  async getNearbyGeofences(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ): Promise<Geofence[]> {
    const geofences = await this.geofenceRepository.find({
      where: { status: GeofenceStatus.ACTIVE },
    });

    return geofences.filter((geofence) => {
      const distance = getDistance(
        { latitude, longitude },
        { latitude: geofence.centerLatitude, longitude: geofence.centerLongitude }
      );

      return distance <= radiusMeters;
    });
  }

  /**
   * Update geofence status
   */
  async updateGeofenceStatus(
    geofenceId: string,
    status: GeofenceStatus
  ): Promise<Geofence> {
    const geofence = await this.getGeofence(geofenceId);
    if (!geofence) {
      throw new Error('Geofence not found');
    }

    geofence.status = status;
    return this.geofenceRepository.save(geofence);
  }

  /**
   * Delete geofence
   */
  async deleteGeofence(geofenceId: string): Promise<void> {
    await this.geofenceRepository.delete({ geofenceId });
  }

  /**
   * Expire old geofences
   */
  async expireOldGeofences(): Promise<number> {
    const result = await this.geofenceRepository
      .createQueryBuilder()
      .update()
      .set({ status: GeofenceStatus.EXPIRED })
      .where('expires_at < :now', { now: new Date() })
      .andWhere('status = :status', { status: GeofenceStatus.ACTIVE })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get distance to geofence
   */
  getDistanceToGeofence(
    latitude: number,
    longitude: number,
    geofence: Geofence
  ): number {
    const distance = getDistance(
      { latitude, longitude },
      { latitude: geofence.centerLatitude, longitude: geofence.centerLongitude }
    );

    return Math.max(0, distance - geofence.radius);
  }
}
