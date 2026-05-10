const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['upload', 'delete', 'rename', 'move', 'share', 'download', 'restore', 'invite'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset' },
    message: { type: String, required: true },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
