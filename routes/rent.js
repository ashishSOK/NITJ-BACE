const express = require('express');
const Rent = require('../models/Rent');

const router = express.Router();
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { dueAmount, status, paidUntil } = req.body;
    await Rent.findOneAndUpdate(
      { user: req.user._id },
      { dueAmount, status, paidUntil },
      { upsert: true, new: true }
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Rent update error:', err);
    res.render('error', { user: req.user, message: 'Error updating rent' });
  }
});

module.exports = router;
