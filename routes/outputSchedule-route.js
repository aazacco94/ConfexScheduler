const express = require('express');
const schedule = require('../controllers/outputSchedule-controller');

const router = express.Router();

router.get('/getScheduleDisplay', schedule.getScheduledOutput);

module.exports = router;
