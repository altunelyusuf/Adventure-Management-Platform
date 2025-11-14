import { Request, Response } from 'express';
import { RoutingService } from '../services';

export class RoutingController {
  private routingService: RoutingService;

  constructor() {
    this.routingService = new RoutingService();
  }

  createRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = (req as any).user;
      const route = await this.routingService.createRoute({
        ...req.body,
        userId,
      });

      res.status(201).json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { routeId } = req.params;
      const route = await this.routingService.getRoute(routeId);

      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }

      res.json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUserRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const routes = await this.routingService.getUserRoutes(userId, limit, offset);
      res.json({ routes, count: routes.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  startRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { routeId } = req.params;
      const route = await this.routingService.startRoute(routeId);
      res.json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  completeRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { routeId } = req.params;
      const route = await this.routingService.completeRoute(routeId);
      res.json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getNextWaypoint = async (req: Request, res: Response): Promise<void> => {
    try {
      const { routeId } = req.params;
      const { latitude, longitude } = req.query;

      const next = await this.routingService.getNextWaypoint(
        routeId,
        parseFloat(latitude as string),
        parseFloat(longitude as string)
      );

      res.json(next);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
