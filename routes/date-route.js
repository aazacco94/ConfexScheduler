const express = require('express');
const dateControllers = require('../controllers/date-controller');

const router = express.Router();

router.post('/conferenceTimes', dateControllers.storeDateRange);
router.get('/getConferenceTimes', dateControllers.getDateRange);

module.exports = router;
