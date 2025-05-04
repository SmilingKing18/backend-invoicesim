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
  const rec = new EmailRecord(req.body);
  await rec.save();
  res.json({ ok: true });
});

// 3. Record questionnaire
router.post('/response', async (req, res) => {
  const resp = await Response.findOne({ user: req.body.user, week: req.body.week, emailIndex: req.body.emailIndex });
  if (resp) {
    // update questions
    resp.questions = req.body.questions;
    await resp.save();
  } else {
    const newResp = new Response(req.body);
    await newResp.save();
  }
  res.json({ ok: true });
});

// 4. Final questionnaire
router.post('/final', async (req, res) => {
  const resp = await Response.findOne({ user: req.body.user, week: 'final' });
  if (resp) {
    resp.final = req.body.final;
    await resp.save();
  } else {
    const newFinal = new Response({ user: req.body.user, week: 'final', final: req.body.final });
    await newFinal.save();
  }
  res.json({ ok: true });
});

// 5. Export all data
router.get('/export', exportAll);

module.exports = router;