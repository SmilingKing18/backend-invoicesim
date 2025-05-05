const mongoose = require('mongoose');

const EmailRecordSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionID:       String,
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
  displayedAt:     Date,
  responseTime:    Number,
});

module.exports = mongoose.model('EmailRecord', EmailRecordSchema);
