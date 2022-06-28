const express = require('express');
const sessionsControllers = require('../controllers/session-controller');

const router = express.Router();

router.post('/UnscheduledSession', sessionsControllers.createUnscheduledSession);
router.post('/UnscheduledSessions', sessionsControllers.uploadUnscheduledSessions);
router.get('/UnscheduledSessions', sessionsControllers.getUnscheduledSessions);

module.exports = router;
