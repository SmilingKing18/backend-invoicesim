const mongoose = require('mongoose');

const EmailRecordSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  week:            Number,
  emailIndex:      Number,
  behaviorType:    String,
  amount:          Number,
  choice:          String,       // 'pay' or 'wait'
  timestamp:       Date,
  order:           Number,       // payment order in the week
  emailText:       String,
  companyLogo:     String,
  companyAddress:  String,
});

module.exports = mongoose.model('EmailRecord', EmailRecordSchema);
