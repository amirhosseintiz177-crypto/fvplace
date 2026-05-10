const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { nanoid } = require('nanoid');
const File = require('../models/File');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 1024);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${nanoid(10)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024,
  },
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      req.session.flash = { type: 'warning', message: 'لطفاً یک فایل انتخاب کنید.' };
      return res.redirect('/dashboard');
    }

    await File.create({
      owner: req.session.user.id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    req.session.flash = { type: 'success', message: 'فایل با موفقیت در فضای ابری شما ذخیره شد.' };
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.get('/files/:id/download', requireAuth, async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.session.user.id });
    if (!file) return res.status(404).render('404');

    return res.download(file.path, file.originalName);
  } catch (error) {
    return next(error);
  }
});

router.post('/files/:id/delete', requireAuth, async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, owner: req.session.user.id });
    if (file) {
      fs.promises.unlink(file.path).catch(() => {});
      req.session.flash = { type: 'success', message: 'فایل حذف شد.' };
    }

    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
