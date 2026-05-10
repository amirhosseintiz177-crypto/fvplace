const { z } = require('zod');
const { nanoid } = require('nanoid');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { recordActivity } = require('../services/activity.service');

const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user.id }).sort({ updatedAt: -1 });
  return res.json({ items: workspaces });
});

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = z.object({ name: z.string().min(2).max(100) }).parse(req.body);
  const workspace = await Workspace.create({
    name,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(6)}`,
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'owner' }],
  });
  return res.status(201).json(workspace);
});

const inviteMember = asyncHandler(async (req, res) => {
  const input = z.object({ userId: z.string(), role: z.enum(['admin', 'editor', 'viewer']) }).parse(req.body);
  const workspace = await Workspace.findOne({ _id: req.params.id, members: { $elemMatch: { user: req.user.id, role: { $in: ['owner', 'admin'] } } } });
  if (!workspace) return res.status(403).json({ message: 'Only owners and admins can invite members.' });
  workspace.members.push({ user: input.userId, role: input.role, invitedBy: req.user.id });
  await workspace.save();
  await recordActivity(req.app.get('io'), { workspace: workspace.id, actor: req.user.id, action: 'invite', message: `Invited a ${input.role}` });
  return res.json(workspace);
});

const activityTimeline = asyncHandler(async (req, res) => {
  const workspace = await Workspace.exists({ _id: req.params.id, 'members.user': req.user.id });
  if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
  const items = await Activity.find({ workspace: req.params.id }).populate('actor', 'name email publicProfile.avatarUrl').sort({ createdAt: -1 }).limit(50);
  return res.json({ items });
});

module.exports = { listWorkspaces, createWorkspace, inviteMember, activityTimeline };
