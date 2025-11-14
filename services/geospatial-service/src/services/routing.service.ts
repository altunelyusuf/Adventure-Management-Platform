import { AppDataSource } from '../config/database';
import { Route, RouteStatus } from '../models/Route.entity';
import { Repository } from 'typeorm';
import { getDistance, getPathLength, getRhumbLineBearing } from 'geolib';
import config from '../config';

export interface Waypoint {
  latitude: number;
  longitude: number;
  order: number;
  name?: string;
}

export interface CreateRouteDTO {
  userId: string;
  questId?: string;
  name: string;
  waypoints: Waypoint[];
  profile?: string;
  metadata?: any;
}

export class RoutingService {
  private routeRepository: Repository<Route>;

  constructor() {
    this.routeRepository = AppDataSource.getRepository(Route);
  }

  /**
   * Create a route from waypoints
   */
  async createRoute(data: CreateRouteDTO): Promise<Route> {
    if (data.waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required');
    }

    if (data.waypoints.length > config.routing.maxWaypoints) {
      throw new Error(`Maximum ${config.routing.maxWaypoints} waypoints allowed`);
    }

    // Calculate path and distance
    const path = this.generatePath(data.waypoints);
    const totalDistance = this.calculateTotalDistance(data.waypoints);
    const estimatedDuration = this.estimateDuration(
      totalDistance,
      data.profile || config.routing.defaultProfile
    );

    const route = this.routeRepository.create({
      userId: data.userId,
      questId: data.questId,
      name: data.name,
      waypoints: data.waypoints,
      path,
      totalDistance,
      estimatedDuration,
      profile: data.profile || config.routing.defaultProfile,
      metadata: data.metadata,
    });

    return this.routeRepository.save(route);
  }

  /**
   * Generate path from waypoints (simple line)
   */
  private generatePath(waypoints: Waypoint[]): any {
    const coordinates = waypoints
      .sort((a, b) => a.order - b.order)
      .map((wp) => [wp.longitude, wp.latitude]);

    return {
      type: 'LineString',
      coordinates,
    };
  }

  /**
   * Calculate total distance of route
   */
  private calculateTotalDistance(waypoints: Waypoint[]): number {
    const sorted = waypoints.sort((a, b) => a.order - b.order);
    const coords = sorted.map((wp) => ({
      latitude: wp.latitude,
      longitude: wp.longitude,
    }));

    return getPathLength(coords); // in meters
  }

  /**
   * Estimate duration based on distance and profile
   */
  private estimateDuration(distanceMeters: number, profile: string): number {
    // Average speeds in km/h
    const speeds: Record<string, number> = {
      walking: 5,
      running: 10,
      cycling: 20,
      driving: 50,
    };

    const speedKmh = speeds[profile] || speeds.walking;
    const distanceKm = distanceMeters / 1000;
    const durationHours = distanceKm / speedKmh;

    return Math.round(durationHours * 3600); // in seconds
  }

  /**
   * Get route by ID
   */
  async getRoute(routeId: string): Promise<Route | null> {
    return this.routeRepository.findOne({
      where: { routeId },
    });
  }

  /**
   * Get user's routes
   */
  async getUserRoutes(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Route[]> {
    return this.routeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get quest routes
   */
  async getQuestRoutes(questId: string): Promise<Route[]> {
    return this.routeRepository.find({
      where: { questId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Start a route
   */
  async startRoute(routeId: string): Promise<Route> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.startedAt = new Date();
    route.status = RouteStatus.ACTIVE;

    return this.routeRepository.save(route);
  }

  /**
   * Complete a route
   */
  async completeRoute(routeId: string): Promise<Route> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.completedAt = new Date();
    route.status = RouteStatus.COMPLETED;

    return this.routeRepository.save(route);
  }

  /**
   * Cancel a route
   */
  async cancelRoute(routeId: string): Promise<Route> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.status = RouteStatus.CANCELLED;
    return this.routeRepository.save(route);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    return getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    );
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return getRhumbLineBearing(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    );
  }

  /**
   * Get navigation instructions for next waypoint
   */
  async getNextWaypoint(
    routeId: string,
    currentLat: number,
    currentLon: number
  ): Promise<any> {
    const route = await this.getRoute(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Find closest waypoint that hasn't been reached
    let nextWaypoint = null;
    let minDistance = Infinity;

    for (const waypoint of route.waypoints) {
      const distance = this.calculateDistance(
        currentLat,
        currentLon,
        waypoint.latitude,
        waypoint.longitude
      );

      if (distance < minDistance && distance > 10) {
        // More than 10m away
        minDistance = distance;
        nextWaypoint = waypoint;
      }
    }

    if (!nextWaypoint) {
      return {
        message: 'Route completed',
        completed: true,
      };
    }

    const bearing = this.calculateBearing(
      currentLat,
      currentLon,
      nextWaypoint.latitude,
      nextWaypoint.longitude
    );

    return {
      waypoint: nextWaypoint,
      distance: minDistance,
      bearing,
      direction: this.getDirection(bearing),
    };
  }

  /**
   * Get cardinal direction from bearing
   */
  private getDirection(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  /**
   * Delete route
   */
  async deleteRoute(routeId: string): Promise<void> {
    await this.routeRepository.delete({ routeId });
  }
}
