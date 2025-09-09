// models/Rent.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const RentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  semesterTotal: { type: Number, default: 30000 },
  paidAmount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rent', RentSchema);
