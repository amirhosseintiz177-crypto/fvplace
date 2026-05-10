const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokens');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user) return res.status(401).json({ message: 'User no longer exists.' });

  req.user = user;
  return next();
});

module.exports = { requireAuth };
