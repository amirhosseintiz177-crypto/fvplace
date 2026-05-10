const bcrypt = require('bcryptjs');
const { z } = require('zod');
const FileAsset = require('../models/FileAsset');
const ShareLink = require('../models/ShareLink');
const Workspace = require('../models/Workspace');
const asyncHandler = require('../utils/asyncHandler');
const { createPreviewUrl } = require('../services/storage.service');
const { createShareLink, hashToken } = require('../services/share.service');
const { recordActivity } = require('../services/activity.service');

const createShare = asyncHandler(async (req, res) => {
  const input = z.object({ password: z.string().min(4).optional(), expiresAt: z.string().datetime().optional(), downloadLimit: z.number().int().min(0).optional() }).parse(req.body);
  const file = await FileAsset.findOne({ _id: req.params.fileId, type: 'file', deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  const workspace = await Workspace.exists({ _id: file.workspace, 'members.user': req.user.id });
  if (!workspace) return res.status(403).json({ message: 'Access denied.' });

  const result = await createShareLink({ file, user: req.user, password: input.password, expiresAt: input.expiresAt, downloadLimit: input.downloadLimit });
  await recordActivity(req.app.get('io'), { workspace: file.workspace, actor: req.user.id, action: 'share', target: file.id, message: `Shared ${file.name}` });
  return res.status(201).json({ url: result.url, token: result.token, qrCodeDataUrl: result.share.qrCodeDataUrl, expiresAt: result.share.expiresAt });
});

const resolveShare = asyncHandler(async (req, res) => {
  const share = await ShareLink.findOne({ tokenHash: hashToken(req.params.token), isRevoked: false }).select('+passwordHash').populate('file');
  if (!share || !share.file || share.file.deletedAt) return res.status(404).json({ message: 'Share link not found.' });
  if (share.expiresAt && share.expiresAt < new Date()) return res.status(410).json({ message: 'Share link expired.' });
  if (share.downloadLimit && share.downloadCount >= share.downloadLimit) return res.status(429).json({ message: 'Download limit reached.' });
  if (share.passwordHash) {
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body || {});
    if (!(await bcrypt.compare(password, share.passwordHash))) return res.status(401).json({ message: 'Password is incorrect.' });
  }

  share.downloadCount += 1;
  await share.save();
  return res.json({ file: share.file, previewUrl: await createPreviewUrl(share.file.storageKey, 900), qrCodeDataUrl: share.qrCodeDataUrl });
});

module.exports = { createShare, resolveShare };
