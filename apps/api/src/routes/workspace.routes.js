const express = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/workspace.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/', controller.listWorkspaces);
router.post('/', controller.createWorkspace);
router.post('/:id/invites', controller.inviteMember);
router.get('/:id/activity', controller.activityTimeline);

module.exports = router;
