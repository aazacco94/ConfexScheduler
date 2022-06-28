const express = require('express');
const query = require('../controllers/query-controller');

const router = express.Router();

// Returns the sessions based on the filter options
router.post('/sessionFilter', query.sessionsQuery);
// Returns the filter options for sessions: {formats},{types},{topics}
router.get('/sessionFilterOptions', query.sessionFilterOptions);
router.get('/roomHotelOptions', query.roomHotelOptions);

module.exports = router;
