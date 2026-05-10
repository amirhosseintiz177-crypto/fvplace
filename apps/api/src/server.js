const http = require('http');
const { Server } = require('socket.io');
const env = require('./config/env');
const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');
const { registerRealtime } = require('./realtime/socket');

async function bootstrap() {
  await connectDatabase(env.mongoUri);
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.corsOrigin, credentials: true } });
  app.set('io', io);
  registerRealtime(io);

  server.listen(env.port, () => {
    console.log(`${env.appName} API listening on ${env.port}`);
  });
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('API failed to start:', error);
    process.exit(1);
  });
}

module.exports = { bootstrap };
