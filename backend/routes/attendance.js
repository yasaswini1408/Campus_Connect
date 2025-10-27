const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/attendance');
const User = require('../models/user');

// Faculty marks attendance
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can mark attendance' });
    }

    const { studentId, subject, date, status } = req.body;

    // Check student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Always create a new record (do not overwrite)
    const record = new Attendance({
      student: studentId,
      subject,
      date,
      status
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student views their own attendance
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view their attendance' });
    }

    const records = await Attendance.find({ student: req.user.id })
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Faculty views attendance of a student
router.get('/student/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can view student attendance' });
    }

    const records = await Attendance.find({ student: req.params.id })
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
