const express = require('express');
const File = require('../models/File');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const files = await File.find({ owner: req.session.user.id }).sort({ createdAt: -1 });
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    res.render('dashboard', { files, totalBytes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
