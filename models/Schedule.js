// models/Schedule.js
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  type: { type: String, enum: ['cooking', 'deity_wakeup', 'cleaning', 'aarti', 'other'], required: true },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeSlot: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);