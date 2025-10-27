const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notice = require('../models/notice');

// Create a new notice (faculty only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can post notices' });
    }

    const { title, content, category } = req.body;
    const newNotice = new Notice({
      title,
      content,
      category,
      author: req.user.id
    });

    const notice = await newNotice.save();
    await notice.populate('author', 'name role regNo');

    res.status(201).json(notice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all notices (students & faculty)
router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name role regNo')
      .sort({ date: -1 });

    res.json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
