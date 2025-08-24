const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const analyticsService = require('../services/analyticsService');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Driver = require('../models/Driver');

const router = express.Router();

// Analytics for admin dashboard
router.get('/analytics', auth, async (req, res) => {
  try {
    const stats = await analyticsService.getDailyStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat management routes
router.get('/chats', auth, role(['admin']), async (req, res) => {
  try {
    const chats = await Chat.aggregate([
      {
        $group: {
          _id: '$userId',
          lastMessage: { $last: '$text' },
          lastMessageTime: { $last: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          lastMessage: 1,
          lastMessageTime: 1,
          messageCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chats/:userId/messages', auth, role(['admin']), async (req, res) => {
  try {
    const messages = await Chat.find({ userId: req.params.userId })
      .sort({ timestamp: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chats/:userId/message', auth, role(['admin']), async (req, res) => {
  try {
    const { text, sender, senderType } = req.body;
    
    const message = new Chat({
      userId: req.params.userId,
      text,
      sender: sender || 'Admin Support',
      senderType: senderType || 'admin',
      timestamp: new Date()
    });
    
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Driver application management
router.get('/driver-applications', auth, role(['admin']), async (req, res) => {
  try {
    const applications = await User.find(
      { 'driverApplication.status': { $exists: true } },
      { name: 1, email: 1, driverApplication: 1 }
    ).sort({ 'driverApplication.appliedAt': -1 });
    
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/approve-driver/:userId', auth, role(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user || !user.driverApplication) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    
    // Create driver record with all user data
    const driverData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      profile_image: user.profile_image,
      location: user.location,
      rating: user.rating,
      originalUserId: user._id,
      settings: user.settings,
      
      // Driver-specific info from application
      driverInfo: {
        licenseNumber: user.driverApplication.licenseNumber,
        licenseExpiry: user.driverApplication.licenseExpiry,
        vehicleType: user.driverApplication.vehicleType,
        vehicleMake: user.driverApplication.vehicleMake,
        vehicleModel: user.driverApplication.vehicleModel,
        vehicleYear: user.driverApplication.vehicleYear,
        vehicleColor: user.driverApplication.vehicleColor,
        registrationNumber: user.driverApplication.registrationNumber,
        drivingExperience: user.driverApplication.drivingExperience,
        documents: user.driverApplication.documents
      }
    };
    
    // Create driver record
    const driver = await Driver.create(driverData);
    
    // Remove user from users collection
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      success: true, 
      message: 'Driver application approved and user migrated to drivers collection',
      driverId: driver._id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reject-driver/:userId', auth, role(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.driverApplication) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    
    user.driverApplication.status = 'rejected';
    user.driverApplication.reviewedAt = new Date();
    user.driverApplication.reviewedBy = req.user.id;
    user.driverApplication.rejectionReason = reason;
    await user.save();
    
    res.json({ success: true, message: 'Driver application rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verification request routes
router.get('/verification-requests', auth, role(['admin']), async (req, res) => {
  try {
    const requests = await Driver.find(
      { 'verificationRequest.status': 'pending' },
      { name: 1, email: 1, phone: 1, verificationRequest: 1 }
    ).sort({ 'verificationRequest.submittedAt': -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/verification/:driverId/approve', auth, role(['admin']), async (req, res) => {
  try {
    await Driver.findByIdAndUpdate(req.params.driverId, {
      'verificationRequest.status': 'approved',
      'verificationRequest.reviewedAt': new Date(),
      'verificationRequest.reviewedBy': req.user.id,
      'driverInfo.isVerified': true
    });
    
    res.json({ success: true, message: 'Verification approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/verification/:driverId/reject', auth, role(['admin']), async (req, res) => {
  try {
    await Driver.findByIdAndUpdate(req.params.driverId, {
      'verificationRequest.status': 'rejected',
      'verificationRequest.reviewedAt': new Date(),
      'verificationRequest.reviewedBy': req.user.id
    });
    
    res.json({ success: true, message: 'Verification rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;