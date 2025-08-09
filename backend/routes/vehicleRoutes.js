const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// CRUD operations for vehicles
router.post('/', auth, role(['admin', 'driver']), vehicleController.addVehicle);
router.get('/', auth, vehicleController.getVehicles);
router.get('/:id', auth, vehicleController.getVehicleById);
router.put('/:id', auth, role(['admin', 'driver']), vehicleController.updateVehicle);
router.delete('/:id', auth, role(['admin', 'driver']), vehicleController.deleteVehicle);

module.exports = router;