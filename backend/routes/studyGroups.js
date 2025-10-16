const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyGroup = require('../models/StudyGroup');
const User = require('../models/user');

// Create a study group
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can create study groups' });
    }

    const { name, subject } = req.body;
    if (!name || !subject) {
      return res.status(400).json({ msg: 'Please provide group name and subject' });
    }

    const group = new StudyGroup({
      name,
      subject,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await group.save();
    res.status(201).json({ msg: 'Study group created', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join a study group
router.post('/:id/join', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can join groups' });
    }

    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member of this group' });
    }

    group.members.push(req.user.id);
    await group.save();

    res.json({ msg: 'Joined group successfully', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await StudyGroup.find().populate('members', 'name regNo');
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my groups
router.get('/my', auth, async (req, res) => {
  try {
    const groups = await StudyGroup.find({ members: req.user.id }).populate('members', 'name regNo');
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Leave a group
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    // Remove member
    group.members = group.members.filter(m => m.toString() !== req.user.id);

    if (group.members.length === 0) {
      await group.deleteOne(); // delete group if empty
      return res.json({ msg: 'You left the group. Group deleted since no members left.' });
    }

    await group.save();
    res.json({ msg: 'You left the group', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
