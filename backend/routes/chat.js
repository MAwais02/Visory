const express = require('express');
const rateLimit = require('express-rate-limit');
const { answerGeneralDoubt } = require('../utils/aiService');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: { error: 'Chat limit reached. Please try again later.' },
});

// ─── POST /api/chat ── General chatbot (Gemini) ───────────────────────────────
router.post('/', chatLimiter, async (req, res, next) => {
  try {
    const { message, messages } = req.body || {};
    const userMessage = String(message || '').trim();
    const history = Array.isArray(messages) ? messages : [];
    const combined = userMessage ? [...history, { role: 'user', content: userMessage }] : history;

    if (!userMessage && combined.length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const answer = await answerGeneralDoubt({ messages: combined });
    res.json({ answer });
  } catch (err) { next(err); }
});

module.exports = router;

