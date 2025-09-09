// routes/payments.js
const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');
const Rent = require('../models/Rent');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/login');
};

// Member: submit payment request
router.post('/request', ensureAuthenticated, async (req, res) => {
  try {
    const { amount, method, note, semester } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.render('error', { user: req.user, message: 'Invalid amount' });

    const sem = semester || `${new Date().getFullYear()}-S1`;

    const pr = new PaymentRequest({
      user: req.user._id,
      semester: sem,
      amount: amt,
      method: method || 'other',
      note: note || ''
    });
    await pr.save();

    // Ensure rent doc exists
    await Rent.findOneAndUpdate(
      { user: req.user._id, semester: sem },
      { $setOnInsert: { semesterTotal: 30000 }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error('payment request error', err);
    res.render('error', { user: req.user, message: 'Error submitting payment request' });
  }
});

// Member: view own payment requests (optional)
router.get('/my-requests', ensureAuthenticated, async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('payments/my-requests', { user: req.user, requests });
  } catch (err) {
    console.error('payment my-requests error', err);
    res.render('error', { user: req.user, message: 'Error loading your payment requests' });
  }
});

module.exports = router;
