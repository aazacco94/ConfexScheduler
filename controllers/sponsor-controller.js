const HttpError = require('../models/HttpError');
const Sponsor = require('../models/Sponsor');

const createSponsor = async (req, res) => {
  const jsonBody = req.body;
  const result = await Sponsor.create({
    Name: jsonBody.Sponsor,
    Scheduled: jsonBody.Scheduled,
  });
  res.json(result);
};

const getSponsors = async (req, res, next) => {
  let sponsors;
  try {
    sponsors = await Sponsor.find().exec();
  } catch (err) {
    const error = new HttpError('Error Finding Sponsors', 500);
    next(error);
    return;
  }
  res.json(sponsors);
};

module.exports = {
  createSponsor,
  getSponsors,
};
