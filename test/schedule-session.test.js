const {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} = require('@jest/globals');
const httpMocks = require('node-mocks-http');
const mongo = require('./helpers/mongo-mock');
const scheduleController = require('../controllers/schedule-controller');
const ScheduledModel = require('../models/ScheduledSession');
const HotelModel = require('../models/HotelRoom');
const UnscheduledModel = require('../models/UnscheduledSession');

/* eslint-disable no-undef */ // jest
HotelModel.find = jest.fn();
ScheduledModel.find = jest.fn();
UnscheduledModel.find = jest.fn();

let req;
let res;
let next;
const sessionIdTest = 62999942012;
const roomIdTest = 99999999;
const timeTest = '8:00:AM-9:15:AM';
const dateTest = 'Wed:  4/6/2022';

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

describe('scheduleController.scheduleSessions', () => {
  let query = {};

  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should have a scheduleSessions function', () => {
    expect(typeof scheduleController.scheduleSessions).toBe('function');
  });
  it('should call UnscheduledModel.find with SessionID query parameters', async () => {
    req.body = {
      sessions: [],
      rooms: [],
      dates: {
        times: [],
        weekdays: [],
      },
    };
    req.body.sessions = sessionIdTest;
    req.body.rooms = roomIdTest;
    req.body.dates.times = [timeTest];
    req.body.dates.weekdays = [dateTest];

    query = { SessionID: sessionIdTest };
    await scheduleController.scheduleSessions(req, res, next);
    expect(UnscheduledModel.find).toBeCalledWith(query);
  });
});

describe('scheduleController.getSessionsByDate', () => {
  let query = {};

  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should have a getSessionsByDate function', () => {
    expect(typeof scheduleController.getSessionsByDate).toBe('function');
  });
  it('should call HotelModel.find with query parameters', async () => {
    req.query.sessionId = sessionIdTest;
    query = { Scheduled: { $elemMatch: { sessionId: sessionIdTest } } };
    await scheduleController.getSessionsByDate(req, res, next);
    expect(HotelModel.find).toBeCalledWith(query);
  });
  it('should return 200 when Hotel Item doesnt exist', async () => {
    HotelModel.find.mockReturnValue(null);
    await scheduleController.getSessionsByDate(req, res, next);
    expect(res.statusCode).toBe(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._isEndCalled()).toEqual(false);
  });
  it('should return 200 when Scheduled Item doesnt exist', async () => {
    ScheduledModel.find.mockReturnValue(null);
    await scheduleController.getSessionsByDate(req, res, next);
    expect(res.statusCode).toBe(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._isEndCalled()).toEqual(false);
  });
});
