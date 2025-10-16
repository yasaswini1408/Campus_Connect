const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  file: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  marks: { type: Number, default: null }, // faculty grades
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
