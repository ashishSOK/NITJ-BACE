// models/Sadhana.js
const mongoose = require('mongoose');

const SadhanaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  wakeupTime: { type: String, required: true },
  sleepTime: { type: String },
  bgStudyHours: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Sadhana || mongoose.model('Sadhana', SadhanaSchema);