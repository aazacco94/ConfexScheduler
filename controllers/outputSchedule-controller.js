const HttpError = require('../models/HttpError');
const ScheduledSession = require('../models/ScheduledSession');

const getScheduledOutput = async (req, res, next) => {
  let sessions = [];
  try {
    sessions = await ScheduledSession.aggregate()
      .lookup({ // Append the room where the session is scheduled
        from: 'hotelrooms',
        localField: 'RoomId',
        foreignField: 'RoomID',
        as: 'rooms',
      }).replaceRoot({ // Merge the ScheduledSession and Room fields
        $mergeObjects: [
          '$$ROOT',
          {
            $first: '$rooms',
          },
        ],
      }).project({
        _id: 0,
        SessionID: 1,
        Title: 1,
        Format: 1,
        Type: 1,
        Slotid: 1,
        EstSeating: 1,
        Topic: 1,
        Subject: 1,
        Sponsor: 1,
        Cosponsor: 1,
        Duration: 1,
        Virtual: 1,
        AV_Equipment: 1,
        Property: 1,
        Room: 1,
        Scheduled: 1,
      })
      .sort({ Title: 1 })
      .exec();
  } catch (err) {
    const error = new HttpError(
      'Failed getting scheduled session!',
      500,
    );
    next(error);
    return;
  }

  // Get start date and time from the Scheduled array
  sessions.forEach(session => {
    /* eslint-disable no-param-reassign */
    for (let i = 0; i < session.Scheduled.length; ++i) {
      if (session.Scheduled[i].sessionId === session.SessionID) {
        session.Date = session.Scheduled[i].start_date;
        session.Time = session.Scheduled[i].time;
        break;
      }
    }
    delete session.Scheduled;
    /* eslint-enable no-param-reassign */
  });

  res.json(sessions);
};

module.exports = { getScheduledOutput };
