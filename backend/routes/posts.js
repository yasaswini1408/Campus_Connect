const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Get all posts
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name role regNo') // include author's details
            .sort({ date: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Create a new post
router.post('/', auth, async (req, res) => {
    const { title, content, type } = req.body;

    try {
        const newPost = new Post({
            title,
            content,
            type,
            author: req.user.id   // comes from JWT
        });

        const post = await newPost.save();
        await post.populate('author', 'name role regNo'); // populate immediately

        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Upvote a post (anonymous)
// Upvote a post (only once per user)
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Check if user already upvoted
    if (post.upvotes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You already upvoted this post' });
    }

    post.upvotes.push(req.user.id);
    await post.save();
    await post.populate('author', 'name role regNo');

    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


// Reply to a post (requires login)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.replies.push({
      content,
      author: req.user.id
    });

    await post.save();
    await post.populate('replies.author', 'name role regNo');
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
