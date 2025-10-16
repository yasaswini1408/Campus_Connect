const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Result = require('../models/Result');
const Notification = require('../models/Notification');

const router = express.Router();

// Multer config (store uploads temporarily)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/results')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Faculty uploads results
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can upload results' });
    }

    const { examType } = req.body;
    if (!['mid1', 'mid2', 'endsem'].includes(examType)) {
      return res.status(400).json({ msg: 'Invalid exam type' });
    }

    // Read file
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    /*
      Expected CSV/Excel format:
      regNo | Subject1 | Subject2 | ... | GPA
      22CS001 | 85 | 72 | ... | 8.2
    */

    for (const row of rows) {
      const { regNo, GPA, ...subjects } = row;

      const student = await User.findOne({ regNo });
      if (!student) {
        console.warn(`⚠️ No student found for regNo: ${regNo}`);
        continue;
      }

      const marks = {};
      for (const [subject, value] of Object.entries(subjects)) {
        marks[subject] = Number(value) || 0;
      }

      await Result.findOneAndUpdate(
        { student: student._id, examType },
        { student: student._id, examType, marks, gpa: GPA || null },
        { upsert: true, new: true }
      );
    }

    // Create broadcast notification
    await Notification.create({
      user: null,
      title: "Results Published",
      message: `Results for ${examType.toUpperCase()} have been uploaded.`,
      link: "/student-results.html"
    });

    res.json({ msg: "Results uploaded successfully" });
  } catch (err) {
    console.error("Error uploading results:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Student fetches their results
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view their results' });
    }

    const results = await Result.find({ student: req.user.id }).sort({ uploadedAt: 1 });
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can view uploads' });
    }

    const results = await Result.find().sort({ uploadedAt: -1 }).limit(20);
    res.json(results);
  } catch (err) {
    console.error("Error fetching uploads:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
