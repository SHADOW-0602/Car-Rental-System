const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// Support messages for drivers
router.get('/support/messages', auth, role(['driver']), async (req, res) => {
  try {
    const messages = await ContactMessage.find({ 
      $or: [
        { driverId: req.user.id },
        { email: req.user.email, userType: 'driver' }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit support message for drivers
router.post('/support/contact', auth, role(['driver']), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const contactMessage = new ContactMessage({ 
      name: req.user.name,
      email: req.user.email,
      subject, 
      message, 
      driverId: req.user.id,
      userType: 'driver'
    });
    await contactMessage.save();
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;