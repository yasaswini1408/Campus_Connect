const User = require('../models/user');
const auth = require('../middleware/auth');

// Get all faculty users
router.get('/faculty', auth, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('name regNo');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
