const jwt = require('jsonwebtoken');
const env = require('../config/env');

function registerRealtime(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required.'));
      socket.user = jwt.verify(token, env.jwtAccessSecret);
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.on('workspace:join', (workspaceId) => socket.join(`workspace:${workspaceId}`));
    socket.on('upload:progress', (payload) => {
      socket.to(`workspace:${payload.workspaceId}`).emit('upload:progress', payload);
    });
  });
}

module.exports = { registerRealtime };
