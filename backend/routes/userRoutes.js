const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// User registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected: Profile info and update
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Driver location update
router.put('/location', auth, role(['driver']), userController.updateLocation);

// Session management
router.post('/logout', auth, userController.logout);
router.get('/sessions', auth, userController.getSessions);

module.exports = router;
