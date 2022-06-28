const ScheduledSession = require('../models/ScheduledSession');
const UnscheduledSession = require('../models/UnscheduledSession');
const HotelRoom = require('../models/HotelRoom');
const Speaker = require('../models/Speaker');
const Sponsor = require('../models/Sponsor');
const HttpError = require('../models/HttpError');

async function checkSpeakerAvailability(sessionID, time, date) {
  // Find all speakers objects associated to this sessionID
  let speakers;
  let available = true;
  try {
    speakers = await Speaker.find({ SessionID: sessionID }).exec();
  } catch (err) {
    available = false;
    throw new HttpError(
      'Something went wrong, could not find speakers from sessionID.',
      500,
    );
  }

  // store all personIDs of the speakers from line 21
  const personIDs = [];
  for (let i = 0; i < speakers.length; i++) {
    personIDs.push(speakers[i].PersonID);
  }

  // Find all speaker objects associated with all personIDs from line 34
  try {
    speakers = await Speaker.find({ PersonID: personIDs }).exec();
  } catch (err) {
    available = false;
    throw new HttpError(
      'Something went wrong, could not find speakers from personIDs.',
      500,
    );
  }

  // Save only the speaker objects that have scheduled = true
  const sessionIDs = [];
  for (let i = 0; i < speakers.length; i++) {
    if (speakers[i].Scheduled === true) {
      sessionIDs.push(speakers[i].SessionID);
    }
  }

  // if At least one speaker has a scheduled session
  if (sessionIDs.length >= 1) {
    // Find all scheduled sessions
    let sessions;
    try {
      sessions = await ScheduledSession.find({ SessionID: sessionIDs }).exec();
    } catch (err) {
      available = false;
      throw new HttpError(
        'Something went wrong, could not find scheduled sessions from sessionIDs.',
        500,
      );
    }

    let tempRoomID;
    let hotel;
    // for each session in sessions find roomID associated
    for (let i = 0; (i < sessions.length) && available; i++) {
      // Find all hotel objects with roomIDs
      tempRoomID = sessions[i].RoomId;
      try {
        hotel = await HotelRoom.findOne({ RoomID: tempRoomID }).exec();
      } catch (err) {
        available = false;
        throw new HttpError(
          'Something went wrong, could not find hotel Room from RoomID.',
          500,
        );
      }

      for (let j = 0; (j < hotel.Scheduled.length) && available; j++) {
        if (hotel.Scheduled[j].sessionId === sessions[i].SessionID) {
          if (hotel.Scheduled[j].time === time && hotel.Scheduled[j].start_date === date) {
            available = false;
          }
        }
      }
    }
  } else {
    // none of the speakers have been scheduled.
    available = true;
  }
  return available;
}

const scheduleSessions = async (req, res, next) => {
  let successful;
  let message = 'Conflict: \n';
  const input = req.body;
  const postSessions = input.sessions;
  const postRooms = input.rooms;
  const postTimes = input.dates.times;
  const postWeekdays = input.dates.weekdays;

  const dates = [];
  let date;
  let dateStr;
  for (let i = 0; i < postWeekdays.length; i++) {
    dateStr = postWeekdays[i].split(': ');
    // eslint-disable-next-line prefer-destructuring
    date = dateStr[1];
    date = date.substring(1);
    dates.push(date);
  }

  const times = [];
  let timeStr;
  let time;
  for (let i = 0; i < postTimes.length; i++) {
    timeStr = postTimes[i].split('-');
    // eslint-disable-next-line prefer-destructuring
    time = timeStr[0];
    times.push(time);
  }

  let sessions;
  try {
    sessions = await UnscheduledSession.find({ SessionID: postSessions }).exec();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find sessions from SessionIDs.',
      500,
    );
    next(error);
    return;
  }
  const scheduledArr = [];

  // Sort in descending order by EstSeating
  sessions.sort((a, b) => parseFloat(b.EstSeating) - parseFloat(a.EstSeating));

  // iterate over each session
  for (let x = 0; x < sessions.length; x++) {
    const session = sessions[x];
    let done = false;

    // iterate over times
    let z = 0;
    while (z < times.length && !done) {
      const timesStr = times[z];
      const timeArr = timesStr.split(':');

      // convert to Military Time for Date Object
      if (timeArr[2] === 'PM' && timeArr[0] !== '12') {
        const hours = (parseInt(timeArr[0], 10) + 12);
        timeArr[0] = hours.toString();
      } else if (timeArr[2] === 'AM' && timeArr[0] === '12') {
        timeArr[0] = '00';
      }

      // iterate over dates
      let y = 0;
      while (y < dates.length && !done) {
        const start = dates[y];
        const dateArr = start.split('/');

        const dateObj = new Date(dateArr[2], dateArr[0], dateArr[1], timeArr[0], timeArr[1], 0, 0);

        let rooms;
        try {
          rooms = await HotelRoom.find({ RoomID: { $in: postRooms } }).exec();
        } catch (err) {
          const error = new HttpError(
            'Something went wrong, could not find a hotel rooms from RoomIDs.',
            500,
          );
          next(error);
          return;
        }

        // Sort in ascending order by Capacity
        rooms.sort((a, b) => parseFloat(a.Capacity) - parseFloat(b.Capacity));

        // iterate over each room
        let i = 0;
        while (i < rooms.length && !done) {
          let room = rooms[i];

          const scheduled = room.Scheduled;

          let available = true;
          let j = 0;
          let schObj;
          // iterate over room's scheduled array
          while (j < scheduled.length && available) {
            schObj = scheduled[j];

            const start2 = schObj.start_date;
            const dateArr2 = start2.split('/');
            const time2 = schObj.time;
            const timeArr2 = time2.split(':');
            const endTime2 = schObj.end_time;
            const endTimeArr2 = endTime2.split(':');

            // convert to Military Time for Date Object
            if (timeArr2[2] === 'PM' && timeArr2[0] !== '12') {
              const hours = (parseInt(timeArr2[0], 10) + 12);
              timeArr2[0] = hours.toString();

              const endHours = (parseInt(endTimeArr2[0], 10) + 12);
              endTimeArr2[0] = endHours.toString();
            } else if (timeArr2[2] === 'AM' && timeArr2[0] === '12') {
              timeArr2[0] = '00';
            }

            // eslint-disable-next-line max-len
            const existingTimeStampStart = new Date(dateArr2[2], dateArr2[0], dateArr2[1], timeArr2[0], timeArr2[1], 0, 0);
            // eslint-disable-next-line max-len
            const existingTimeStampEnd = new Date(dateArr2[2], dateArr2[0], dateArr2[1], endTimeArr2[0], endTimeArr2[1], 0, 0);

            // comparing desired date with time stamp inside room scheduled array
            if (dateObj.getFullYear() === existingTimeStampStart.getFullYear()) {
              if (dateObj.getMonth() === existingTimeStampStart.getMonth()) {
                if (dateObj.getDate() === existingTimeStampStart.getDate()) {
                  if (dateObj.getHours() === existingTimeStampStart.getHours()) {
                    available = false;
                    message = `${message}Room: ${room.Property}: ${room.Room} Starting at ${time2} ${start2}\n`;
                  } else if (dateObj.getTime() >= existingTimeStampStart.getTime()
                        && dateObj.getTime() <= existingTimeStampEnd.getTime()) {
                    available = false;
                    message = `${message}Room: ${room.Property}: ${room.Room} between ${time2} and ${endTime2} on ${start2}\n`;
                  }
                }
              }
            }
            j++;
          } // while there are time stamps left to read then still available

          if (available) {
            // Call speaker availability check here
            // Set available to false if speaker is NOT Available
            available = await checkSpeakerAvailability(session.SessionID, timesStr, start);

            if (available) {
              const dur = session.Duration;
              const durStrArr = dur.split(':');
              const timeStrArr = [timeArr[0], timeArr[1], timeArr[2]];

              const durHr = parseInt(durStrArr[0], 10);
              const durMin = parseInt(durStrArr[1], 10);

              const timeHr = parseInt(timeStrArr[0], 10);
              const timeMin = parseInt(timeStrArr[1], 10);

              let endHr = timeHr + durHr;
              let endMin = timeMin + durMin;

              if (endMin > 59) {
                endMin -= 60;
                endHr += 1;
              }

              if (endHr > 12) {
                endHr -= 12;
                timeStrArr[2] = 'PM';
              } else if (endHr === 12) {
                timeStrArr[2] = 'PM';
              }

              if (endHr < 10) {
                timeStrArr[0] = `0${endHr.toString()}`;
              } else {
                timeStrArr[0] = endHr.toString();
              }

              if (endMin < 10) {
                timeStrArr[1] = `0${endMin.toString()}`;
              } else {
                timeStrArr[1] = endMin.toString();
              }

              const endTime = `${timeStrArr[0]}:${timeStrArr[1]}:${timeStrArr[2]}`;

              // DEBUG US325 add duration to start
              const timeStamp = {
                sessionId: session.SessionID,
                start_date: start,
                time: timesStr,
                end_time: endTime,
              };

              const roomID = room.RoomID;
              const sessionID = session.SessionID;
              const sponserName = session.Sponsor;
              let id;

              let query = { RoomID: roomID };
              let update = {
                $push: {
                  Scheduled: timeStamp,
                },
              };
              const options = { upsert: false };

              try {
                await HotelRoom.updateOne(query, update, options)
                  .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if (matchedCount && modifiedCount) {
                      // console.log(`Successfully added time stamp to room.`)
                    }
                  })
                  .catch(err => console.error(`Failed to add review: ${err}`));

                id = room.RoomID;
                room = await HotelRoom.find({ RoomID: id }).exec();
              } catch (err) {
                const error = new HttpError(
                  'Could not update hotel room with time stamp.',
                  404,
                );
                next(error);
                return;
              }

              try {
                await Speaker.updateMany(
                  { SessionID: sessionID },
                  { $set: { Scheduled: true } },
                ).exec();
              } catch (err) {
                available = false;
                const error = new HttpError(
                  'Something went wrong, could not find speakers from sessionID.',
                  500,
                );
                next(error);
                return;
              }

              const schstamp = {
                SessionID: session.SessionID,
                RoomID: id,
              };
              query = { Name: sponserName };
              update = {
                $push: {
                  Scheduled: schstamp,
                },
              };

              try {
                // Query by Sponsor name in varibale sponsor
                // add hotel id to the sponsors matching timestamp
                await Sponsor.updateOne(query, update, options)
                  .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if (matchedCount && modifiedCount) {
                      // console.log(`Successfully added time stamp to sponsor.`)
                    }
                  })
                  .catch(err => console.error(`Failed due to ERROR: ${err}`));
              } catch (err) {
                const error = new HttpError(
                  'Could not update sponsor for unknown reason',
                  500,
                );
                next(error);
                return;
              }

              done = true;

              let result;
              try {
                result = await ScheduledSession.create({
                  SessionID: session.SessionID,
                  Title: session.Title,
                  Format: session.Format,
                  Type: session.Type,
                  Slotid: session.Slotid,
                  EstSeating: session.EstSeating,
                  Topic: session.Topic,
                  Subject: session.Subject,
                  Sponsor: session.Sponsor,
                  Cosponsor: session.Cosponsor,
                  Duration: session.Duration,
                  Virtual: session.Virtual,
                  RoomId: roomID,
                });
              } catch (err) {
                const error = new HttpError(
                  'Failed creating scheduled session!',
                  500,
                );
                next(error);
                return;
              }

              try {
                await UnscheduledSession.deleteOne({ SessionID: sessionID });
              } catch (err) {
                const error = new HttpError(
                  'Failed deleting uscheduled session from database!',
                  500,
                );
                next(error);
                return;
              }

              scheduledArr.push(result);
            } else {
              message = `${message}Personel of ${session.Title} has conflicting times.\n`;
              i++;
              break;
            }
          } else {
            i++;
          }
        } // while we still have rooms left and havent scheduled session

        if (!done) {
          y++;
        }
      } // while we still have dates left and done is false

      if (!done) {
        z++;
      }
    } // while we still have times left and done is false

    // PROBLEM WITH FUNCTIONALITY
    // The else is triggered when a there are time conflicts for every date and time
    if (done) {
      successful = true;
      message += 'Successfully scheduled sessions';
      // console.log('Successful schedule of session: ', session);
    } else {
      successful = false;
      const total = postSessions.length;
      const sessLeft = postSessions.length - scheduledArr.length;
      message += `\nFailed to schedule ${sessLeft} out of ${total} sessions due to conflicting times.\n`;
    }
  } // for all sessions requested

  const bod = { message, good: successful };
  res.json(bod);
};

const getSessionsByDate = async (req, res, next) => {
  const idStr = req.query.sessionId ?? '';
  const start = req.query.start ?? '';
  const time = req.query.time ?? '';

  let query = {};

  if (req.query.sessionId != null) {
    const id = parseInt(idStr, 10);
    query = { Scheduled: { $elemMatch: { sessionId: id } } };
  }
  if (req.query.start != null) {
    query = { Scheduled: { $elemMatch: { start_date: start } } };
  }
  if (req.query.time != null) {
    query = { Scheduled: { $elemMatch: { time } } };
  }

  let hotels;
  try {
    hotels = await HotelRoom.find(query).exec();
  } catch (err) {
    const error = new HttpError(
      'Failed getting hotel rooms from given query!',
      500,
    );
    next(error);
    return;
  }

  const objArray = [];
  query = {};
  let obj2;
  for (let i = 0; i < hotels.length; i++) {
    const obj = hotels[i];

    const schedule = obj.Scheduled;

    for (let j = 0; j < schedule.length; j++) {
      obj2 = schedule[j];
      objArray.push(obj2.sessionId);
    }
  }

  query.SessionID = { $in: objArray };

  let sessions;
  try {
    sessions = await ScheduledSession.find(query).exec();
  } catch (err) {
    const error = new HttpError(
      'Failed finding scheduled sessions from given query!',
      500,
    );
    next(error);
    return;
  }

  res.json(sessions);
};

module.exports = {
  getSessionsByDate,
  scheduleSessions,
};
