const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  year: { type: Number, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);
