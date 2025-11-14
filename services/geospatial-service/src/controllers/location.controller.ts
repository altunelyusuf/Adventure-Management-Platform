import { Request, Response } from 'express';
import { LocationService } from '../services';

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  trackLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const { latitude, longitude, altitude, accuracy, speed, heading, questId, metadata } =
        req.body;

      const location = await this.locationService.trackLocation({
        userId,
        questId,
        latitude,
        longitude,
        altitude,
        accuracy,
        speed,
        heading,
        metadata,
      });

      res.status(201).json(location);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getCurrentLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const location = await this.locationService.getCurrentLocation(userId);

      if (!location) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }

      res.json(location);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getLocationHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await this.locationService.getLocationHistory(userId, limit, offset);
      res.json({ history, count: history.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  findNearbyUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      const users = await this.locationService.findNearbyUsers(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string) || 1000,
        limit
      );

      res.json({ users, count: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
