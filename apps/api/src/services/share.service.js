const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ShareLink = require('../models/ShareLink');
const env = require('../config/env');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createInlineQrPlaceholder(url) {
  const escapedUrl = url.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  const seed = crypto.createHash('sha256').update(url).digest();
  const cells = Array.from({ length: 121 }, (_, index) => seed[index % seed.length] % 2 === 0);
  const blocks = cells
    .map((filled, index) => {
      if (!filled) return '';
      const x = (index % 11) * 20 + 20;
      const y = Math.floor(index / 11) * 20 + 20;
      return `<rect x="${x}" y="${y}" width="14" height="14" rx="3"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="320" viewBox="0 0 280 320"><rect width="280" height="320" rx="28" fill="#fff"/><g fill="#07111f">${blocks}</g><text x="140" y="292" text-anchor="middle" font-family="monospace" font-size="10" fill="#07111f">${escapedUrl}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function createShareLink({ file, user, password, expiresAt, downloadLimit }) {
  const token = crypto.randomBytes(24).toString('base64url');
  const url = `${env.appUrl}/share/${token}`;
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  const qrCodeDataUrl = createInlineQrPlaceholder(url);

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
