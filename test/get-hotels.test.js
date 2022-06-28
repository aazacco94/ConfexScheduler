const {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} = require('@jest/globals');
const express = require('express');
const request = require('supertest');
const mongo = require('./helpers/mongo-mock');
const HotelRoom = require('../models/HotelRoom');
const ScheduledSession = require('../models/ScheduledSession');
const router = require('../routes/hotel-route');

const app = express();
app.use('/', router);

describe('Get Hotels', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
    await HotelRoom.insertMany([
      { Property: 'The Plaza', RoomID: 1001 },
    ]);
    await ScheduledSession.create(
      { SessionID: 1000, RoomId: 1003 },
    );
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should have a responds content-type of "application/json; charset=utf-8"', async () => {
    const res = await request(app).get('/hotels');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
  });

  it('should return a 200 status code', async () => {
    const res = await request(app).get('/hotels');
    expect(res.statusCode).toBe(200);
  });

  it('should return an array of ["The Plaza"]', async () => {
    const res = await request(app).get('/hotels');
    expect(res.body[0]).toBe('The Plaza');
  });
});
