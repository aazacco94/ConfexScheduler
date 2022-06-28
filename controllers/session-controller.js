const UnscheduledSession = require('../models/UnscheduledSession');

const createUnscheduledSession = async (req, res) => {
  const jsonBody = req.body;

  const result = await UnscheduledSession.create({
    SessionID: jsonBody.SessionID,
    Title: jsonBody.Title,
    Format: jsonBody.Format,
    Type: jsonBody.Type,
    Slotid: jsonBody.Slotid,
    EstSeating: jsonBody.EstSeating,
    Topic: jsonBody.Topic,
    Subject: jsonBody.Subject,
    Sponsor: jsonBody.Sponsor,
    Cosponsor: jsonBody.Cosponsor,
    Duration: jsonBody.Duration,
    Virtual: jsonBody.Virtual,
    AV_Equipment: jsonBody.AV_Equipment,
  });
  res.json(result);
};

const uploadUnscheduledSessions = async (req, res) => {
  const jsonArray = req.body;
  try {
    await UnscheduledSession.insertMany(jsonArray);
  } catch (err) {
    console.log(err);
  }
  res.json({ response: 'response' });
};

const getUnscheduledSessions = async (req, res) => {
  const sessionID = req.body.SessionID;
  const sessions = await UnscheduledSession.find({ SessionID: sessionID }).exec();
  res.json(sessions);
};

const deleteUnscheduledSession = async (req, res) => {
  const sessionID = req.body.SessionID;
  const result = await UnscheduledSession.remove({ SessionID: sessionID }).exec();
  res.json(result);
};

module.exports = {
  getUnscheduledSessions,
  createUnscheduledSession,
  uploadUnscheduledSessions,
  deleteUnscheduledSession,
};
