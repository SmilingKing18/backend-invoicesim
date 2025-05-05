const mongoose = require('mongoose');
// Questionnaire responses
const ResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  week: mongoose.Schema.Types.Mixed,
  emailIndex: Number,
  questions: [Number], // 4 scaled answers
  final: {
    countDown: Number,    // new scale 1–5
    q1: String,
    q2: String,
    q3: String
  }
});
module.exports = mongoose.model('Response', ResponseSchema);