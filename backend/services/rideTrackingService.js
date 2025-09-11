const { calculateDistance } = require('../utils/haversine');

class RideTrackingService {
  constructor() {
    this.activeRides = new Map(); // Store active ride simulations
  }

  // Start simulated cab movement
  startRideSimulation(rideId, pickup, dropoff, driverId) {
    // Parameter validation
    if (!rideId) throw new Error('rideId is required');
    if (!driverId) throw new Error('driverId is required');
    if (!pickup || typeof pickup !== 'object') throw new Error('pickup location is required');
    if (!dropoff || typeof dropoff !== 'object') throw new Error('dropoff location is required');
    if (typeof pickup.latitude !== 'number' || typeof pickup.longitude !== 'number') {
      throw new Error('pickup must have valid latitude and longitude');
    }
    if (typeof dropoff.latitude !== 'number' || typeof dropoff.longitude !== 'number') {
      throw new Error('dropoff must have valid latitude and longitude');
    }
    
    if (this.activeRides.has(rideId)) {
      console.log(`Ride ${encodeURIComponent(rideId)} is already being tracked`);
      return false; // Already tracking
    }

    const simulation = {
      rideId,
      driverId,
      pickup,
      dropoff,
      currentLocation: { ...pickup },
      progress: 0,
      totalDistance: calculateDistance(pickup.latitude, pickup.longitude, dropoff.latitude, dropoff.longitude),
      startTime: new Date(),
      isActive: true
    };

    this.activeRides.set(rideId, simulation);
    this.simulateMovement(rideId);
    return true; // Successfully started tracking
  }

  // Simulate cab movement along route
  simulateMovement(rideId) {
    const simulation = this.activeRides.get(rideId);
    if (!simulation || !simulation.isActive) return;

    const interval = setInterval(() => {
      if (!simulation.isActive || simulation.progress >= 1) {
        clearInterval(interval);
        this.activeRides.delete(rideId);
        return;
      }

      // Move 10% closer to destination every 2 seconds
      simulation.progress += 0.10;
      
      // Calculate current position using linear interpolation
      const lat1 = simulation.pickup.latitude;
      const lon1 = simulation.pickup.longitude;
      const lat2 = simulation.dropoff.latitude;
      const lon2 = simulation.dropoff.longitude;
      
      simulation.currentLocation = {
        latitude: Number(lat1 + (lat2 - lat1) * simulation.progress),
        longitude: Number(lon1 + (lon2 - lon1) * simulation.progress),
        address: String(`En route to ${simulation.dropoff.address || 'destination'}`)
      };

      // Update location file safely
      try {
        const locationService = require('./locationService');
        locationService.updateDriverLocationInFile(
          simulation.driverId,
          simulation.currentLocation,
          'busy'
        );
      } catch (error) {
        console.error(`Failed to update driver location for ${encodeURIComponent(simulation.driverId)}:`, error.message);
      }

    }, 2000); // Update every 2 seconds
  }

  // Get current ride status
  getRideStatus(rideId) {
    const simulation = this.activeRides.get(rideId);
    if (!simulation) return null;

    const remainingDistance = simulation.totalDistance * (1 - simulation.progress);
    const eta = Math.ceil(remainingDistance); // ETA in minutes at 60 km/h

    return {
      currentLocation: {
        latitude: Number(simulation.currentLocation.latitude),
        longitude: Number(simulation.currentLocation.longitude),
        address: String(simulation.currentLocation.address || 'In transit')
      },
      progress: Number(Math.round(simulation.progress * 100)),
      remainingDistance: Number(Math.round(remainingDistance * 100) / 100),
      eta: Number(eta),
      isActive: Boolean(simulation.isActive)
    };
  }

  // Stop ride simulation
  stopRideSimulation(rideId) {
    const simulation = this.activeRides.get(rideId);
    if (simulation) {
      simulation.isActive = false;
      this.activeRides.delete(rideId);
    }
  }
}

module.exports = new RideTrackingService();