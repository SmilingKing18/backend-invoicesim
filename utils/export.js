const { Parser } = require('json2csv');
const User = require('../models/User');
const EmailRecord = require('../models/EmailRecord');
const Response = require('../models/Response');

exports.exportAll = async (req, res) => {
  const users = await User.find();
  const emailRecs = await EmailRecord.find();
  const responses = await Response.find();
  const data = { users, emailRecs, responses };
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment('export.csv');
  return res.send(csv);
};