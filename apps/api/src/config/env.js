require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'FVPlace Nova',
  port: Number(process.env.API_PORT || process.env.PORT || 4000),
  appUrl: process.env.PUBLIC_APP_URL || 'fvplace.runflare.run:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'fvplace.runflare.run:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://admin:iRva34inzNWeDdSGqN1p@fvpdb-svp-service:27017/admin',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '8xKj9mN2pQr5tUv7wXy1zA3bC4dE6fG8hJ0kLt',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'mP3sV7wXzA2cD5fG8hJ1kL4nP6qR9tUvWyZ0',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 1024),
  localStorageDir: process.env.LOCAL_STORAGE_DIR || 'uploads',
};

module.exports = env;
