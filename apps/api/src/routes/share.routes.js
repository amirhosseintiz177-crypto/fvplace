const express = require('express');
const controller = require('../controllers/share.controller');

const router = express.Router();
router.post('/:token/resolve', controller.resolveShare);

module.exports = router;
