const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Create notification (faculty/admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ msg: 'Students cannot create notifications' });
    }

    const { user, title, message, link } = req.body;

    const notification = new Notification({
      user: user || null, // null → broadcast
      title,
      message,
      link
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Fetch my notifications
router.get('/my', auth, async (req, res) => {
  try {
    const query = {
      $or: [{ user: req.user.id }, { user: null }]
    };

    const notifications = await Notification.find(query)
      .sort({ date: -1 })
      .limit(20);

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ msg: "Notification not found" });

    notif.seen = true;
    await notif.save();

    res.json({ msg: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark all notifications as read
router.put('/mark-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, seen: false },
      { $set: { seen: true } }
    );
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
