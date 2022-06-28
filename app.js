const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config');

const corsOptions = {
  origin: [/http:\/\/localhost:\d+/, 'https://www.scheduler.page'],
};

const app = express();
// eslint-disable-next-line import/order
const cors = require('cors')(corsOptions);

app.use(cors);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use(cookieParser());

app.use('/api', require('./routes/api'));

mongoose
  .connect(config.mongoURL.toString())
  .then(() => {
    console.log('Connected to Database!');
  })
  .catch(() => {
    console.log('Connection FAILED!');
  });

app.listen(3000, 'localhost', () => {
  console.log('Listening on http://localhost:3000');
});

module.exports = app;
