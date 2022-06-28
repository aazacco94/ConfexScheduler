const mongo = require('./helpers/mongo-mock');
const DateRange = require('../models/DateRange');
const dateControl = require('../controllers/date-controller');

describe('Date Controller test', () => {
  // Add dates to the db. 
  beforeAll(async () => {

  let date = new Date("Sun Mar 01 2020 00:00:00 GMT-0700 (Mountain Standard Time)");
  let end = new Date("Fri Mar 06 2020 00:00:00 GMT-0700 (Mountain Standard Time)");
  await mongo.start();
  await DateRange.insertMany([
    {_id: 9999, start_date:date, end_date: end}]);
})

  // Clear and stop the database
  afterAll(async () => {
    await mongo.stop();
  });

  it('Update the dates in the db', async () => {
    let start = 'Fri Dec 01 2000 00:00:00 GMT-0700 (Mountain Standard Time)';
    let end = 'Sat Dec 30 2000 00:00:00 GMT-0700 (Mountain Standard Time)';
    const req = { query:{start: start, end: end} }; 
    const res = { json: () => {} }; // Response stub
    let resp = await dateControl.storeDateRange(req, res);
    const updateDate = await DateRange.find({_id: 9999}).exec();
    expect(updateDate[0].start_date).toEqual("12/1/2000");
    expect(updateDate[0].end_date).toEqual("12/30/2000");
    expect(resp).toEqual(undefined);
  });

   it('Update the dates in the db', async () => {
    const req = {}; 
    const res = { json: () => {} }; // Response stub
    let resp = await dateControl.getDateRange(req, res);
    const updateDate = await DateRange.find({_id: 9999}).exec();
    console.log(updateDate[0].start_date);
    expect(updateDate[0].start_date).toEqual("12/1/2000");
    expect(updateDate[0].end_date).toEqual("12/30/2000");
    expect(resp).toEqual(undefined);
  });

});