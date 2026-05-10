const express = require('express');
const multer = require('multer');
const controller = require('../controllers/file.controller');
const shareController = require('../controllers/share.controller');
const { requireAuth } = require('../middleware/auth');
const { uploadGuard, maxUploadBytes } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), fileFilter: uploadGuard, limits: { fileSize: maxUploadBytes, files: 20 } });

router.use(requireAuth);
router.get('/', controller.listFiles);
router.post('/folders', controller.createFolder);
router.post('/upload', upload.array('files', 20), controller.uploadFiles);
router.patch('/:id/rename', controller.renameFile);
router.patch('/:id/move', controller.moveFile);
router.delete('/:id', controller.deleteFile);
router.get('/:id/preview', controller.previewFile);
router.post('/:fileId/share', shareController.createShare);

module.exports = router;
