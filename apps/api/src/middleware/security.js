const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const uploadGuard = (req, file, callback) => {
  const blockedExtensions = ['.exe', '.bat', '.cmd', '.scr', '.ps1', '.sh'];
  const lowerName = file.originalname.toLowerCase();
  if (blockedExtensions.some((extension) => lowerName.endsWith(extension))) {
    return callback(new Error('Potentially dangerous file type blocked.'));
  }
  return callback(null, true);
};

module.exports = { apiLimiter, uploadGuard, maxUploadBytes: env.maxUploadMb * 1024 * 1024 };
