const HotelRoom = require('../models/HotelRoom');
const UnscheduledSession = require('../models/UnscheduledSession');
const Speaker = require('../models/Speaker');
const HttpError = require('../models/HttpError');

const uploadDataToDb = async (req, res, next) => {
  const sessionArray = req.body.sessions;
  const hotelDupArray = req.body.hotels;
  const speakerArray = req.body.speakers;

  const response = { successful: '', error: '', mess: '' };
  try {
    await UnscheduledSession.insertMany(sessionArray);
  } catch (err) {
    response.successful = false;
    response.error += err;
    response.mess += 'error with session insert';
    const error = new HttpError(
      'Something went wrong, could not upload the sessions',
      500,
    );
    next(error);
    return;
  }
  const rooms = hotelDupArray.map(o => o.Room);
  // basing this off the properties do not have the same room name.
  const hotelArray = hotelDupArray.filter(({ Room }, index) => !rooms.includes(Room, index + 1));
  for (let i = 0; i < hotelArray.length; i++) {
    hotelArray[i].RoomID = i + 1;
  }

  try {
    await HotelRoom.insertMany(hotelArray);
  } catch (err) {
    response.successful = false;
    response.error += err;
    response.mess += 'error with hotel insert';
    const error = new HttpError(
      'Something went wrong, could not upload the hotel-rooms',
      500,
    );
    next(error);
    return;
  }
  for (let i = 0; i < speakerArray.length; i++) {
    speakerArray[i].Scheduled = false;
  }

  try {
    await Speaker.insertMany(speakerArray);
  } catch (err) {
    response.successful = false;
    response.error += err;
    response.mess += 'error with speaker insert';
    const error = new HttpError(
      'Something went wrong, could not upload the speakers',
      500,
    );
    next(error);
    return;
  }
  res.json(response);
};

module.exports = { uploadDataToDb };
