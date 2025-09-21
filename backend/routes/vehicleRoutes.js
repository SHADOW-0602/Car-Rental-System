const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Driver = require('../models/Driver');

// Get all available vehicles
router.get('/', auth, async (req, res) => {
  try {
    // Get drivers with vehicle information who are available
    const drivers = await Driver.find({
      status: 'available',
      'driverInfo.isVerified': true,
      'driverInfo.vehicleType': { $exists: true }
    }).select('name driverInfo location');

    // Transform driver data to vehicle format
    const vehicles = drivers.map(driver => ({
      _id: driver._id,
      make: driver.driverInfo.vehicleMake || 'Unknown',
      model: driver.driverInfo.vehicleModel || 'Vehicle',
      vehicle_type: driver.driverInfo.vehicleType || 'economy',
      fare_per_km: getFareByType(driver.driverInfo.vehicleType),
      availability: true,
      driver_id: {
        _id: driver._id,
        name: driver.name
      },
      location: driver.location
    }));

    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('name driverInfo location');
    
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const vehicle = {
      _id: driver._id,
      make: driver.driverInfo.vehicleMake || 'Unknown',
      model: driver.driverInfo.vehicleModel || 'Vehicle',
      vehicle_type: driver.driverInfo.vehicleType || 'economy',
      fare_per_km: getFareByType(driver.driverInfo.vehicleType),
      availability: driver.status === 'available',
      driver_id: {
        _id: driver._id,
        name: driver.name
      },
      location: driver.location,
      features: getVehicleFeatures(driver.driverInfo.vehicleType),
      description: getVehicleDescription(driver.driverInfo.vehicleType)
    };

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to get fare by vehicle type
function getFareByType(vehicleType) {
  const fares = {
    economy: 12,
    suv: 18,
    luxury: 25,
    sedan: 15,
    hatchback: 10
  };
  return fares[vehicleType] || 12;
}

// Helper function to get vehicle features
function getVehicleFeatures(vehicleType) {
  const features = {
    economy: ['Air Conditioning', 'GPS Navigation', 'Music System'],
    suv: ['Air Conditioning', 'GPS Navigation', 'Music System', 'Extra Space', 'Power Windows'],
    luxury: ['Premium Interior', 'Climate Control', 'Premium Sound', 'Leather Seats', 'WiFi'],
    sedan: ['Air Conditioning', 'GPS Navigation', 'Music System', 'Comfortable Seating'],
    hatchback: ['Air Conditioning', 'GPS Navigation', 'Fuel Efficient']
  };
  return features[vehicleType] || features.economy;
}

// Helper function to get vehicle description
function getVehicleDescription(vehicleType) {
  const descriptions = {
    economy: 'Perfect for city rides and daily commutes. Affordable and reliable.',
    suv: 'Spacious and comfortable for family trips and group travel.',
    luxury: 'Premium experience with top-notch amenities and comfort.',
    sedan: 'Comfortable and stylish for business and leisure travel.',
    hatchback: 'Compact and fuel-efficient for short distance travel.'
  };
  return descriptions[vehicleType] || descriptions.economy;
}

module.exports = router;