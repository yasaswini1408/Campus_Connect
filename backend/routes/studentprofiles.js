const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');

// GET /api/studentprofiles/my
router.get('/my', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('GET /studentprofiles/my error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
