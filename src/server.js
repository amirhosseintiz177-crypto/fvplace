// Compatibility entrypoint for hosts that still run `node src/server.js`.
// The current API lives in apps/api/src/server.js and does not use connect-mongo.
const { bootstrap } = require('../apps/api/src/server');

bootstrap().catch((error) => {
  console.error('API failed to start:', error);
  process.exit(1);
});
