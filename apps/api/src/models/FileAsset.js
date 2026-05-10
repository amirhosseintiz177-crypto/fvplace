const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    storageKey: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const fileAssetSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset', default: null, index: true },
    type: { type: String, enum: ['file', 'folder'], required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    mimeType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, default: 0 },
    storageKey: { type: String, index: true },
    visibility: { type: String, enum: ['private', 'workspace', 'public'], default: 'private' },
    tags: [{ type: String, trim: true, lowercase: true }],
    versions: [versionSchema],
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

fileAssetSchema.index({ workspace: 1, parent: 1, name: 1, deletedAt: 1 });
fileAssetSchema.index({ name: 'text', tags: 'text', mimeType: 'text' });

module.exports = mongoose.model('FileAsset', fileAssetSchema);
