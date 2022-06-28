const express = require('express');
const sponsorsController = require('../controllers/sponsor-controller');

const router = express.Router();

router.post('/createSponsor', sponsorsController.createSponsor);
router.get('/getSponsors', sponsorsController.getSponsors);

module.exports = router;
