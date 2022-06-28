const express = require('express');
const schedule = require('../controllers/schedule-controller');

const router = express.Router();

router.get('/ScheduledByDate', schedule.getSessionsByDate);
router.post('/Scheduled', schedule.scheduleSessions);
router.post('/storeScheduleSessions', schedule.scheduleSessions);

module.exports = router;
