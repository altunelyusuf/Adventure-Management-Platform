import { Request, Response } from 'express';
import { GeofenceService } from '../services';

export class GeofenceController {
  private geofenceService: GeofenceService;

  constructor() {
    this.geofenceService = new GeofenceService();
  }

  createGeofence = async (req: Request, res: Response): Promise<void> => {
    try {
      const geofence = await this.geofenceService.createGeofence(req.body);
      res.status(201).json(geofence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getGeofence = async (req: Request, res: Response): Promise<void> => {
    try {
      const { geofenceId } = req.params;
      const geofence = await this.geofenceService.getGeofence(geofenceId);

      if (!geofence) {
        res.status(404).json({ error: 'Geofence not found' });
        return;
      }

      res.json(geofence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  checkGeofenceEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, questId } = req.query;

      const geofences = await this.geofenceService.checkGeofenceEntry(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        questId as string
      );

      res.json({ geofences, entered: geofences.length > 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getNearbyGeofences = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;

      const geofences = await this.geofenceService.getNearbyGeofences(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string) || 5000
      );

      res.json({ geofences, count: geofences.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
