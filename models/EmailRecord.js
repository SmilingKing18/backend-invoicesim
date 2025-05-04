const mongoose = require('mongoose');
// Records each email instance and choice
const EmailRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  week: Number,
  emailIndex: Number,
  behaviorType: String,
  amount: Number,
  choice: String, // 'pay' or 'wait'
  timestamp: Date,
});
module.exports = mongoose.model('EmailRecord', EmailRecordSchema);