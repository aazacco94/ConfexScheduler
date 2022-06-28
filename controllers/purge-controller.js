const UnscheduledSession = require('../models/UnscheduledSession');
const ScheduledSession = require('../models/ScheduledSession');
const DateRange = require('../models/DateRange');
const HotelRoom = require('../models/HotelRoom');
const Speaker = require('../models/Speaker');
const HttpError = require('../models/HttpError');

const deleteScheduledDB = async () => {
  const status = {};
  try {
    await ScheduledSession.deleteMany();
    status.success = true;
    status.message = 'Successfully deleted SCHEDULED collection';
  } catch (err) {
    status.success = false;
    status.message = 'Failed deleting SCHEDULED collection!';
  }
  return status;
};

const deleteUnscheduledDB = async () => {
  const status = {};
  try {
    await UnscheduledSession.deleteMany();
    status.success = true;
    status.message = 'Successfully deleted UNSCHEDULED collection';
  } catch (err) {
    status.success = false;
    status.message = 'Failed deleting UNSCHEDULED collection!';
  }
  return status;
};

const deleteHotelDB = async () => {
  const status = {};
  try {
    await HotelRoom.deleteMany();
    status.success = true;
    status.message = 'Successfully deleted HOTEL collection';
  } catch (err) {
    status.success = false;
    status.message = 'Failed deleting HOTEL collection!';
  }
  return status;
};

const deleteDateDB = async () => {
  const status = {};
  try {
    await DateRange.deleteMany();
    status.success = true;
    status.message = 'Successfully deleted DATE collection';
  } catch (err) {
    status.success = false;
    status.message = 'Failed deleting DATE collection!';
  }
  return status;
};

const deleteSpeakerDB = async () => {
  const status = {};
  try {
    await Speaker.deleteMany();
    status.success = true;
    status.message = 'Successfully deleted SPEAKER collection';
    return status;
  } catch (err) {
    status.success = false;
    status.message = 'Failed deleting SPEAKER collection!';
  }
  return status;
};

const purgeData = async (req, res) => {
  // If any delete calls fail then it notes that in the response.
  const actualResp = { successful: true, error: false, errMessage: '' };
  let errMessage = '';
  let successful = true;
  let error = false;

  // delete the speaker db.
  if (req.params.id === 'Speaker') {
    const speakerRes = await deleteSpeakerDB();
    if (!speakerRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the speaker db';
    }
  }

  // Deleting the date db.
  if (req.params.id === 'Date') {
    const dateRes = await deleteDateDB();
    if (!dateRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the date db';
    }
  }

  // Deleting the scheduled db.
  if (req.params.id === 'Scheduled') {
    const scheduleRes = await deleteScheduledDB();
    if (!scheduleRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the scheduled db';
    }
  }

  // Deleting the unscheduled db.
  if (req.params.id === 'Unscheduled') {
    const unscheduledRes = await deleteUnscheduledDB();
    if (!unscheduledRes.status) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the unscheduled db';
    }
  }

  // Deleting the hotel db.
  if (req.params.id === 'Hotel') {
    const hotelRes = await deleteHotelDB();
    if (!hotelRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the hotel db';
    }
  }

  // Deleting ALL dbs.
  if (req.params.id === 'All') {
    const hotelRes = await deleteHotelDB();
    if (!hotelRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the hotel db';
    }
    const dateRes = await deleteDateDB();
    if (!dateRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the date db';
    }
    const scheduleRes = await deleteScheduledDB();
    if (!scheduleRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the scheduled db';
    }
    const unscheduledRes = await deleteUnscheduledDB();
    if (!unscheduledRes.status) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the unscheduled db';
    }
    const speakerRes = await deleteSpeakerDB();
    if (!speakerRes.success) {
      error = true;
      successful = false;
      errMessage += 'Failed to delete the speaker db';
    }
  }
  actualResp.err = error;
  actualResp.successful = successful;
  actualResp.errMessage = errMessage;

  res.json(actualResp);
};

const switcharo = async (req, res, next) => {
  try {
    // Get all scheduled sessions
    const scheduled = await ScheduledSession.find().exec();
    // Move the scheduled sessions to the unscheduled collection
    await UnscheduledSession.insertMany(scheduled);
    // Clear the scheduled array inside the hotelroom db.
    await HotelRoom.updateMany({}, { $set: { Scheduled: [] } });
    // Set all speakers to Scheduled = false
    await Speaker.updateMany({}, { $set: { Scheduled: false } });
    // Clear the scheduled session db of all sessions.
    await deleteScheduledDB();
    res.json(scheduled);
  } catch (err) {
    console.error(err);
    next(new HttpError('Failed un-schedule sessions', 500));
  }
};

module.exports = {
  deleteDateDB,
  deleteScheduledDB,
  deleteUnscheduledDB,
  deleteSpeakerDB,
  deleteHotelDB,
  purgeData,
  switcharo,
};
