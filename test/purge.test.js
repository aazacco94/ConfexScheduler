const {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} = require('@jest/globals');
const mongo = require('./helpers/mongo-mock');
const HotelRoom = require('../models/HotelRoom');
const UnscheduledSession = require('../models/UnscheduledSession');
const Speaker = require('../models/Speaker');
const Dates = require('../models/DateRange');
const ScheduledSession = require('../models/ScheduledSession');
const purgeControllers = require('../controllers/purge-controller');

async function createHotels() {
  await HotelRoom.insertMany([
    { Property: 'The Plaza', RoomID: 1001 },
    { Property: 'Ritz Paris', RoomID: 1002 },
    { Property: 'Hotel Pennsylvania', RoomID: 1003 },
    { Property: 'Hotel Pennsylvania', RoomID: 1004 },
  ]);
}

async function createDates() {
  const startDate = new Date();
  const endDate = new Date();
  await Dates.create({ _id: 9999, start_date: startDate, end_date: endDate });
}

async function createSpeakers() {
  await Speaker.insertMany([
    {
      PersonID: 11,
      First: 'F11',
      Last: 'L11',
      EntryID: 1,
      SessionID: 1000,
      Scheduled: false,
    },
    {
      PersonID: 12,
      First: 'F12',
      Last: 'L12',
      EntryID: 2,
      SessionID: 1001,
      Scheduled: false,
    },
    {
      PersonID: 13,
      First: 'F13',
      Last: 'L13',
      EntryID: 3,
      SessionID: 1002,
      Scheduled: false,
    },
  ]);
}

async function createUnscheduledSessions() {
  await UnscheduledSession.insertMany([
    { SessionID: 100, RoomId: 103 },
    { SessionID: 101, RoomId: 104 },
    { SessionID: 102, RoomId: 105 },
  ]);
}

async function createScheduledSessions() {
  await ScheduledSession.insertMany([
    { SessionID: 1000, RoomId: 1003 },
    { SessionID: 1001, RoomId: 1004 },
    { SessionID: 1002, RoomId: 1005 },
  ]);
}

describe('Delete all test', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
    await HotelRoom.insertMany([
      { Property: 'The Plaza', RoomID: 1001 },
      { Property: 'Ritz Paris', RoomID: 1002 },
      { Property: 'Hotel Pennsylvania', RoomID: 1003 },
      { Property: 'Hotel Pennsylvania', RoomID: 1004 },
    ]);
    await ScheduledSession.insertMany([
      { SessionID: 1000, RoomId: 1003 },
      { SessionID: 1001, RoomId: 1004 },
      { SessionID: 1002, RoomId: 1005 },
    ]);
     await Speaker.insertMany([
      { PersonID: 11, First: 'F11', Last:'L11', EntryID: 1, SessionID:1000, Scheduled: false },
      { PersonID: 12, First: 'F12', Last:'L12',  EntryID: 2, SessionID:1001, Scheduled: false },
      { PersonID: 13, First: 'F13', Last:'L13',  EntryID: 3, SessionID:1002, Scheduled: false },
    ]);
     await UnscheduledSession.insertMany([
      { SessionID: 100, RoomId: 103 },
      { SessionID: 101, RoomId: 104 },
      { SessionID: 102, RoomId: 105 },
    ]);
    await UnscheduledSession.insertMany({ start_date: new Date(), end_date: new Date() });
})

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should delete delete all hotels', async () => {
    await createHotels();
    const resp = await purgeControllers.deleteHotelDB();
    const count = await HotelRoom.find({}).count();
    expect(count).toEqual(0);
    expect(resp.message).toEqual('Successfully deleted HOTEL collection');
  });

  it('should delete delete all dates', async () => {
    await createDates();
    const resp = await purgeControllers.deleteDateDB();
    const count = await Dates.find({}).select('start_date -_id').count();
    expect(count).toEqual(0);
    expect(resp.message).toEqual('Successfully deleted DATE collection');
  });

  it('should delete delete all speakers', async () => {
    await createSpeakers();
    const resp = await purgeControllers.deleteSpeakerDB();
    const count = await Speaker.find({}).count();
    expect(count).toEqual(0);
    expect(resp.message).toEqual('Successfully deleted SPEAKER collection');
  });

  it('should delete delete all unscheduled', async () => {
    await createUnscheduledSessions();
    const resp = await purgeControllers.deleteUnscheduledDB();
    const count = await UnscheduledSession.find({}).count();
    expect(count).toEqual(0);
    expect(resp.message).toEqual('Successfully deleted UNSCHEDULED collection');
  });

  it('should delete delete all scheduled', async () => {
    await createScheduledSessions();
    const resp = await purgeControllers.deleteScheduledDB();
    const count = await ScheduledSession.find({}).count();
    expect(count).toEqual(0);
    expect(resp.message).toEqual('Successfully deleted SCHEDULED collection');
  });

  it('should delete delete all databases', async () => {
    const req = { params: { id: 'All' } };
    const res = { json: () => {} };

    await Promise.all([
      createHotels(),
      createDates(),
      createSpeakers(),
      createUnscheduledSessions(),
      createScheduledSessions(),
    ]);

    await purgeControllers.purgeData(req, res);

    const scheduleCount = await ScheduledSession.find({}).count();
    expect(scheduleCount).toEqual(0);

    const unscheduledCount = await UnscheduledSession.find({}).count();
    expect(unscheduledCount).toEqual(0);

    const speakCount = await Speaker.find({}).count();
    expect(speakCount).toEqual(0);

    const dateCount = await Dates.find({}).count();
    expect(dateCount).toEqual(0);

    const hotelCount = await HotelRoom.find({}).count();
    expect(hotelCount).toEqual(0);
  });

   it('should tranfer data over', async () => {
    const res = { json: () => {} }; 
    const req = {};
    let resp = await purgeControllers.switcharo(req, res);
    
    const scheduleCount = await ScheduledSession.find({}).count();
    expect(scheduleCount).toEqual(0);

    const speakCount = await Speaker.find({Scheduled:true}).count();
    expect(speakCount).toEqual(0);
    expect(resp).toEqual(undefined);
    
  });



});
