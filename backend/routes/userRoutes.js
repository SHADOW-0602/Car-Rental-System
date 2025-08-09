const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// User registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected: Profile info and update
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
