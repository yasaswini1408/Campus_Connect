const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // faculty
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
