require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'FVPlace Nova',
  port: Number(process.env.API_PORT || process.env.PORT || 4000),
  appUrl: process.env.PUBLIC_APP_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 250),
  localStorageDir: process.env.LOCAL_STORAGE_DIR || 'uploads',
};

module.exports = env;
