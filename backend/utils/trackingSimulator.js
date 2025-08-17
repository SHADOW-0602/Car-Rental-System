const { calculateDistance } = require('./haversine');

// Simulate realistic trip movement with waypoints
class TripSimulator {
    constructor() {
        this.activeSimulations = new Map();
    }

    // Generate waypoints between start and end
    generateWaypoints(start, end, numPoints = 10) {
        const waypoints = [start];
        
        for (let i = 1; i < numPoints; i++) {
            const ratio = i / numPoints;
            const lat = start.latitude + (end.latitude - start.latitude) * ratio;
            const lon = start.longitude + (end.longitude - start.longitude) * ratio;
            
            // Add some randomness to simulate real roads
            const randomOffset = 0.001;
            waypoints.push({
                latitude: lat + (Math.random() - 0.5) * randomOffset,
                longitude: lon + (Math.random() - 0.5) * randomOffset
            });
        }
        
        waypoints.push(end);
        return waypoints;
    }

    // Calculate ETA based on distance and traffic conditions
    calculateETA(currentLocation, destination, trafficFactor = 1.2) {
        const distance = calculateDistance(
            currentLocation.latitude, currentLocation.longitude,
            destination.latitude, destination.longitude
        );
        
        // Base speed: 40 km/h, adjusted for traffic
        const adjustedSpeed = 40 / trafficFactor;
        const etaMinutes = Math.ceil(distance / adjustedSpeed * 60);
        
        return {
            distance: Math.round(distance * 100) / 100,
            eta: etaMinutes,
            trafficFactor
        };
    }

    // Simulate trip progress with realistic updates
    simulateTripProgress(rideId, start, end, callback) {
        const waypoints = this.generateWaypoints(start, end, 15);
        let currentIndex = 0;
        
        const simulation = {
            waypoints,
            currentIndex,
            startTime: new Date(),
            status: 'active'
        };
        
        this.activeSimulations.set(rideId, simulation);
        
        const interval = setInterval(() => {
            if (currentIndex >= waypoints.length - 1) {
                clearInterval(interval);
                this.activeSimulations.delete(rideId);
                callback({
                    rideId,
                    status: 'completed',
                    message: 'Trip completed',
                    timestamp: new Date()
                });
                return;
            }
            
            const currentLocation = waypoints[currentIndex];
            const destination = waypoints[waypoints.length - 1];
            const etaData = this.calculateETA(currentLocation, destination);
            
            callback({
                rideId,
                currentLocation,
                destination,
                progress: Math.round((currentIndex / (waypoints.length - 1)) * 100),
                ...etaData,
                status: 'in_progress',
                timestamp: new Date()
            });
            
            currentIndex++;
        }, 4000); // Update every 4 seconds
        
        return simulation;
    }

    // Stop simulation
    stopSimulation(rideId) {
        const simulation = this.activeSimulations.get(rideId);
        if (simulation) {
            simulation.status = 'stopped';
            this.activeSimulations.delete(rideId);
            return true;
        }
        return false;
    }

    // Get simulation status
    getSimulationStatus(rideId) {
        return this.activeSimulations.get(rideId) || null;
    }
}

module.exports = TripSimulator;