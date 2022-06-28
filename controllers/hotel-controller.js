const HotelRoom = require('../models/HotelRoom');
const ScheduledSessions = require('../models/ScheduledSession');
const HttpError = require('../models/HttpError');

const avOptions = async (req, res) => {
  const query = HotelRoom.distinct('Guaranteed_Equipment');
  let result = await query.exec();
  result = result.filter(e => (typeof e === 'string') && (e.length > 0));
  res.json(result);
};

const getHotels = async (req, res) => {
  const { properties } = req.query;
  let query = HotelRoom.distinct('Property');
  if (properties) {
    query = query.in('Property', properties);
  }
  const result = await query.exec();
  res.json(result);
};

const getHotelRooms = async (req, res, next) => {
  const avSetup = req.body.avSetups ?? '';
  const property = req.body.properties ?? '';
  const postTimes = req.body.times ?? '';
  const postWeekdays = req.body.weekdays ?? '';

  const dates = [];
  for (let i = 0; i < postWeekdays.length; i++) {
    const [, date] = postWeekdays[i].split(':  ');
    dates.push(date);
  }

  const times = [];
  for (let i = 0; i < postTimes.length; i++) {
    const [time] = postTimes[i].split('-');
    times.push(time);
  }

  let rooms;
  const unavailableRoomIDs = [];
  try {
    rooms = await HotelRoom.find().exec();
    // Sort in ascending order by longest scheduled array
    rooms.sort((a, b) => parseFloat(a.Scheduled.length) - parseFloat(b.Scheduled.length));
  } catch (err) {
    const error = new HttpError('Error finding hotel rooms', 500);
    next(error);
    return;
  }

  const done = false;
  // iterate over times
  let z = 0;
  while (z < times.length && !done) {
    const timeAr = times[z];
    const timeParts = timeAr.split(':');

    // Convert to Military Time for Date Object
    if (timeParts[2] === 'PM' && timeParts[0] !== '12') {
      const hours = (parseInt(timeParts[0], 10) + 12);
      timeParts[0] = hours.toString();
    } else if (timeParts[2] === 'AM' && timeParts[0] === '12') {
      timeParts[0] = '00';
    }

    // iterate over dates
    let y = 0;
    while (y < dates.length && !done) {
      const start = dates[y];
      const dateParts = start.split('/');

      // eslint-disable-next-line max-len
      const dateObj = new Date(dateParts[2], dateParts[0], dateParts[1], timeParts[0], timeParts[1], 0, 0);

      // iterate over each room
      let i = 0;
      while (i < rooms.length && !done) {
        const room = rooms[i];
        const scheduled = room.Scheduled;

        let available = true;
        let j = 0;
        let schObj;
        // iterate over room's scheduled array
        while (scheduled.length > 1 && j < scheduled.length && available) {
          schObj = scheduled[j];

          const start2 = schObj.start_date;
          const dateParts2 = start2.split('/');
          const time2 = schObj.time;
          const timeParts2 = time2.split(':');

          // Convert to Military Time for Date Object
          if (timeParts2[2] === 'PM' && timeParts2[0] !== '12') {
            const hours = (parseInt(timeParts2[0], 10) + 12);
            timeParts2[0] = hours.toString();
          } else if (timeParts2[2] === 'AM' && timeParts2[0] === '12') {
            timeParts2[0] = '00';
          }

          // eslint-disable-next-line max-len
          const existingTimeStamp = new Date(dateParts2[2], dateParts2[0], dateParts2[1], timeParts2[0], timeParts2[1], 0, 0);

          // comparing desired date with time stamp inside room scheduled array
          if (dateObj.getFullYear() === existingTimeStamp.getFullYear()) {
            if (dateObj.getMonth() === existingTimeStamp.getMonth()) {
              if (dateObj.getDate() === existingTimeStamp.getDate()) {
                if (dateObj.getHours() === existingTimeStamp.getHours()) {
                  available = false;
                  unavailableRoomIDs.push(room.RoomID);
                }
              }
            }
          }
          j++;
        } // while there are time stamps left to read then still available
        i++;
      }// while there are rooms left
      y++;
    }// while there are dates left
    z++;
  }// while there are times left

  const query = {};

  if (unavailableRoomIDs.length > 0) {
    query.RoomID = { $nin: unavailableRoomIDs };
  }
  if (req.body.avSetups.length > 0) {
    query.Guarenteed_Equipment = { $in: avSetup };
  }
  if (req.body.properties.length > 0) {
    query.Property = { $in: property };
  }

  try {
    rooms = await HotelRoom.find(query).exec();
  } catch (err) {
    const error = new HttpError('Could not find hotel rooms from query!', 500);
    console.error(error);
  }

  res.json(rooms);
};

const deleteHotels = async (req, res) => {
  const { properties } = req.query;
  let pendingDelete;

  if (typeof properties === 'string') {
    pendingDelete = [properties];
  } else if (Array.isArray(properties)) {
    pendingDelete = properties;
  } else {
    res.json({ error: 'No hotel(s) specified for deletion' });
  }

  // Get all the rooms in the matching hotels
  const filter = { Property: { $in: pendingDelete } };
  const matchingRooms = await HotelRoom.find(filter, 'Property RoomID').exec();

  // Get all the rooms that have been booked
  let scheduledRooms = await ScheduledSessions.find({}, 'RoomId').exec();
  scheduledRooms = scheduledRooms.map(obj => obj.RoomId);

  // Filter out hotels that have at least one room booked and make a list for
  // the caller to know which hotels are not going to be deleted
  const notBeingDeleted = [];
  matchingRooms.forEach(room => {
    if (scheduledRooms.includes(room.RoomID)) {
      const index = pendingDelete.indexOf(room.Property);
      if (index > -1) {
        notBeingDeleted.push(pendingDelete.splice(index, 1)[0]);
      }
    }
  });

  let result = { data: notBeingDeleted };

  if (pendingDelete.length > 0) {
    try {
      await HotelRoom.deleteMany(filter).exec();
    } catch (err) {
      result = { error: 'Error occurred while removing hotel(s)' };
    }
  }

  res.json(result);
};

module.exports = {
  deleteHotels,
  getHotels,
  getHotelRooms,
  avOptions,
};
