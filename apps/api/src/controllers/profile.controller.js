const User = require('../models/User');
const FileAsset = require('../models/FileAsset');
const asyncHandler = require('../utils/asyncHandler');

const publicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ 'publicProfile.username': req.params.username, 'publicProfile.isPublic': true }).select('name publicProfile');
  if (!user) return res.status(404).json({ message: 'Public profile not found.' });
  const files = await FileAsset.find({ owner: user.id, visibility: 'public', deletedAt: null }).select('name mimeType size updatedAt').limit(24);
  return res.json({ user, files });
});

module.exports = { publicProfile };
