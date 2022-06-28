const mongoose = require('mongoose');

const DateRangeSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  days: { type: Array, required: false },
});

module.exports = mongoose.model('daterange', DateRangeSchema);
