const express = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();
router.get('/summary', requireAuth, controller.summary);

module.exports = router;
