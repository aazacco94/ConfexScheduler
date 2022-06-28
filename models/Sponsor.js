const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Scheduled: { type: Array, required: false },
});

module.exports = mongoose.model('sponsors', sponsorSchema);
