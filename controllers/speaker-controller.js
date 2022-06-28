const Speaker = require('../models/Speaker');
const HttpError = require('../models/HttpError');

const createSpeaker = async (req, res) => {
  const jsonBody = req.body;
  const result = await Speaker.create({
    PersonID: jsonBody.PersonID,
    First: jsonBody.First,
    Last: jsonBody.Last,
    Role: jsonBody.Role,
    EntryTable: jsonBody.EntryTable,
    EntryID: jsonBody.EntryID,
    SessionID: jsonBody.SessionID,
    Scheduled: jsonBody.Scheduled,
  });
  res.json(result);
};

const getSpeakers = async (req, res, next) => {
  let speakers;
  try {
    speakers = await Speaker.find().exec();
  } catch (err) {
    const error = new HttpError('Error Finding Speaker', 500);
    next(error);
    return;
  }
  res.json(speakers);
};

module.exports = {
  createSpeaker,
  getSpeakers,
};
