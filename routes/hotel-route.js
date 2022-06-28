const express = require('express');
const hotelsControllers = require('../controllers/hotel-controller');

const router = express.Router();

router.post('/roomFilter', hotelsControllers.getHotelRooms);
router.get('/avOptions', hotelsControllers.avOptions);
router.get('/hotels', hotelsControllers.getHotels);
router.delete('/hotels', hotelsControllers.deleteHotels);

module.exports = router;
