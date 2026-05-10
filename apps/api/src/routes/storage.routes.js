const express = require('express');
const controller = require('../controllers/storage.controller');

const router = express.Router();
router.get('/:encodedKey', controller.streamLocalObject);

module.exports = router;
