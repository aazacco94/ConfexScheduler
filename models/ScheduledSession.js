const mongoose = require('mongoose');

const scheduledSchema = new mongoose.Schema({
  SessionID: { type: Number, required: true },
  Title: { type: String, required: false },
  Format: { type: String, required: false },
  Type: { type: String, required: false },
  Slotid: { type: Number, required: false },
  EstSeating: { type: Number, required: false },
  Topic: { type: String, required: false },
  Subject: { type: String, required: false },
  Sponsor: { type: String, required: false },
  Cosponsor: { type: String, required: false },
  Duration: { type: String, required: false },
  Virtual: { type: String, required: false },
  AV_Equipment: { type: String, required: false },
  RoomId: { type: Number, required: false },
});

module.exports = mongoose.model('ScheduledSessions', scheduledSchema);
