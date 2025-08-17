const { calculateDistance } = require('../utils/haversine');

class FareCalculator {
    constructor() {
        this.baseFares = {
            hatchback: 40,
            sedan: 50,
            suv: 70
        };
        
        this.perKmRates = {
            hatchback: 12,
            sedan: 15,
            suv: 20
        };
        
        this.perMinuteRates = {
            hatchback: 2,
            sedan: 2.5,
            suv: 3
        };
        
        this.taxRate = 0.18; // 18% GST
        this.surgeHours = [7, 8, 9, 17, 18, 19, 20]; // Peak hours
    }

    // Calculate fare based on distance, time, and vehicle type
    calculateFare(distance, duration, vehicleType = 'sedan', dateTime = new Date()) {
        const baseFare = this.baseFares[vehicleType] || this.baseFares.sedan;
        const perKmRate = this.perKmRates[vehicleType] || this.perKmRates.sedan;
        const perMinuteRate = this.perMinuteRates[vehicleType] || this.perMinuteRates.sedan;
        
        // Calculate base components
        const distanceFare = distance * perKmRate;
        const timeFare = duration * perMinuteRate;
        
        // Calculate surge multiplier
        const surgeMultiplier = this.getSurgeMultiplier(dateTime);
        
        // Subtotal before tax
        const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
        
        // Calculate tax
        const tax = subtotal * this.taxRate;
        
        // Total fare
        const totalFare = subtotal + tax;
        
        return {
            base_fare: Math.round(baseFare),
            distance_fare: Math.round(distanceFare),
            time_fare: Math.round(timeFare),
            surge_multiplier: surgeMultiplier,
            subtotal: Math.round(subtotal),
            tax: Math.round(tax),
            total_fare: Math.round(totalFare),
            breakdown: {
                distance: Math.round(distance * 100) / 100,
                duration,
                vehicle_type: vehicleType,
                per_km_rate: perKmRate,
                per_minute_rate: perMinuteRate
            }
        };
    }

    // Get surge multiplier based on time
    getSurgeMultiplier(dateTime) {
        const hour = dateTime.getHours();
        const day = dateTime.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Weekend surge
        if (day === 0 || day === 6) {
            return 1.3;
        }
        
        // Peak hour surge
        if (this.surgeHours.includes(hour)) {
            return 1.5;
        }
        
        // Late night surge (11 PM - 5 AM)
        if (hour >= 23 || hour <= 5) {
            return 1.4;
        }
        
        return 1.0; // Normal rate
    }

    // Estimate fare for trip planning
    estimateFare(pickupLocation, dropLocation, vehicleType = 'sedan') {
        const distance = calculateDistance(
            pickupLocation.latitude, pickupLocation.longitude,
            dropLocation.latitude, dropLocation.longitude
        );
        
        // Estimate duration (40 km/h average speed)
        const estimatedDuration = Math.ceil(distance / 40 * 60);
        
        const fareDetails = this.calculateFare(distance, estimatedDuration, vehicleType);
        
        return {
            ...fareDetails,
            estimated_distance: distance,
            estimated_duration: estimatedDuration,
            currency: 'INR'
        };
    }

    // Apply discount
    applyDiscount(fareAmount, discountPercent = 0, maxDiscount = 100) {
        const discountAmount = Math.min(
            (fareAmount * discountPercent) / 100,
            maxDiscount
        );
        
        return {
            original_fare: fareAmount,
            discount_percent: discountPercent,
            discount_amount: Math.round(discountAmount),
            final_fare: Math.round(fareAmount - discountAmount)
        };
    }
}

module.exports = FareCalculator;