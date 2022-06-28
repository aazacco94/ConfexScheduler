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
const model = require('../models/Speaker');
const router = require('../routes/speaker-route');

const app = express();
app.use('/', router);

describe('Get Speaker', () => {
  // Populate the database with dummy hotels and sessions
  beforeAll(async () => {
    await mongo.start();
    await model.insertMany([
      {
        PersonID: 1,
        First: 'John',
        Last: 'Smith',
        EntryID: 1,
        SessionID: 1,
        Scheduled: true,
      },
    ]);
  });

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('should have a responds content-type of "application/json; charset=utf-8"', async () => {
    const res = await request(app).get('/getSpeakers');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
  });

  it('should return a 200 status code', async () => {
    const res = await request(app).get('/getSpeakers');
    expect(res.statusCode).toBe(200);
  });

  it('should return a Speaker with the name John Smith', async () => {
    const res = await request(app).get('/getSpeakers');
    expect(res.body[0].First).toBe('John');
    expect(res.body[0].Last).toBe('Smith');
  });
});
