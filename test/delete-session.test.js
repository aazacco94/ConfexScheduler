const {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} = require('@jest/globals');
const mongo = require('./helpers/mongo-mock');
const UnscheduledSession = require('../models/UnscheduledSession');
const UnscheduledSessionController = require('../controllers/session-controller');

describe('Delete Unscheduled Session', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
    await UnscheduledSession.insertMany([
      { SessionID: 1, Title: 'First' },
      { SessionID: 2, Title: 'Second' },
    ]);
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should delete the first UnscheduledSession', async () => {
    const req = { body: { SessionID: 1 } }; // Request stub
    const res = { json: () => {} }; // Response stub

    await UnscheduledSessionController.deleteUnscheduledSession(req, res);
    const count = await UnscheduledSession.count().exec();
    expect(count).toEqual(1);
  });
});
