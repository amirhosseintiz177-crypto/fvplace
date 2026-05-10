const { z } = require('zod');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function authResponse(user) {
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const exists = await User.exists({ email: input.email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email is already registered.' });

  const user = await User.createWithPassword(input);
  await Workspace.create({
    name: `${user.name}'s Workspace`,
    slug: `${user.id}-personal`,
    owner: user.id,
    members: [{ user: user.id, role: 'owner' }],
  });

  return res.status(201).json(authResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(input.password))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  return res.json(authResponse(user));
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = z.object({ refreshToken: z.string().min(20) }).parse(req.body);
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    return res.status(401).json({ message: 'Refresh token is no longer valid.' });
  }
  return res.json(authResponse(user));
});

const oauthStart = (req, res) => {
  res.json({
    message: 'OAuth handshake placeholder. Configure provider client IDs and redirect URIs to enable production OAuth.',
    provider: req.params.provider,
  });
};

module.exports = { register, login, refresh, oauthStart };
