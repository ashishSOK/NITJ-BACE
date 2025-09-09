const express = require('express');
const Sadhana = require('../models/Sadhana');

const router = express.Router();
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { date, wakeupTime, sleepTime, bgStudyHours } = req.body;
    const log = new Sadhana({
      user: req.user._id,
      date: new Date(date),
      wakeupTime,
      sleepTime,
      bgStudyHours: parseFloat(bgStudyHours) || 0
    });
    await log.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Sadhana save error:', err);
    res.render('error', { user: req.user, message: 'Error logging sadhana' });
  }
});

module.exports = router;
