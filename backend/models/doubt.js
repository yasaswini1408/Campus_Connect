const mongoose = require('mongoose');

const DoubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  reply: { type: String },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doubt', DoubtSchema);
