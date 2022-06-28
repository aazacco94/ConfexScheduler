const {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} = require('@jest/globals');
const mongo = require('./helpers/mongo-mock');
const HotelRoom = require('../models/HotelRoom');
const ScheduledSession = require('../models/ScheduledSession');
const hotelsControllers = require('../controllers/hotel-controller');

describe('Delete Hotels', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
    await HotelRoom.insertMany([
      { Property: 'The Plaza', RoomID: 1001 },
      { Property: 'Ritz Paris', RoomID: 1002 },
      { Property: 'Hotel Pennsylvania', RoomID: 1003 },
      { Property: 'Hotel Pennsylvania', RoomID: 1004 },
    ]);
    await ScheduledSession.create(
      { SessionID: 1000, RoomId: 1003 },
    );
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should delete two of four hotels', async () => {
    const properties = ['The Plaza', 'Ritz Paris']; // Hotel names to delete
    const req = { query: { properties } }; // Request stub
    const res = { json: () => {} }; // Response stub
    await hotelsControllers.deleteHotels(req, res);
    const count = await HotelRoom.count().exec();
    expect(count).toEqual(2);
  });

  it('should not delete an hotel with scheduled sessions', async () => {
    // Hotel Pennsylvania has two rooms. One of the rooms has a scheduled
    // session, therefore no rooms should be deleted because the hotel cannot
    // be deleted.
    const properties = ['Hotel Pennsylvania']; // Hotel names to delete
    const req = { query: { properties } }; // Request stub
    const res = { json: () => {} }; // Response stub
    await hotelsControllers.deleteHotels(req, res);
    const count = await HotelRoom.count({ Property: 'Hotel Pennsylvania' }).exec();
    expect(count).toEqual(2);
  });
});
