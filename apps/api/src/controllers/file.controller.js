const path = require('path');
const { z } = require('zod');
const { nanoid } = require('nanoid');
const FileAsset = require('../models/FileAsset');
const Workspace = require('../models/Workspace');
const asyncHandler = require('../utils/asyncHandler');
const { putObject, deleteObject, createPreviewUrl } = require('../services/storage.service');
const { recordActivity } = require('../services/activity.service');

const listQuerySchema = z.object({
  workspaceId: z.string(),
  parent: z.string().optional().nullable(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(80).default(30),
});

async function ensureWorkspace(workspaceId, userId) {
  const workspace = await Workspace.findOne({ _id: workspaceId, 'members.user': userId });
  if (!workspace) {
    const error = new Error('Workspace not found or access denied.');
    error.status = 404;
    error.expose = true;
    throw error;
  }
  return workspace;
}

const listFiles = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  await ensureWorkspace(query.workspaceId, req.user.id);

  const filter = { workspace: query.workspaceId, deletedAt: null };
  if (query.q) filter.$text = { $search: query.q };
  else filter.parent = query.parent || null;
  if (query.cursor) filter._id = { $lt: query.cursor };

  const files = await FileAsset.find(filter).sort({ type: 1, updatedAt: -1, _id: -1 }).limit(query.limit + 1);
  const hasMore = files.length > query.limit;
  const items = hasMore ? files.slice(0, -1) : files;
  return res.json({ items, nextCursor: hasMore ? items.at(-1).id : null });
});

const createFolder = asyncHandler(async (req, res) => {
  const input = z.object({ workspaceId: z.string(), parent: z.string().nullable().optional(), name: z.string().min(1).max(180) }).parse(req.body);
  await ensureWorkspace(input.workspaceId, req.user.id);
  const folder = await FileAsset.create({ workspace: input.workspaceId, owner: req.user.id, parent: input.parent || null, type: 'folder', name: input.name });
  await recordActivity(req.app.get('io'), { workspace: input.workspaceId, actor: req.user.id, action: 'upload', target: folder.id, message: `Created folder ${folder.name}` });
  return res.status(201).json(folder);
});

const uploadFiles = asyncHandler(async (req, res) => {
  const input = z.object({ workspaceId: z.string(), parent: z.string().nullable().optional() }).parse(req.body);
  await ensureWorkspace(input.workspaceId, req.user.id);
  const uploaded = [];

  for (const file of req.files || []) {
    const key = `${input.workspaceId}/${req.user.id}/${Date.now()}-${nanoid(12)}${path.extname(file.originalname)}`;
    await putObject({ key, body: file.buffer, contentType: file.mimetype });
    const asset = await FileAsset.create({
      workspace: input.workspaceId,
      owner: req.user.id,
      parent: input.parent || null,
      type: 'file',
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: key,
      versions: [{ version: 1, storageKey: key, size: file.size, uploadedBy: req.user.id }],
    });
    uploaded.push(asset);
    await recordActivity(req.app.get('io'), { workspace: input.workspaceId, actor: req.user.id, action: 'upload', target: asset.id, message: `Uploaded ${asset.name}` });
  }

  return res.status(201).json({ items: uploaded });
});

const renameFile = asyncHandler(async (req, res) => {
  const { name } = z.object({ name: z.string().min(1).max(180) }).parse(req.body);
  const file = await FileAsset.findOne({ _id: req.params.id, deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  await ensureWorkspace(file.workspace, req.user.id);
  file.name = name;
  await file.save();
  await recordActivity(req.app.get('io'), { workspace: file.workspace, actor: req.user.id, action: 'rename', target: file.id, message: `Renamed item to ${name}` });
  return res.json(file);
});

const moveFile = asyncHandler(async (req, res) => {
  const { parent } = z.object({ parent: z.string().nullable() }).parse(req.body);
  const file = await FileAsset.findOne({ _id: req.params.id, deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  await ensureWorkspace(file.workspace, req.user.id);
  file.parent = parent;
  await file.save();
  await recordActivity(req.app.get('io'), { workspace: file.workspace, actor: req.user.id, action: 'move', target: file.id, message: `Moved ${file.name}` });
  return res.json(file);
});

const deleteFile = asyncHandler(async (req, res) => {
  const file = await FileAsset.findOne({ _id: req.params.id, deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  await ensureWorkspace(file.workspace, req.user.id);
  file.deletedAt = new Date();
  await file.save();
  if (file.type === 'file' && file.storageKey) deleteObject(file.storageKey).catch(console.error);
  await recordActivity(req.app.get('io'), { workspace: file.workspace, actor: req.user.id, action: 'delete', target: file.id, message: `Deleted ${file.name}` });
  return res.status(204).end();
});

const previewFile = asyncHandler(async (req, res) => {
  const file = await FileAsset.findOne({ _id: req.params.id, type: 'file', deletedAt: null });
  if (!file) return res.status(404).json({ message: 'File not found.' });
  await ensureWorkspace(file.workspace, req.user.id);
  return res.json({ url: await createPreviewUrl(file.storageKey), mimeType: file.mimeType, name: file.name });
});

module.exports = { listFiles, createFolder, uploadFiles, renameFile, moveFile, deleteFile, previewFile };
