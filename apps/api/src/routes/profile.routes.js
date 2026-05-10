const express = require('express');
const controller = require('../controllers/profile.controller');

const router = express.Router();
router.get('/:username', controller.publicProfile);

module.exports = router;
