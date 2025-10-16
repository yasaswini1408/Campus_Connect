const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  available: { type: Boolean, default: true },
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  dueDate: { type: Date, default: null },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }] // queue of students
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
