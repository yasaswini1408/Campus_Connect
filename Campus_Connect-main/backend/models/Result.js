const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examType: { type: String, enum: ['mid1', 'mid2', 'endsem'], required: true },
  marks: { type: Map, of: Number },   // e.g. { CS201: 85, MA202: 72 }
  gpa: { type: Number },              // may be null for mids
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
