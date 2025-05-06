const express       = require('express');
const router        = express.Router();
const User          = require('../models/User');
const EmailRecord   = require('../models/EmailRecord');
const Response      = require('../models/Response');
const FinalResponse = require('../models/FinalResponse');
const { exportAll } = require('../utils/export');

// 1. Create user + demographics
router.post('/user', async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ userId: user._id });
  } catch (err) {
    next(err);
  }
});

// 2. Record email choice (with orderNum logic)
router.post('/email', async (req, res, next) => {
  try {
    let orderNum = null;
    if (req.body.choice === 'pay') {
      const count = await EmailRecord.countDocuments({
        user:   req.body.user,
        week:   req.body.week,
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
  } catch (err) {
    next(err);
  }
});

// 3. Record per-email questionnaire
router.post('/response', async (req, res, next) => {
  try {
    await Response.findOneAndUpdate(
      { user: req.body.user, week: req.body.week, emailIndex: req.body.emailIndex },
      { ...req.body, sessionId: req.body.sessionId },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// 4. Persist the final questionnaire + awards
// routes/api.js
router.post('/final', async (req, res, next) => {
  console.error('🔔 [DEBUG] /api/final hit, req.body=', req.body);
  try {
    const { user, sessionId, final: data, awards } = req.body;
    console.error('🔔 [DEBUG] Parsed final data:', data, 'awards:', awards);

    const rec = new FinalResponse({
      user,
      sessionId,
      countdownText: data.countdownText,
      q1:            data.q1,
      q2:            data.q2,
      q3:            data.q3,
      awards
    });
    await rec.save();
    console.error('🗄️ [DEBUG] FinalResponse saved, id=', rec._id);
    return res.json(rec);
  } catch (err) {
    console.error('❌ [ERROR] /api/final exception:', err);
    return next(err);
  }
});


// 5. Fetch all user data (emails, per-email responses, final)
router.get('/user/:userId/data', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const [emailRecords, responses, finalResponses] = await Promise.all([
      EmailRecord.find({   user: userId }),
      Response.find({      user: userId }),
      FinalResponse.find({ user: userId })
    ]);
    res.json({ emailRecords, responses, finalResponses });
  } catch (err) {
    next(err);
  }
});

// 6. Export all data
router.get('/export', exportAll);

module.exports = router;
