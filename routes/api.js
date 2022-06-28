const express = require('express');
const bodyParser = require('body-parser');
const sessionRoute = require('./session-route');
const hotelRoute = require('./hotel-route');
const queryRoute = require('./query-route');
const scheduleRoute = require('./schedule-route');
const dateRoute = require('./date-route');
const purgeRoute = require('./purge-route');
const sponsorRoute = require('./sponsor-route');
const outputRoute = require('./outputSchedule-route');
const uploadRoute = require('./upload-route');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/data', sessionRoute);
app.use('/data', hotelRoute);
app.use('/data', queryRoute);
app.use('/data', scheduleRoute);
app.use('/data', dateRoute);
app.use('/data', purgeRoute);
app.use('/data', sponsorRoute);
app.use('/data', outputRoute);
app.use('/data', uploadRoute);

module.exports = app;
