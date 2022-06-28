const express = require('express');
const speakerController = require('../controllers/speaker-controller');

const router = express.Router();

router.post('/createSpeaker', speakerController.createSpeaker);
router.get('/getSpeakers', speakerController.getSpeakers);

module.exports = router;
