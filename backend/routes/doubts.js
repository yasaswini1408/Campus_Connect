const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doubt = require('../models/doubt');
const User = require('../models/user');

// Student posts a doubt
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can post doubts' });
    }

    const { facultyId, title, description } = req.body;
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ msg: 'Faculty not found' });
    }

    const doubt = new Doubt({
      student: req.user.id,
      faculty: facultyId,
      title,
      description
    });

    await doubt.save();
    res.status(201).json(doubt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student views their doubts
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view their doubts' });
    }

    const doubts = await Doubt.find({ student: req.user.id })
      .populate('faculty', 'name regNo')
      .sort({ date: -1 });

    res.json(doubts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Faculty views doubts assigned to them
router.get('/assigned', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can view assigned doubts' });
    }

    const doubts = await Doubt.find({ faculty: req.user.id })
      .populate('student', 'name regNo')
      .sort({ date: -1 });

    res.json(doubts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Faculty replies to a doubt
router.put('/:id/reply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can reply to doubts' });
    }

    const { reply } = req.body;
    const doubt = await Doubt.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user.id },
      { reply, status: 'Resolved' },
      { new: true }
    );

    if (!doubt) return res.status(404).json({ msg: 'Doubt not found' });

    res.json(doubt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
