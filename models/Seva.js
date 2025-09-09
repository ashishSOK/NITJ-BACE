// models/Seva.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SevaSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, default: 'other' },            // cooking, arti, cleaning...
  timeSlot: { type: String },
  note: { type: String },
  status: { type: String, enum: ['assigned','pending','completed','skipped'], default: 'assigned' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin who assigned
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SevaSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Seva', SevaSchema);
