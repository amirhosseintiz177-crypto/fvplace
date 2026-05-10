const FileAsset = require('../models/FileAsset');
const asyncHandler = require('../utils/asyncHandler');
const { getLocalObjectPath } = require('../services/storage.service');

const streamLocalObject = asyncHandler(async (req, res) => {
  const localPath = getLocalObjectPath(req.params.encodedKey);
  if (!localPath) return res.status(404).json({ message: 'Local storage is disabled.' });

  const file = await FileAsset.findOne({ storageKey: Buffer.from(req.params.encodedKey, 'base64url').toString('utf8'), deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });

  res.type(file.mimeType);
  return res.sendFile(localPath);
});

module.exports = { streamLocalObject };
