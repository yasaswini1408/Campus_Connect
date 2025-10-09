const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const StudentProfile = require('../models/StudentProfile');

// File storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/assignments/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 📌 Faculty creates assignment
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can create assignments' });
    }

    const assignment = new Assignment({ ...req.body, createdBy: req.user.id });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student view their assignments
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ msg: "Only students can view this" });
    }

    // Find student profile
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.json({ pending: [], finished: [] }); // no profile → no assignments
    }

    const { year, branch, section } = profile;

    // Get assignments matching student’s year/branch/section
    const submissions = await Submission.find({ student: req.user.id }).populate("assignment");
    const submittedIds = submissions.map(s => s.assignment._id.toString());

    // Get all assignments matching student’s year/branch/section and NOT already submitted
    const pending = await Assignment.find({
      year,
      branch,
      section,
      _id: { $nin: submittedIds }
    });

    res.json({ pending, finished: submissions });
  } catch (err) {
    console.error("Error in /my route:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Student submits assignment
router.post("/:id/submit", auth, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ msg: "Only students can submit assignments" });
    }

    const assignmentId = req.params.id;

    const submission = new Submission({
      assignment: assignmentId,
      student: req.user.id,
      file: req.file ? req.file.path : null,
      submittedAt: new Date()
    });

    await submission.save();
    res.status(201).json({ msg: "Assignment submitted", submission });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 📌 Faculty views submissions for an assignment
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can view submissions' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate({
        path: 'student',
        model: 'User', 
        select: 'name regNo'
      });

    // Always return an array
    res.json(Array.isArray(submissions) ? submissions : []);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// 📌 Faculty grades a submission
router.put('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can grade submissions' });
    }

    const { marks } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks },
      { new: true }
    ).populate("assignment", "title maxMarks subject");

    res.json(submission);
  } catch (err) {
    console.error("Error grading:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/faculty", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ msg: "Only faculty can view this" });
    }

    const assignments = await Assignment.find({ createdBy: req.user.id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
