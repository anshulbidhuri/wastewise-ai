// ============================================================
// WasteWise AI — Express Backend Server
// Secure API proxy to Groq LLM
// ============================================================
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fetch      = require('node-fetch');
const rateLimit  = require('express-rate-limit');
const { processWithAgents, getDashboardData } = require('./src/agents');

const app  = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('⚠️  GROQ_API_KEY not found in environment variables. Please set it in .env file.');
  process.exit(1);
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting — 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});
app.use('/api', limiter);

// ── Input validation ──────────────────────────────────────────
function validateMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  if (msg.trim().length === 0) return false;
  if (msg.length > 2000) return false;
  return true;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-20) // Keep last 20 messages for context
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
}

// ── POST /api/chat ────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!validateMessage(message)) {
      return res.status(400).json({ error: 'Invalid message. Message must be 1–2000 characters.' });
    }

    const cleanHistory = sanitizeHistory(history);
    const { systemPrompt, intent, lang, statusMessage, agentName } = processWithAgents(message, cleanHistory);

    // Build Groq messages payload
    const messages = [
      { role: 'system', content: systemPrompt },
      ...cleanHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API (server-side only — API key never sent to frontend)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errText);
      return res.status(502).json({
        error: 'The AI service is currently unavailable. Please try again in a moment.',
        fallback: true
      });
    }

    const data = await groqResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

    return res.json({
      message: aiMessage,
      intent,
      lang,
      agentName,
      statusMessage,
      usage: data.usage
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({
      error: 'An internal error occurred. Please try again.',
      fallback: true
    });
  }
});

// ── GET /api/dashboard ────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  try {
    const data = getDashboardData();
    res.json({ ...data, note: 'DEMO DATA — Simulated for hackathon demonstration only.' });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Could not load dashboard data.' });
  }
});

// ── GET /api/health ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WasteWise AI', timestamp: new Date().toISOString() });
});

// ── Serve frontend ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║        WasteWise AI — Server Running             ║
║  URL:  http://localhost:${PORT}                    ║
║  Mode: ${process.env.NODE_ENV || 'development'}                        ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
