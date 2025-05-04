const mongoose = require('mongoose');
// Questionnaire responses
const ResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  week: Number,
  emailIndex: Number,
  questions: [Number], // 4 scaled answers
  final: { // optional final questionnaire
    q1: String,
    q2: String,
    q3: String,
  }
});
module.exports = mongoose.model('Response', ResponseSchema);