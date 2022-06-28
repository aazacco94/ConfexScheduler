const UnscheduledSession = require('../models/UnscheduledSession');
const HotelRoom = require('../models/HotelRoom');

const sessionsQuery = async (req, res) => {
  const { types, formats, topics } = req.body;
  const mongooseParams = {};

  if (types != null) {
    mongooseParams.Type = { $in: types };
  }
  if (formats != null) {
    mongooseParams.Format = { $in: formats };
  }
  if (topics != null) {
    mongooseParams.Topic = { $in: topics };
  }

  const sessions = await UnscheduledSession.find(mongooseParams).sort('Title').exec();
  res.json(sessions);
};

/// pulls information for the Type filter options on the sessionsPage
const sessionFilterOptions = async (req, res) => {
  const responseFilter = { Type: [], Format: [], Topic: [] };
  // Get types without duplicates.
  responseFilter.Type = await UnscheduledSession.find({})
    .select('Type -_id')
    .distinct('Type')
    .sort()
    .exec();
  // Get formats without dupicates.
  responseFilter.Format = await UnscheduledSession.find({})
    .select('Format -_id')
    .distinct('Format')
    .sort()
    .exec();
  // Get topics without dupicates.
  responseFilter.Topic = await UnscheduledSession.find({})
    .select('Topic -_id')
    .distinct('Topic')
    .sort()
    .exec();

  res.json(responseFilter);
};

const roomHotelOptions = async (req, res) => {
  const sessions = await HotelRoom.find({}, { Property: 1, RoomID: 0 })
    .distinct('Property')
    .sort()
    .exec();
  res.json(sessions);
};

module.exports = {
  sessionsQuery,
  sessionFilterOptions,
  roomHotelOptions,
};
