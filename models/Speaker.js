const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
  PersonID: { type: Number, required: true },
  First: { type: String, required: true },
  Last: { type: String, required: true },
  Role: { type: String, required: false },
  EntryTable: { type: String, required: false },
  EntryID: { type: Number, required: true },
  SessionID: { type: Number, required: true },
  Scheduled: { type: Boolean, required: true },
});

module.exports = mongoose.model('speakers', speakerSchema);
