const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const StudentProfile = require('../models/StudentProfile');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/resources'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Faculty uploads resource
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can upload resources' });
    }

    const { title, description, subject, year, branch, section } = req.body;

    const resource = new Resource({
      title,
      description,
      subject,
      year,
      branch,
      section,
      filePath: `/uploads/resources/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Students fetch resources for their class
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view resources' });
    }

    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    const resources = await Resource.find({
      year: profile.year,
      branch: profile.branch,
      section: profile.section
    }).sort({ date: -1 });

    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Faculty fetches their uploaded resources
router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can view their resources' });
    }

    const resources = await Resource.find({ uploadedBy: req.user.id })
      .sort({ date: -1 });

    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Download file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ msg: 'File not found' });

    res.download(path.join(__dirname, '../', resource.filePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
