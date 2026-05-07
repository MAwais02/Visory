const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Bookmark } = require('../models/Notification');

router.use(protect);

// GET /api/bookmarks — 4.2.11
router.get('/', async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ bookmarks });
  } catch (err) { next(err); }
});

// POST /api/bookmarks
router.post('/', async (req, res, next) => {
  try {
    const bookmark = await Bookmark.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ bookmark });
  } catch (err) { next(err); }
});

// PUT /api/bookmarks/:id — Update note/tags
router.put('/:id', async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { personalNote: req.body.personalNote, tags: req.body.tags },
      { new: true }
    );
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    res.json({ bookmark });
  } catch (err) { next(err); }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Bookmark removed.' });
  } catch (err) { next(err); }
});

module.exports = router;
