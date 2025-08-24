const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for verification documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/verification/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.fieldname}_${file.originalname}`);
    }
});

const upload = multer({ storage });
const uploadFields = upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'registration', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// User registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected: Profile info and update
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

// Driver location update
router.put('/location', auth, role(['driver']), userController.updateLocation);

// Session management
router.post('/logout', auth, userController.logout);
router.get('/sessions', auth, userController.getSessions);

// Email check for new users
router.post('/check-email', userController.checkEmail);

// 2FA routes
router.post('/2fa/setup', auth, userController.setup2FA);
router.post('/2fa/verify', auth, userController.verify2FA);
router.post('/2fa/disable', auth, userController.disable2FA);

// AI Chat routes
router.post('/ai-chat', auth, userController.aiChat);
router.get('/chat-history/:sessionId', auth, userController.getChatHistory);
router.post('/transfer-to-human', auth, userController.transferToHuman);

// Settings routes
router.get('/settings', auth, userController.getSettings);
router.put('/settings', auth, userController.updateSettings);

// Driver application routes
router.post('/apply-driver', auth, userController.applyDriver);
router.get('/driver-status', auth, userController.getDriverStatus);

// Driver availability update
router.put('/availability', auth, role(['driver']), userController.updateAvailability);

// Driver verification documents
router.post('/submit-verification', auth, role(['driver']), uploadFields, userController.submitVerificationDocuments);

module.exports = router;
