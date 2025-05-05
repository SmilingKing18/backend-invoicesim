const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  age: String,
  gender: String,
  education: String,
  location: String,
  startBudget: { type: Number, default: 1000 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);