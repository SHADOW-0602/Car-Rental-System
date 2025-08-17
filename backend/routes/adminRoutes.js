const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const analyticsService = require('../services/analyticsService');

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

module.exports = router;