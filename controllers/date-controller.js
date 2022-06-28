const DateRange = require('../models/DateRange');

const storeDateRange = async (req, res) => {
  const startDate = req.query.start;
  const endDate = req.query.end;

  const temp = new Date(startDate);
  const month = temp.getMonth() + 1;
  const date = temp.getDate();
  const year = temp.getFullYear();
  const start = `${month}/${date}/${year}`;

  const temp2 = new Date(endDate);
  const month2 = temp2.getMonth() + 1;
  const date2 = temp2.getDate();
  const year2 = temp2.getFullYear();
  const end = `${month2}/${date2}/${year2}`;

  const filter = { _id: 9999 };
  const update = { $set: { start_date: start, end_date: end } };
  const options = { upsert: true };

  let failed = false;
  try {
    await DateRange.updateOne(filter, update, options).exec();
  } catch (err) {
    console.error(err);
    failed = true;
  }

  if (failed) {
    res.json({ error: 'StoreDateRangeError', message: 'Could not update date range' });
  } else {
    res.json({});
  }
};

const getDateRange = async (req, res) => {
  const dateRange = await DateRange.find({ _id: 9999 }).exec();
  const dt = new Date(dateRange[0].start_date);
  const end = new Date(dateRange[0].end_date);

  const dates = [];
  while (dt <= end) {
    const month = dt.getMonth() + 1;
    const day = dt.getDate();
    const year = dt.getFullYear();
    const updStr = `${month}/${day}/${year}`;

    let str;
    if (dt.getDay() === 0) {
      str = 'Sun:  ';
      str += updStr;
      dates.push(str);
    } else if (dt.getDay() === 1) {
      str = 'Mon:  ';
      str += updStr;
      dates.push(str);
    } else if (dt.getDay() === 2) {
      str = 'Tue:  ';
      str += updStr;
      dates.push(str);
    } else if (dt.getDay() === 3) {
      str = 'Wed:  ';
      str += updStr;
      dates.push(str);
    } else if (dt.getDay() === 4) {
      str = 'Thu:  ';
      str += updStr;
      dates.push(str);
    } else if (dt.getDay() === 5) {
      str = 'Fri:  ';
      str += updStr;
      dates.push(str);
    } else {
      str = 'Sat:  ';
      str += updStr;
      dates.push(str);
    }

    dt.setDate(dt.getDate() + 1);
  }
  res.json(dates);
};

module.exports = {
  storeDateRange,
  getDateRange,
};
