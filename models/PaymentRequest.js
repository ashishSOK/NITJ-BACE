// models/PaymentRequest.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash','upi','bank','other'], default: 'other' },
  note: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
