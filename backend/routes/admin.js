const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/user');
const StudentProfile = require('../models/StudentProfile');

// Admin adds a new user
router.post('/add-user', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admin can add users' });
    }

    const { name, regNo, password, role, year, branch, section } = req.body;

    const existing = await User.findOne({ regNo });
    if (existing) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, regNo, password: hashedPassword, role });
    await newUser.save();

    // If role is student → also create StudentProfile
    if (role === 'student') {
      const profile = new StudentProfile({
        user: newUser._id,
        year,
        branch,
        section
      });
      await profile.save();
    }

    res.status(201).json({ msg: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
