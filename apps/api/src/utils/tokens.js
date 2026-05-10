const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, tokenVersion: user.tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
