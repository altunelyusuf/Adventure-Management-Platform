import { Router } from 'express';
import { LocationController, GeofenceController, RoutingController } from '../controllers';

const router = Router();

const locationController = new LocationController();
const geofenceController = new GeofenceController();
const routingController = new RoutingController();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'geospatial-service' });
});

// Location routes
router.post('/locations/track', locationController.trackLocation);
router.get('/locations/current/:userId', locationController.getCurrentLocation);
router.get('/locations/history/:userId', locationController.getLocationHistory);
router.get('/locations/nearby', locationController.findNearbyUsers);

// Geofence routes
router.post('/geofences', geofenceController.createGeofence);
router.get('/geofences/:geofenceId', geofenceController.getGeofence);
router.get('/geofences/check/entry', geofenceController.checkGeofenceEntry);
router.get('/geofences/nearby/list', geofenceController.getNearbyGeofences);

// Routing routes
router.post('/routes', routingController.createRoute);
router.get('/routes/:routeId', routingController.getRoute);
router.get('/routes/user/:userId', routingController.getUserRoutes);
router.put('/routes/:routeId/start', routingController.startRoute);
router.put('/routes/:routeId/complete', routingController.completeRoute);
router.get('/routes/:routeId/next-waypoint', routingController.getNextWaypoint);

export default router;
