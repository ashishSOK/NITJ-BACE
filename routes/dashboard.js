// routes/dashboard.js
const express = require('express');
const router = express.Router();

const Sadhana = require('../models/Sadhana');
const Seva = require('../models/Seva');
const Rent = require('../models/Rent');
const PaymentRequest = require('../models/PaymentRequest'); // fixed name

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/login');
};

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const sadhana = await Sadhana.find({ user: req.user._id }).sort({ date: -1 }).limit(7);
    let seva;
        if (req.user.role === 'admin') {
        // Admin sees all sevas with member info
        seva = await Seva.find()
            .populate('user', 'name email')
            .sort({ date: -1 })
            .limit(20);
        } else {
        // Member sees only their own
        seva = await Seva.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(10);
            console.log(123)
            console.log(seva)
        }


    // Rent info
    const semester = `${new Date().getFullYear()}-S1`;
    const rent = await Rent.findOne({ user: req.user._id, semester });

    let rentInfo = {
      total: 30000,
      paid: 0,
      remaining: 30000,
      paidUntil: null
    };

    if (rent) {
      rentInfo.paid = rent.paidAmount || 0;
      rentInfo.remaining = rent.semesterTotal - rentInfo.paid;
      rentInfo.paidUntil = rent.updatedAt || null;
    }

    res.render('dashboard', { user: req.user, sadhana, seva, rent: rentInfo });
  } catch (err) {
    console.error('dashboard error', err);
    res.render('error', { user: req.user, message: 'Error loading dashboard' });
  }
});

module.exports = router;
