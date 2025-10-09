const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const User = require('../models/user');

// Search books
router.get('/books', auth, async (req, res) => {
  try {
    const search = req.query.search || '';
    const books = await Book.find({
      title: { $regex: search, $options: 'i' }
    });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Borrow a book
router.post('/book/:id/borrow', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can borrow books' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (!book.available) {
      return res.status(400).json({ msg: 'Book is already borrowed' });
    }

    // Borrow book for 14 days
    book.available = false;
    book.borrowedBy = req.user.id;
    book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await book.save();
    res.json({ msg: 'Book borrowed successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reserve a book
router.post('/book/:id/reserve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can reserve books' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (book.available) {
      return res.status(400).json({ msg: 'Book is available, you can borrow directly' });
    }

    if (book.reservations.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You already reserved this book' });
    }

    book.reservations.push(req.user.id);
    await book.save();

    res.json({ msg: 'Book reserved successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my borrowed books
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view borrowed books' });
    }

    const books = await Book.find({ borrowedBy: req.user.id });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin adds a new book
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admin can add books' });
    }

    const { title, author, isbn } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ msg: 'Please provide title, author, and ISBN' });
    }

    const book = new Book({ title, author, isbn });
    await book.save();

    res.status(201).json({ msg: 'Book added successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
