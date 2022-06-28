const mongo = require('./helpers/mongo-mock');
const HotelRoom = require('../models/HotelRoom');
const UnscheduledSession = require('../models/UnscheduledSession');
const Speaker = require('../models/Speaker');
const uploadControl = require('../controllers/upload-controller')

describe('Upload Data Test', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
})

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should upload the hotels', async () => {
       var body = {
      hotels:[
      { Property: 'The Plaza', Room: 1001 },
      { Property: 'Ritz Paris', Room: 1002 },
      { Property: 'Hotel Pennsylvania', Room: 1003 },
      { Property: 'Hotel Pennsylvania', Room: 1004 },
      ], 
      speakers:[
      { PersonID: 11, First: 'F11', Last:'L11', EntryID: 1, SessionID:1000, Scheduled: false },
      { PersonID: 12, First: 'F12', Last:'L12',  EntryID: 2, SessionID:1001, Scheduled: false },
      { PersonID: 13, First: 'F13', Last:'L13',  EntryID: 3, SessionID:1002, Scheduled: false },
      ],
      sessions:[
      { SessionID: 100, RoomId: 103 },
      { SessionID: 101, RoomId: 104 },
      ]};
    const req = { body }; // Request stub
    const res = { json: () => {} }; // Response stub
    var resp = await uploadControl.uploadDataToDb(req, res);
    const hotelCount = await HotelRoom.count().exec();
    console.log(`this is the hotels ${resp}`)
    const sessionCount = await UnscheduledSession.count().exec();
    console.log(`this is the sessions ${sessionCount}`);
    const speakerCount = await Speaker.count().exec();
    expect(hotelCount).toEqual(4);
    expect(sessionCount).toEqual(2);
    expect(speakerCount).toEqual(3);
  });
});