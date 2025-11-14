import { AppDataSource, getMongoDb } from '../config/database';
import { LocationHistory } from '../models/LocationHistory.entity';
import { Repository } from 'typeorm';
import { getDistance } from 'geolib';
import config from '../config';

export interface LocationUpdate {
  userId: string;
  questId?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  metadata?: any;
}

export class LocationService {
  private locationRepository: Repository<LocationHistory>;

  constructor() {
    this.locationRepository = AppDataSource.getRepository(LocationHistory);
  }

  /**
   * Track user location (save to both PostgreSQL and MongoDB)
   */
  async trackLocation(data: LocationUpdate): Promise<LocationHistory> {
    // Save to PostgreSQL
    const location = this.locationRepository.create(data);
    const saved = await this.locationRepository.save(location);

    // Save to MongoDB for geospatial queries
    try {
      const db = getMongoDb();
      await db.collection('locations').insertOne({
        userId: data.userId,
        questId: data.questId,
        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude],
        },
        altitude: data.altitude,
        accuracy: data.accuracy,
        speed: data.speed,
        heading: data.heading,
        timestamp: new Date(),
        metadata: data.metadata,
      });
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
    }

    return saved;
  }

  /**
   * Get user's current location (latest)
   */
  async getCurrentLocation(userId: string): Promise<LocationHistory | null> {
    return this.locationRepository.findOne({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get user's location history
   */
  async getLocationHistory(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<LocationHistory[]> {
    return this.locationRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: Math.min(limit, config.tracking.maxHistoryLength),
      skip: offset,
    });
  }

  /**
   * Get location history for a specific quest
   */
  async getQuestLocationHistory(
    userId: string,
    questId: string,
    limit: number = 100
  ): Promise<LocationHistory[]> {
    return this.locationRepository.find({
      where: { userId, questId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find nearby users (using MongoDB geospatial queries)
   */
  async findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const db = getMongoDb();
      const results = await db
        .collection('locations')
        .aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              distanceField: 'distance',
              maxDistance: radiusMeters,
              spherical: true,
            },
          },
          {
            $group: {
              _id: '$userId',
              latestLocation: { $first: '$$ROOT' },
            },
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      return results.map((r) => ({
        userId: r._id,
        latitude: r.latestLocation.location.coordinates[1],
        longitude: r.latestLocation.location.coordinates[0],
        distance: r.latestLocation.distance,
        timestamp: r.latestLocation.timestamp,
      }));
    } catch (error) {
      console.error('Error finding nearby users:', error);
      return [];
    }
  }

  /**
   * Calculate distance traveled for a quest
   */
  async calculateDistanceTraveled(userId: string, questId: string): Promise<number> {
    const locations = await this.getQuestLocationHistory(userId, questId, 10000);

    if (locations.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const distance = getDistance(
        { latitude: locations[i].latitude, longitude: locations[i].longitude },
        { latitude: locations[i + 1].latitude, longitude: locations[i + 1].longitude }
      );
      totalDistance += distance;
    }

    return totalDistance; // in meters
  }

  /**
   * Get active tracking sessions
   */
  async getActiveTrackingSessions(userId: string): Promise<any[]> {
    try {
      const db = getMongoDb();
      const recentTime = new Date(Date.now() - 3600000); // Last hour

      const results = await db
        .collection('locations')
        .aggregate([
          {
            $match: {
              userId,
              timestamp: { $gte: recentTime },
            },
          },
          {
            $group: {
              _id: '$questId',
              count: { $sum: 1 },
              lastUpdate: { $max: '$timestamp' },
            },
          },
        ])
        .toArray();

      return results;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Delete old location history (cleanup)
   */
  async deleteOldLocations(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.locationRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
