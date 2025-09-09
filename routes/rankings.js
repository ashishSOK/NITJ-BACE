const express = require('express');
const Sadhana = require('../models/Sadhana');
const Seva = require('../models/Seva');
const User = require('../models/User');

const router = express.Router();

// Middleware: ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect('/login');
};

/**
 * GET /
 * Render weekly rankings.
 */
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // --- Compute week start (Sunday at 00:00:00 local time) ---
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    // move back to Sunday of this week: getDay() returns 0..6 (0 = Sunday)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // --- Aggregate BG study hours per user since weekStart ---
    const sadhanaAgg = await Sadhana.aggregate([
      { $match: { date: { $gte: weekStart } } },
      { $group: { _id: '$user', totalHours: { $sum: '$bgStudyHours' } } },
    ]);

    // --- Aggregate completed sevas per user since weekStart ---
    const sevasAgg = await Seva.aggregate([
      { $match: { date: { $gte: weekStart }, status: 'completed' } },
      { $group: { _id: '$user', completed: { $sum: 1 } } },
    ]);

    // --- Convert aggregates to maps keyed by userId string for O(1) lookup ---
    const sadhanaMap = new Map(sadhanaAgg.map(s => [s._id.toString(), Number(s.totalHours || 0)]));
    const sevasMap = new Map(sevasAgg.map(s => [s._id.toString(), Number(s.completed || 0)]));

    // --- Build union of user IDs that appear in either aggregate ---
    const userIdSet = new Set([
      ...Array.from(sadhanaMap.keys()),
      ...Array.from(sevasMap.keys()),
    ]);
    const userIds = Array.from(userIdSet);

    // If no data, render early with empty rankings
    if (userIds.length === 0) {
      return res.render('rankings', { user: req.user, rankings: [] });
    }

    // --- Fetch user names in one DB call ---
    const users = await User.find({ _id: { $in: userIds } }).select('name').lean();
    const userNameMap = new Map(users.map(u => [u._id.toString(), u.name || 'Unknown']));

    // --- Build rankings array ---
    const rankings = userIds.map(uid => {
      const bgHours = Number(sadhanaMap.get(uid) || 0);
      const sevas = Number(sevasMap.get(uid) || 0);
      // scoring formula: 2 points per bg hour + 1 point per seva
      const score = bgHours * 2 + sevas;
      return {
        userId: uid,
        name: userNameMap.get(uid) || 'Unknown',
        score,
        bgHours,
        sevas,
      };
    });

    // --- Sort rankings: primary by score desc, secondary by bgHours desc, tertiary by name ---
    rankings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.bgHours !== a.bgHours) return b.bgHours - a.bgHours;
      // stable alphabetical tie-breaker
      return String(a.name).localeCompare(String(b.name));
    });

    // Render the EJS template
    res.render('rankings', { user: req.user, rankings });
  } catch (err) {
    console.error('Rankings error:', err);
    // Optionally show a friendly message; keep user context for navbar, etc.
    res.status(500).render('error', { user: req.user, message: 'Error fetching rankings' });
  }
});

module.exports = router;
