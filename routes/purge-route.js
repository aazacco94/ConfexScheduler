const express = require('express');
const purgeController = require('../controllers/purge-controller');

const router = express.Router();

router.delete('/purgeDB/:id', purgeController.purgeData);
router.get('/switchDbData', purgeController.switcharo);

module.exports = router;
