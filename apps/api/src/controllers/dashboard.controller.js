const FileAsset = require('../models/FileAsset');
const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user.id });
  const workspaceIds = workspaces.map((workspace) => workspace.id);
  const [storage] = await FileAsset.aggregate([
    { $match: { workspace: { $in: workspaces.map((w) => w._id) }, deletedAt: null, type: 'file' } },
    { $group: { _id: null, totalBytes: { $sum: '$size' }, fileCount: { $sum: 1 } } },
  ]);
  const recentFiles = await FileAsset.find({ workspace: { $in: workspaceIds }, deletedAt: null }).sort({ updatedAt: -1 }).limit(8);
  const recentActivity = await Activity.find({ workspace: { $in: workspaceIds } }).sort({ createdAt: -1 }).limit(8);
  return res.json({ storage: storage || { totalBytes: 0, fileCount: 0 }, recentFiles, recentActivity, workspaces });
});

module.exports = { summary };
