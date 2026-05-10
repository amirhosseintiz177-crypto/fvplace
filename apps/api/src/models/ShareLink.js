const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema(
  {
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'FileAsset', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    passwordHash: { type: String, select: false },
    expiresAt: { type: Date, index: true },
    downloadLimit: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    qrCodeDataUrl: { type: String, default: '' },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);
