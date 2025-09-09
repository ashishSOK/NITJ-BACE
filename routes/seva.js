const express = require('express');
const Seva = require('../models/Seva');
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/login');
};

// ✅ Fetch member’s seva list (for dashboard)
router.get('/my', ensureAuthenticated, async (req, res) => {
  try {
    const seva = await Seva.find({ user: req.user._id }).sort({ date: 1 });
    res.render('seva/my-seva', { user: req.user, seva });
  } catch (err) {
    console.error('Seva fetch error:', err);
    res.render('error', { user: req.user, message: 'Error fetching seva' });
  }
});


// Member self-assign seva (optional, keep if you want)
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { date, type, timeSlot } = req.body;
    const seva = new Seva({
      user: req.user._id,
      date: new Date(date),
      type,
      timeSlot,
      status: 'pending'
    });
    await seva.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Seva save error:', err);
    res.render('error', { user: req.user, message: 'Error saving seva' });
  }
});

// ✅ Member marks seva as completed
router.post('/:id/status', ensureAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const seva = await Seva.findOne({ _id: req.params.id, user: req.user._id });
    if (!seva) {
      return res.render('error', { user: req.user, message: 'Seva not found' });
    }

    seva.status = status || 'completed';
    await seva.save();

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Seva status update error:', err);
    res.render('error', { user: req.user, message: 'Error updating seva status' });
  }
});


module.exports = router;
