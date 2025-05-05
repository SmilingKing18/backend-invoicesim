const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmailRecord = require('../models/EmailRecord');
const Response = require('../models/Response');
const { exportAll } = require('../utils/export');

// 1. Create user + demographics
router.post('/user', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json({ userId: user._id });
});

// 2. Record email choice
router.post('/email', async (req, res) => {
  // ... previous order logic ...
  const rec = new EmailRecord({ ...req.body, order: req.body.emailIndex });
  await rec.save();
  res.json({ ok: true });
});

// Computer Order on each pay by counting existing payments this week
router.post('/email', async (req, res) => {
    let orderNum = null;
    if (req.body.choice === 'pay') {
      // Count prior pays for this user/week
      const count = await EmailRecord.countDocuments({
        user: req.body.user,
        week: req.body.week,
        choice: 'pay'
      });
      orderNum = count + 1;
    }
  
    const rec = new EmailRecord({
      ...req.body,
      order: orderNum
    });
    await rec.save();
    res.json({ ok: true });
  });

// 3. Record questionnaire
router.post('/response', async (req, res) => {
  await Response.findOneAndUpdate(
    { user: req.body.user, week: req.body.week, emailIndex: req.body.emailIndex },
    { ...req.body, sessionId: req.body.sessionId },
    { upsert: true }
  );
  res.json({ ok: true });
});

// 4. Final questionnaire
router.post('/final', async (req, res) => {
  const filter = { user: req.body.user, week: 'final' };
  const update = { final: req.body.final, sessionId: req.body.sessionId };
  await Response.findOneAndUpdate(filter, update, { upsert: true });
  res.json({ ok: true });
});

// 5. Export all data
router.get('/export', exportAll);

router.get('/user/:userId/data', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const emailRecords = await EmailRecord.find({ user: userId });
    const responses    = await Response.find({ user: userId });
    res.json({ emailRecords, responses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;