const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  Property: { type: String, required: true },
  Room: { type: String, required: false },
  Capacity: { type: Number, required: false },
  Guaranteed_Equipment: { type: String, required: false },
  RoomID: { type: Number, required: false },
  Scheduled: { type: Array, required: false },
});

module.exports = mongoose.model('hotelrooms', hotelSchema);
