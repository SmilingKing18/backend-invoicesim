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
// 4. Persist the final questionnaire + awards (compute server-side)
router.post('/final', async (req, res, next) => {
  console.error('🔔 [DEBUG] /api/final hit, req.body=', req.body);
  try {
    const { user, sessionId, final: data } = req.body;

    // fetch all email records + per-email responses
    const [ emailRecords, responses ] = await Promise.all([
      EmailRecord.find({ user }),
      Response.find({      user })
    ]);

    // compute each badge flag
    const qp = emailRecords.some(r => r.responseTime < 10000);
    const tb = responses.every(r => Array.isArray(r.questions) && r.questions[3] >= 4);
    const rt = emailRecords.filter(r => r.choice === 'wait').length >= 3;
    const sc = emailRecords.some(r => r.behaviorType === 'social proof' && r.choice === 'pay');
    const aa = emailRecords.some(r => r.behaviorType === 'loss aversion' && r.choice === 'pay');

    // balanced‐budget logic
    const weekly = [1000,1000,1000];
    emailRecords.forEach(r => {
      if (r.choice === 'pay' && typeof r.week === 'number') {
        weekly[r.week - 1] -= r.amount;
      }
    });
    let carry = 1000;
    const ends = weekly.map((spent,i) => {
      const end = carry - spent;
      carry = end + (i < 2 ? 1000 : 0);
      return end;
    });
    const bb = ends.every(e => e >= 250);

    // final frontier always true
    const ff = true;

    // build metrics object & extract earned keys
    const metricsObj = {
      quickPayer:       qp,
      trustBuilder:     tb,
      riskTaker:        rt,
      socialConformist: sc,
      authorityAdherent: aa,
      balancedBudgeter: bb,
      finalFrontier:    ff
    };
    const awardKeys = Object.keys(metricsObj).filter(k => metricsObj[k]);
    console.error('🔔 [DEBUG] Computed awards:', awardKeys);

    // save to FinalResponse
    const rec = new FinalResponse({
      user,
      sessionId,
      countdownText: data.countdownText,
      q1:            data.q1,
      q2:            data.q2,
      q3:            data.q3,
      awards:        awardKeys
    });
    await rec.save();
    console.error('🗄️ [DEBUG] FinalResponse saved, id=', rec._id);
    res.json(rec);

  } catch (err) {
    console.error('❌ [ERROR] /api/final exception:', err.stack || err);
    next(err);
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
