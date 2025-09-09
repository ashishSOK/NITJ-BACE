// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seva = require('../models/Seva');
const Rent = require('../models/Rent');
const PaymentRequest = require('../models/PaymentRequest');
const mongoose = require('mongoose');


// helpers
const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user.role === 'admin') return next();
  return res.redirect('/login');
};

// Show seva assignment page
router.get('/seva', ensureAdmin, async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('name email');
    res.render('admin/seva-assign', { user: req.user, members, error: null });
  } catch (err) {
    console.error('admin/seva GET error', err);
    res.render('error', { user: req.user, message: 'Unable to load members' });
  }
});

// Assign seva (single or multiple)

const { Types } = mongoose;

// Assign seva (single or multiple)
router.post('/seva', ensureAdmin, async (req, res) => {
  try {
    const { userId, userIds, date, type, timeSlot, note } = req.body;

    // collect targets (support multiple selection via userIds array)
    let targets = [];
    if (userIds) {
      if (Array.isArray(userIds)) targets = userIds;
      else targets = String(userIds).split(',').map(x => x.trim()).filter(Boolean);
    } else if (userId) {
      targets = [userId];
    }

    if (!targets.length) {
      const members = await User.find({ role: 'member' }).select('name email');
      return res.render('admin/seva-assign', {
        user: req.user,
        members,
        error: 'Please select at least one member'
      });
    }

    // ✅ Safe date handling
    let dateObj = new Date();
    if (date && !isNaN(Date.parse(date))) {
      dateObj = new Date(date);
    }

    // ✅ Build seva docs
    const docs = targets
      .filter(uid => Types.ObjectId.isValid(uid)) // only valid IDs
      .map(uid => ({
        user: new Types.ObjectId(uid),
        date: dateObj,
        type: type || 'general',
        timeSlot: timeSlot || '',
        note: note || '',
        status: 'assigned',
        createdBy: req.user._id,
        createdAt: new Date()
      }));

    console.log("Seva docs to insert:", docs);

    await Seva.insertMany(docs);

    res.redirect('/admin/seva');
  } catch (err) {
    console.error('admin/seva POST error', err);
    res.render('error', { user: req.user, message: 'Error assigning seva' });
  }
});


/* ---------------- Payment requests & rent handling ---------------- */

// Admin view of payment requests
router.get('/payments', ensureAdmin, async (req, res) => {
  try {
    const requests = await PaymentRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.render('admin/payments', { user: req.user, requests });
  } catch (err) {
    console.error('admin/payments GET error', err);
    res.render('error', { user: req.user, message: 'Unable to load payment requests' });
  }
});

// Approve a payment request
router.post('/payments/:id/approve', ensureAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const pr = await PaymentRequest.findById(id);
    if (!pr) return res.render('error', { user: req.user, message: 'Payment not found' });
    if (pr.status !== 'pending') return res.redirect('/admin/payments');

    // ensure Rent doc exists for the user+semester
    const semesterKey = pr.semester;
    const rentDoc = await Rent.findOneAndUpdate(
      { user: pr.user, semester: semesterKey },
      { $setOnInsert: { semesterTotal: 30000 }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    // update paid amount
    rentDoc.paidAmount = (rentDoc.paidAmount || 0) + pr.amount;
    await rentDoc.save();

    // mark payment as approved
    pr.status = 'approved';
    pr.processedAt = new Date();
    pr.processedBy = req.user._id;
    await pr.save();

    // optionally you can send notification here

    res.redirect('/admin/payments');
  } catch (err) {
    console.error('approve payment error', err);
    res.render('error', { user: req.user, message: 'Error approving payment' });
  }
});

// Reject a payment request
router.post('/payments/:id/reject', ensureAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const pr = await PaymentRequest.findById(id);
    if (!pr) return res.render('error', { user: req.user, message: 'Payment not found' });

    pr.status = 'rejected';
    pr.processedAt = new Date();
    pr.processedBy = req.user._id;
    await pr.save();

    res.redirect('/admin/payments');
  } catch (err) {
    console.error('reject payment error', err);
    res.render('error', { user: req.user, message: 'Error rejecting payment' });
  }
});

// Admin view/manage rent summary
router.get('/rent', ensureAdmin, async (req, res) => {
  try {
    const rents = await Rent.find().populate('user', 'name email').sort({ updatedAt: -1 });
    res.render('admin/rent', { user: req.user, rents });
  } catch (err) {
    console.error('admin/rent GET error', err);
    res.render('error', { user: req.user, message: 'Unable to load rent data' });
  }
});

// Admin update rent (manual adjust)
router.post('/rent/update', ensureAdmin, async (req, res) => {
  try {
    const { userId, semester, semesterTotal, paidAmount } = req.body;
    if (!userId || !semester) return res.redirect('/admin/rent');

    await Rent.findOneAndUpdate(
      { user: userId, semester },
      { semesterTotal: parseFloat(semesterTotal) || 30000, paidAmount: parseFloat(paidAmount) || 0, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.redirect('/admin/rent');
  } catch (err) {
    console.error('admin/rent POST error', err);
    res.render('error', { user: req.user, message: 'Error updating rent' });
  }
});

module.exports = router;
