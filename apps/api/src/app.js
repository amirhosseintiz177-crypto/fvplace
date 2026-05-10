const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const fileRoutes = require('./routes/file.routes');
const profileRoutes = require('./routes/profile.routes');
const shareRoutes = require('./routes/share.routes');
const storageRoutes = require('./routes/storage.routes');
const workspaceRoutes = require('./routes/workspace.routes');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '2mb' }));
  app.use(apiLimiter);

  app.get('/health', (req, res) => res.json({ ok: true, app: env.appName }));
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/workspaces', workspaceRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
