const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null means broadcast to all
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },   // e.g. "/results"
  date: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
