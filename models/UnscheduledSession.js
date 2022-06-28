const mongoose = require('mongoose');

const UnscheduledSchema = new mongoose.Schema({
  SessionID: { type: Number, required: true, default: 0 },
  Title: { type: String, required: false },
  Format: { type: String, required: false },
  Type: { type: String, required: false },
  Slotid: { type: Number, required: false, default: 0 },
  EstSeating: { type: Number, required: false, default: 0 },
  Topic: { type: String, required: false },
  Subject: { type: String, required: false },
  Sponsor: { type: String, required: false },
  Cosponsor: { type: String, required: false },
  Duration: { type: String, required: false },
  Virtual: { type: String, required: false },
  AV_Equipment: { type: String, required: false },
});

module.exports = mongoose.model('UnscheduledSessions', UnscheduledSchema);
