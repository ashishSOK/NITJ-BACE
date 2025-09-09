const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { user: req.user, error: null });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: false,
  failureMessage: 'Invalid credentials',
}));

router.get('/register', (req, res) => {
  res.render('register', { user: req.user, error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { user: req.user, error: 'User already exists' });
    }
    const user = new User({ name, email, password });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.render('error', { user: req.user, message: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.render('error', { user: null, message: 'Logout error' });
    res.redirect('/');
  });
});

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// router.get('/dashboard', (req, res) => {
//   if (!req.user) return res.redirect('/login');
//   res.render('dashboard', { user: req.user, sadhana: [], seva: [], rent: {} });
// });

module.exports = router;