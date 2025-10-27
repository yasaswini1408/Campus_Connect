const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // only faculty
    required: true
  },
  category: {
    type: String,
    enum: ['urgent', 'event', 'placement', 'general'],
    default: 'general'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.notice ||mongoose.model('Notice', noticeSchema);
