const Activity = require('../models/Activity');

async function recordActivity(io, payload) {
  const activity = await Activity.create(payload);
  if (io) io.to(`workspace:${payload.workspace}`).emit('activity:new', activity);
  return activity;
}

module.exports = { recordActivity };
