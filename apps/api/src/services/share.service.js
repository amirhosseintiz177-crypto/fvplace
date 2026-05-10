const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const ShareLink = require('../models/ShareLink');
const env = require('../config/env');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createShareLink({ file, user, password, expiresAt, downloadLimit }) {
  const token = crypto.randomBytes(24).toString('base64url');
  const url = `${env.appUrl}/share/${token}`;
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  const qrCodeDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });

  const share = await ShareLink.create({
    file: file.id,
    createdBy: user.id,
    tokenHash: hashToken(token),
    passwordHash,
    expiresAt,
    downloadLimit: Number(downloadLimit || 0),
    qrCodeDataUrl,
  });

  return { share, token, url };
}

module.exports = { createShareLink, hashToken };
