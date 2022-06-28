const express = require('express');
const uploadController = require('../controllers/upload-controller');

const router = express.Router();

router.post('/uploadAll', uploadController.uploadDataToDb);

module.exports = router;
