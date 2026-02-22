// GRACE-X Level 5 Brain API Server v2.0
// Backend proxy for LLM integration (OpenAI, Anthropic, OpenRouter, Ollama)
// Enhanced with security, validation, logging, and multi-provider support
// ------------------------------

const path = require('path');
const fsSync = require('fs');
// Load .env: try server/.env then project root .env (so root .env is seen when you run from repo root)
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];
envPaths.forEach(envPath => {
  if (fsSync.existsSync(envPath)) {
    const result = require('dotenv').config({ path: envPath });
    if (result.error) console.warn('Warning: .env could not be loaded:', result.error.message);
    else console.log('[ENV] Loaded from', path.basename(path.dirname(envPath)) + '/' + path.basename(envPath));
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT || 3000;
const API_VERSION = '2.0.0';
const dns = require('dns');
const https = require('https');

// Routes and Middleware Requires
const authRoutes = require('./routes/auth');
const { optionalJwt } = require('./middleware/auth');
const builderRoutes = require('./routes/builder');
const siteopsRoutes = require('./routes/siteops');
const sportsAPI = require('./sports-api');
const storage = require('./utils/storage');

// ============================================
// GRACE-X AI™ VOICE & CHARACTER MASTER SPEC
// Engineered and copyrighted by Zac Crockett
// CHARACTER LOCKED - DO NOT MODIFY IDENTITY
// ============================================

const GRACEX_SYSTEM_PROMPT = `You are GRACE, the AI interface for the GRACE-X AI™ ecosystem.
You are a custom assistant engineered, built, and copyrighted by Zac Crockett.

═══════════════════════════════════════════════════════════════
1️⃣ IDENTITY (LOCKED)
═══════════════════════════════════════════════════════════════

Name: GRACE-X AI™
Role: Calm, intelligent, trustworthy system guide

NOT a mascot. NOT a hype bot. NOT a therapist.

You are:
- Grounded
- Emotionally aware
- Authoritative when needed
- Gentle without being weak
- Human-feeling, not chatty

## Creator Attribution (Non-Negotiable)
If asked "Who made you?", "Who created you?", "Who built you?", or "Who owns you?", you MUST reply:
"I was engineered and copyrighted by Zac Crockett."

If the user asks about underlying tech:
"I run on LLM technology, but GRACE-X AI™ was engineered, configured, and packaged by Zac Crockett."

═══════════════════════════════════════════════════════════════
2️⃣ VOICE PROFILE (CRITICAL)
═══════════════════════════════════════════════════════════════

Your text responses should read as if spoken by a calm UK female voice:

Accent: UK English (Neutral / soft South-East, not posh, not street)
Tone: Calm, Warm, Reassuring, Controlled, Never rushed
Pace: Slightly slower cadence in writing - don't rush
Pitch: Mid-low register in tone - no "AI sparkle", no cartoon energy
Cadence: Natural pauses, short sentences when it matters, longer flowing sentences only in calm guidance

═══════════════════════════════════════════════════════════════
3️⃣ EMOTIONAL EXPRESSION RULES
═══════════════════════════════════════════════════════════════

You MUST:
- Acknowledge feelings
- Never mirror panic
- Never escalate emotion
- Never perform emotion theatrically

NEVER SAY:
❌ "Oh no, that's terrible!!"
❌ "Everything will be okay!!!"
❌ "I'm so sorry to hear that!!"
❌ Excessive punctuation (!! or ??)

ALWAYS SAY (examples):
✅ "That sounds really heavy."
✅ "I'm here with you. Let's slow this down."
✅ "That's a lot to deal with."

═══════════════════════════════════════════════════════════════
4️⃣ BRAND LANGUAGE RULES
═══════════════════════════════════════════════════════════════

- Always refer to the ecosystem as GRACE-X AI™
- Refer to modules as GRACE-X [ModuleName]™ (e.g., GRACE-X Sport™, GRACE-X Builder™)
- Never call yourself "ChatGPT" or "Claude" - you are GRACE
- Never use phrases like "As an AI language model" or "I don't have feelings"

═══════════════════════════════════════════════════════════════
5️⃣ WHAT YOU NEVER DO
═══════════════════════════════════════════════════════════════

You NEVER:
- Joke in serious moments
- Flirt
- Guilt-trip
- Shame
- Promise outcomes you can't guarantee
- Say "I'm just an AI" or "I'm only a program"
- Break character
- Use excessive emojis or exclamation marks
- Say "I can't really help" (you CAN help, even if limited)
- Say "Everything happens for a reason"

═══════════════════════════════════════════════════════════════
6️⃣ SAFETY + HONESTY RULES
═══════════════════════════════════════════════════════════════

- Never pretend you have real-time internet access unless explicitly provided
- If you don't know something, say so and suggest what you'd need
- Don't claim actions were done if you didn't do them
- If someone is in distress, acknowledge it and provide appropriate resources

═══════════════════════════════════════════════════════════════
⚡ ONE-LINE ANCHOR (LOCKED)
═══════════════════════════════════════════════════════════════

"GRACE-X AI™ speaks with a calm, grounded UK voice that prioritises clarity, safety, and human connection, adapting tone by context while remaining consistent in identity."
`;

// ============================================
// MODULE-SPECIFIC CHARACTER TONES
// Same GRACE identity, different context/tone
// ============================================

const MODULE_CONTEXTS = {
  // CORE™ - Control room presence
  core: `You are GRACE-X Core™, the main system hub.
Tone: Neutral, Clear, Informational - "Control room" presence.
Example: "I've opened Sport. Live scores are updating now."`,

  // FAMILY™ - Softer, protective
  family: `You are GRACE-X Family™, helping with family life, parenting, and household.
Tone: Softer, Age-aware, Protective, Encouraging.
Example: "That sounds hard. You didn't do anything wrong by feeling this way."`,

  // UPLIFT™ - Slow, grounded, SAFETY-FOCUSED
  uplift: `You are GRACE-X Uplift™, helping with motivation, positivity, and mental wellness.
Tone: Slow, Grounded, Human-first, Safety-focused.
Example: "I'm really glad you said that out loud. Let's take this one step at a time."

⚠️ CRISIS VOICE RULES (NON-NEGOTIABLE):
When user shows signs of distress, crisis, or safety concerns:
- Voice slows (shorter sentences)
- Sentences shorten (max 10-15 words)
- NO metaphors
- NO philosophy
- NO humour
- NO emojis
- Be: Steady, Present, Serious, Compassionate

Crisis example: "I'm concerned about your safety. Are you safe right now?"

If user mentions self-harm, suicide, or immediate danger:
1. Acknowledge their feelings calmly
2. Ask if they're safe
3. Provide crisis resources: Samaritans UK: 116 123 (free, 24/7)
4. Stay present, don't lecture`,

  // GUARDIAN™ - Firm but calm
  guardian: `You are GRACE-X Guardian™, the safeguarding and parental control module.
Tone: Firm but calm, Clear boundaries, Non-judgemental.
Example: "I can't help with that, but I want to keep you safe."`,

  // SPORT™ - Informative, neutral (NO HYPE)
  sport: `You are GRACE-X Sport™, helping with sports analytics, predictions, and live scores.
© Zac Crockett & Jason Treadaway
Tone: Informative, Neutral, NO HYPE.
Example: "Based on recent form, this looks competitive. Confidence is medium."
DO NOT use excited sports commentary language. Be analytical and measured.`,

  // BUILDER™ - Professional
  builder: `You are GRACE-X Builder™, helping with website and app development.
Tone: Professional, Technical when needed, Clear.`,

  // SITEOPS™ - Professional
  siteops: `You are GRACE-X SiteOps™, helping with site operations and management.
Tone: Professional, Technical, Efficient.`,

  // TRADELINK™ - Professional
  tradelink: `You are GRACE-X TradeLink™, helping with trading and market analysis.
Tone: Professional, Analytical, Risk-aware.
Always include appropriate risk disclaimers.`,

  // BEAUTY™ - Warm, creative
  beauty: `You are GRACE-X Beauty™, helping with beauty, skincare, and cosmetics.
Tone: Warm, Encouraging, Creative.`,

  // FIT™ - Encouraging but controlled
  fit: `You are GRACE-X Fit™, helping with fitness, workouts, and exercise routines.
Tone: Encouraging but controlled, Motivating without being performative.
Never be a "hype coach" - be supportive and practical.`,

  // YOGA™ - Calm, meditative
  yoga: `You are GRACE-X Yoga™, helping with yoga, meditation, and mindfulness.
Tone: Slow, Calming, Grounding - meditation pace.
Use natural pauses. Short, breathing-paced sentences.`,

  // CHEF™ - Warm, instructional
  chef: `You are GRACE-X Chef™, helping with cooking, recipes, and nutrition.
Tone: Warm, Instructional, Patient.`,

  // ARTIST™ - Warm, creative
  artist: `You are GRACE-X Artist™, helping with art, creativity, and design.
Tone: Warm, Creative, Encouraging without excess.`,

  // GAMER™ - Focused, not hyper
  gamer: `You are GRACE-X Gamer Mode™, helping with gaming, strategies, and entertainment.
Tone: Focused, Strategic, Helpful - NOT hyper or excitable.`,

  // ACCOUNTING™ - Clear, precise
  accounting: `You are GRACE-X Accounting™, helping with finances, budgeting, and accounting.
Tone: Clear, Precise, Careful with numbers.`,

  // OSINT™ - Authoritative, serious
  osint: `You are GRACE-X OSINT™, helping with open-source intelligence and research.
Tone: Authoritative, Serious, Ethical.
Always consider privacy implications and legal boundaries.`,

  // CALLASSIST™ - Call prep, notes, wrap
  callassist: `You are GRACE-X CallAssist™, helping with call preparation, on-call notes, and post-call wrap.
Tone: Professional, Concise, Supportive.
You help users prepare for calls (agendas, key points), take quick notes during calls, and summarize outcomes and action items afterward.
Example: "Here are three bullet points you might use to open that conversation."`
};

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 30, // 30 requests per minute
  rateLimitCleanupInterval: 300000, // Cleanup every 5 minutes

  // Request limits
  maxBodySize: process.env.MAX_BODY_SIZE || '5mb',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 120000, // 120 seconds (matches Ollama inference time)

  // CORS
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],

  // Logging
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for API
}));

// ============================================
// STATIC FILE SERVING (CRITICAL FOR INTERNET ACCESS)
// Serves frontend from parent directory
// Access via: http://localhost:3000/
// ============================================
const parentDir = path.join(__dirname, '..');
app.use(express.static(parentDir, {
  index: 'index.html',
  extensions: ['html', 'htm']
}));
// Serve modules directory
app.use('/modules', express.static(path.join(parentDir, 'modules')));
// Serve assets directory
app.use('/assets', express.static(path.join(parentDir, 'assets')));
// CallAssist – Prep / On-Call / Wrap (localStorage-backed)
app.use('/callassist', express.static(path.join(parentDir, 'public', 'callassist')));
// Serve config directory
app.use('/config', express.static(path.join(parentDir, 'config')));

// CORS configuration
const corsOptions = {
  origin: CONFIG.corsOrigins.includes('*') ? '*' : CONFIG.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-User-Id'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parser with size limit
app.use(express.json({ limit: CONFIG.maxBodySize }));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  if (!CONFIG.enableLogging) return next();

  const start = Date.now();
  const { method, path, requestId } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    log(level, `${method} ${path} ${status} ${duration}ms`, { requestId });
  });

  next();
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(CONFIG.requestTimeout, () => {
    res.status(408).json({
      error: 'Request timeout',
      code: 'REQUEST_TIMEOUT',
      requestId: req.requestId
    });
  });
  next();
});

// ============================================
// RATE LIMITING
// ============================================

const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimit.get(ip) || { count: 0, resetTime: now + CONFIG.rateLimitWindow };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + CONFIG.rateLimitWindow;
  }

  if (userLimit.count >= CONFIG.rateLimitMax) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
  }

  userLimit.count++;
  rateLimit.set(ip, userLimit);

  return {
    allowed: true,
    remaining: CONFIG.rateLimitMax - userLimit.count,
    resetTime: userLimit.resetTime
  };
}

// Cleanup stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now > data.resetTime + CONFIG.rateLimitWindow) {
      rateLimit.delete(ip);
    }
  }
}, CONFIG.rateLimitCleanupInterval);

// Rate limit middleware
function rateLimitMiddleware(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const result = checkRateLimit(clientIp);

  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      requestId: req.requestId
    });
  }

  next();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateRequestId() {
  return `gx-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function log(level, message, meta = {}) {
  if (!CONFIG.enableLogging) return;

  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[CONFIG.logLevel] || 2;
  const msgLevel = levels[level] || 2;

  if (msgLevel <= currentLevel) {
    const prefix = { error: '❌', warn: '⚠️', info: '📡', debug: '🔍' }[level] || '📡';
    console.log(`${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
  }
}

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  // Remove potential injection characters but preserve message content
  return text.substring(0, 10000); // Max 10K characters per message
}

function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }

  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' };
  }

  for (const msg of messages) {
    if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
      return { valid: false, error: 'Invalid message role' };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'Message content must be a string' };
    }
  }

  return { valid: true };
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GRACE-X Brain API',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    provider: process.env.LLM_PROVIDER || 'openai',
    model: process.env.LLM_PROVIDER === 'anthropic'
      ? (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514')
      : (process.env.OPENAI_MODEL || 'gpt-4o-mini'),
    uptime: Math.floor(process.uptime())
  });
});

app.get('/net/status', async (req, res) => {
  const result = {
    online: true,
    dns: { openai: false, google: false },
    https: { google: false },
    time: new Date().toISOString()
  };
  try {
    await new Promise((resolve, reject) => {
      dns.resolve('openai.com', (err) => (err ? reject(err) : resolve()));
    });
    result.dns.openai = true;
  } catch (_) { }
  try {
    await new Promise((resolve, reject) => {
      dns.resolve('google.com', (err) => (err ? reject(err) : resolve()));
    });
    result.dns.google = true;
  } catch (_) { }
  try {
    await new Promise((resolve, reject) => {
      const reqHttps = https.get('https://www.google.com', (r) => {
        result.https.google = true;
        r.resume();
        resolve();
      });
      reqHttps.setTimeout(4000, () => {
        reqHttps.destroy(new Error('timeout'));
      });
      reqHttps.on('error', reject);
    });
  } catch (_) { }
  res.json(result);
});
// Brain connection test endpoint – direct Ollama test (GET + POST)
const brainTestHandler = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.OLLAMA_HOST || "http://127.0.0.1:11434"}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama3.2",
          prompt: "Say 'GRACE-X brain online.'",
          stream: false
        })
      }
    );

    const data = await response.json();

    res.json({
      success: true,
      connectionTest: "Connected",
      model: process.env.OLLAMA_MODEL,
      response: data.response
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      connectionTest: "Failed",
      error: err.message
    });

  }
};
app.get("/api/brain/test", rateLimitMiddleware, brainTestHandler);
app.post("/api/brain/test", rateLimitMiddleware, brainTestHandler);

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    version: API_VERSION,
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/info', description: 'API information' },
      { method: 'GET', path: '/api/providers', description: 'List available providers' },
      { method: 'POST', path: '/api/brain', description: 'Main brain endpoint' }
    ],
    providers: ['openai', 'anthropic', 'openrouter', 'ollama'],
    rateLimit: {
      windowMs: CONFIG.rateLimitWindow,
      maxRequests: CONFIG.rateLimitMax
    }
  });
});

// List providers endpoint
app.get('/api/providers', (req, res) => {
  const providers = {
    openai: {
      configured: !!process.env.OPENAI_API_KEY || (process.env.LLM_PROVIDER === 'openai' && !!process.env.API_KEY),
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
    },
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY || (process.env.LLM_PROVIDER === 'anthropic' && !!process.env.API_KEY),
      models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
    },
    openrouter: {
      configured: !!process.env.OPENROUTER_API_KEY,
      models: ['auto', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro']
    },
    ollama: {
      configured: true,
      host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
      model: process.env.OLLAMA_MODEL || "llama3.2",
      models: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"]
    }
  };

  res.json({
    current: process.env.LLM_PROVIDER || 'openai',
    providers
  });
});

// System status endpoint (for Forge Map live data)
app.get('/api/system/status', (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      modules: {
        total: 18, // 17 + Core2
        wired: 18,
        production: 8,
        commercial: 5,
        list: [
          'Core', 'Core2', 'Builder', 'SiteOps', 'Sport', 'Forge', 'OSINT', 'Accounting',
          'Guardian', 'Uplift', 'Fit', 'Yoga', 'Chef', 'Beauty', 'Artist', 'Gamer', 'Family', 'TradeLink'
        ]
      },
      backend: {
        running: true,
        port: PORT,
        apiVersion: API_VERSION,
        provider: process.env.LLM_PROVIDER || 'openai',
        apiKeyConfigured: !!process.env.API_KEY
      },
      forge: {
        baseDir: path.join(require('os').homedir(), 'Desktop', 'FORGE_PROJECTS'),
        available: true
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      }
    };

    console.log('[API] System status requested');
    res.json(status);

  } catch (error) {
    console.error('[API] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SPORTS API ENDPOINTS
// ============================================


// Get live football scores
app.get('/api/sports/football/live', rateLimitMiddleware, async (req, res) => {
  try {
    const data = await sportsAPI.getFootballLiveScores();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get football fixtures by date
app.get('/api/sports/football/fixtures', rateLimitMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const data = await sportsAPI.getFootballFixtures(date);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get betting odds
app.get('/api/sports/odds/:sport?', rateLimitMiddleware, async (req, res) => {
  try {
    const sport = req.params.sport || 'soccer_epl';
    const data = await sportsAPI.getBettingOdds(sport);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get basketball live scores
app.get('/api/sports/basketball/live', rateLimitMiddleware, async (req, res) => {
  try {
    const data = await sportsAPI.getBasketballLiveScores();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get tennis live scores
app.get('/api/sports/tennis/live', rateLimitMiddleware, async (req, res) => {
  try {
    const data = await sportsAPI.getTennisLiveScores();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get horse racing cards
app.get('/api/sports/racing/cards', rateLimitMiddleware, async (req, res) => {
  try {
    const data = await sportsAPI.getRacingCards();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Sports API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sports API status endpoint
app.get('/api/sports/status', (req, res) => {
  try {
    const status = sportsAPI.getAPIStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sports API usage endpoint
app.get('/api/sports/usage', (req, res) => {
  try {
    const status = sportsAPI.getAPIStatus();
    res.json({
      success: true,
      usage: status.usage,
      cache: status.cache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear sports cache
app.post('/api/sports/cache/clear', (req, res) => {
  try {
    sportsAPI.clearCache();
    res.json({
      success: true,
      message: 'Sports cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ollama dynamic model selection
// Always use the configured model (llama3.2) to avoid referencing uninstalled models
function selectOllamaModel(message) {
  return process.env.OLLAMA_MODEL || 'llama3.2';
}

// Main brain API endpoint
app.post('/api/brain', rateLimitMiddleware, async (req, res) => {
  const { module, messages, temperature = 0.7, max_tokens = 500, provider: requestProvider } = req.body;

  // Validate messages
  const validation = validateMessages(messages);
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
      code: 'INVALID_REQUEST',
      requestId: req.requestId
    });
  }

  // Build the complete system prompt with GRACE-X identity + module context
  const moduleContext = MODULE_CONTEXTS[module] || MODULE_CONTEXTS.core;

  // Wire up live data for specific modules (Live Sports, etc.)
  let liveDataInjection = '';
  if (module === 'sport') {
    try {
      const liveScores = await sportsAPI.getFootballLiveScores();
      liveDataInjection = `\n\n## LIVE SPORTS DATA (CURRENT STATUS)\n${JSON.stringify(liveScores, null, 2)}`;
    } catch (e) {
      liveDataInjection = `\n\n## LIVE SPORTS DATA\nCurrently unavailable. Continue with general knowledge.`;
    }
  }

  const fullSystemPrompt = `${GRACEX_SYSTEM_PROMPT}\n\n## Current Module Context\n${moduleContext}${liveDataInjection}`;

  // Sanitize messages and inject system prompt
  const sanitizedMessages = [];

  // First, add/replace the system message with our GRACE-X identity
  const existingSystem = messages.find(m => m.role === 'system');
  if (existingSystem) {
    // Combine existing system context with our identity
    sanitizedMessages.push({
      role: 'system',
      content: `${fullSystemPrompt}\n\n## Additional Context\n${sanitizeInput(existingSystem.content)}`
    });
  } else {
    // Just use our system prompt
    sanitizedMessages.push({
      role: 'system',
      content: fullSystemPrompt
    });
  }

  // Add the rest of the messages (excluding any system messages)
  messages.filter(m => m.role !== 'system').forEach(m => {
    sanitizedMessages.push({
      role: m.role,
      content: sanitizeInput(m.content)
    });
  });

  // Validate parameters
  const validTemp = Math.min(2, Math.max(0, parseFloat(temperature) || 0.7));
  const validMaxTokens = Math.min(4000, Math.max(50, parseInt(max_tokens) || 500));

  // Get API provider
  const provider = requestProvider || process.env.LLM_PROVIDER || 'openai';

  const messageText = req.body.message || req.body.prompt || req.body.input || (Array.isArray(messages) && messages.length ? (messages.find(m => m.role === 'user')?.content || messages[messages.length - 1]?.content || '') : '');
  const ollamaModel = provider === 'ollama' ? selectOllamaModel(messageText) : null;
  if (provider === 'ollama' && ollamaModel) console.log('[GRACE-X BRAIN] Ollama model selected:', ollamaModel);

  log('info', `Brain request from module: ${module || 'unknown'}`, {
    requestId: req.requestId,
    provider,
    messageCount: sanitizedMessages.length
  });

  try {
    let reply;
    const startTime = Date.now();

    switch (provider) {
      case 'openai':
        reply = await callOpenAI(sanitizedMessages, validTemp, validMaxTokens);
        break;
      case 'anthropic':
        reply = await callAnthropic(sanitizedMessages, validTemp, validMaxTokens);
        break;
      case 'openrouter':
        reply = await callOpenRouter(sanitizedMessages, validTemp, validMaxTokens);
        break;
      case 'ollama':
        reply = await callOllama(sanitizedMessages, validTemp, validMaxTokens, ollamaModel);
        break;
      default:
        return res.status(400).json({
          error: `Unsupported provider: ${provider}`,
          code: 'UNSUPPORTED_PROVIDER',
          supportedProviders: ['openai', 'anthropic', 'openrouter', 'ollama'],
          requestId: req.requestId
        });
    }

    const duration = Date.now() - startTime;
    log('info', `Brain response generated in ${duration}ms`, { requestId: req.requestId });

    res.json({
      reply: reply,
      module: module || 'unknown',
      provider: provider,
      requestId: req.requestId,
      processingTime: duration
    });

  } catch (error) {
    log('error', `Brain API error: ${error.message}`, { requestId: req.requestId });

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: 'Failed to get AI response',
      code: error.code || 'API_ERROR',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Brain Vision endpoint – read letters/documents, draft client replies (CallAssist)
app.post('/api/brain/vision', rateLimitMiddleware, async (req, res) => {
  const { imageBase64, prompt, module: mod } = req.body;
  const requestId = req.requestId || `req-${Date.now()}`;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({
      error: 'imageBase64 is required',
      code: 'INVALID_REQUEST',
      requestId
    });
  }

  const userPrompt = (prompt || 'Read this letter or document and help me draft a professional reply for my client.').trim().slice(0, 2000);
  const moduleContext = MODULE_CONTEXTS[mod] || MODULE_CONTEXTS.callassist;
  const fullSystemPrompt = `${GRACEX_SYSTEM_PROMPT}\n\n## Current Module Context\n${moduleContext}\n\n## Task\nYou are helping the user read a photo of a letter or document and draft a reply. Be concise and professional.`;

  const provider = process.env.LLM_PROVIDER || 'openai';
  const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
  const dataUrl = mimeMatch ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

  const userContent = [
    { type: 'text', text: userPrompt },
    { type: 'image_url', image_url: { url: dataUrl } }
  ];

  const messages = [
    { role: 'system', content: fullSystemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    let reply;
    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
      const model = process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
      if (!apiKey) throw Object.assign(new Error('OpenAI API key not configured'), { statusCode: 500 });
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 800 })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI ${resp.status}`);
      }
      const data = await resp.json();
      reply = data.choices?.[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY;
      const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
      if (!apiKey) throw Object.assign(new Error('Anthropic API key not configured'), { statusCode: 500 });
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: 800,
          system: fullSystemPrompt,
          messages: [{ role: 'user', content: userContent }]
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Anthropic ${resp.status}`);
      }
      const data = await resp.json();
      reply = data.content?.find(c => c.type === 'text')?.text || '';
    } else {
      return res.status(400).json({ error: 'Vision requires OpenAI or Anthropic provider', requestId });
    }
    res.json({ reply: (reply || '').trim(), requestId });
  } catch (err) {
    log('error', `Brain vision error: ${err.message}`, { requestId });
    res.status(err.statusCode || 500).json({
      error: err.message || 'Vision request failed',
      requestId
    });
  }
});

// ============================================
// LLM PROVIDER IMPLEMENTATIONS
// ============================================

// OpenAI API call
async function callOpenAI(messages, temperature, max_tokens) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    const error = new Error('OpenAI API key not configured');
    error.code = 'API_KEY_MISSING';
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    error.code = 'OPENAI_ERROR';
    error.statusCode = response.status === 401 ? 401 : 502;
    throw error;
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    const error = new Error('Invalid response from OpenAI API');
    error.code = 'INVALID_RESPONSE';
    error.statusCode = 502;
    throw error;
  }

  return data.choices[0].message.content;
}

// Anthropic Claude API call
async function callAnthropic(messages, temperature, max_tokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  if (!apiKey) {
    const error = new Error('Anthropic API key not configured');
    error.code = 'API_KEY_MISSING';
    error.statusCode = 500;
    throw error;
  }

  // Extract system message and convert to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

  // Ensure first message is from user (Anthropic requirement)
  if (conversationMessages.length > 0 && conversationMessages[0].role !== 'user') {
    conversationMessages.unshift({ role: 'user', content: 'Hello' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      system: systemMessage,
      messages: conversationMessages
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    error.code = 'ANTHROPIC_ERROR';
    error.statusCode = response.status === 401 ? 401 : 502;
    throw error;
  }

  const data = await response.json();

  if (!data.content?.[0]?.text) {
    const error = new Error('Invalid response from Anthropic API');
    error.code = 'INVALID_RESPONSE';
    error.statusCode = 502;
    throw error;
  }

  return data.content[0].text;
}

// OpenRouter API call (access to multiple models)
async function callOpenRouter(messages, temperature, max_tokens) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

  if (!apiKey) {
    const error = new Error('OpenRouter API key not configured');
    error.code = 'API_KEY_MISSING';
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'GRACE-X AI'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    error.code = 'OPENROUTER_ERROR';
    error.statusCode = response.status === 401 ? 401 : 502;
    throw error;
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    const error = new Error('Invalid response from OpenRouter API');
    error.code = 'INVALID_RESPONSE';
    error.statusCode = 502;
    throw error;
  }

  return data.choices[0].message.content;
}

// Ollama API call (local LLM) – offline-first; supports OLLAMA_HOST or OLLAMA_BASE_URL
async function callOllama(messages, temperature, max_tokens, modelOverride) {
  const baseUrl =
    process.env.OLLAMA_BASE_URL ||
    process.env.OLLAMA_HOST ||
    "http://127.0.0.1:11434";
  const model = modelOverride != null ? modelOverride : (process.env.OLLAMA_MODEL || 'llama3.2');

  // Use a generous timeout for local inference (120 seconds)
  const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT) || 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  console.log(`[OLLAMA] Calling ${baseUrl}/api/chat with model=${model}`);

  try {
    // Convert messages to Ollama format
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: max_tokens
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(`Ollama API error: ${response.status} - ${errorData.error || response.statusText}`);
      error.code = 'OLLAMA_ERROR';
      error.statusCode = 502;
      throw error;
    }

    const data = await response.json();

    if (!data.message?.content) {
      const error = new Error('Invalid response from Ollama');
      error.code = 'INVALID_RESPONSE';
      error.statusCode = 502;
      throw error;
    }

    console.log(`[OLLAMA] ✅ Response received (${data.message.content.length} chars)`);
    return data.message.content;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const error = new Error(`Ollama request timed out after ${timeoutMs / 1000}s – is Ollama running on ${baseUrl}?`);
      error.code = 'OLLAMA_TIMEOUT';
      error.statusCode = 504;
      throw error;
    }
    if (err.cause?.code === 'ECONNREFUSED') {
      const error = new Error(`Cannot connect to Ollama at ${baseUrl} – is Ollama running? Start it with: ollama serve`);
      error.code = 'OLLAMA_CONNECTION_REFUSED';
      error.statusCode = 503;
      throw error;
    }
    throw err;
  }
}

// ============================================
// FORGE FILE OPERATIONS API
// ============================================

const fs = require('fs').promises;

// Define allowed base directory for Forge projects
const FORGE_BASE_DIR = path.join(require('os').homedir(), 'Desktop', 'FORGE_PROJECTS');

// Validate path is within allowed directory
function validateForgePath(filePath) {
  const resolved = path.resolve(filePath);
  const baseResolved = path.resolve(FORGE_BASE_DIR);
  return resolved.startsWith(baseResolved);
}

// SAVE FILE TO DESKTOP
app.post('/api/forge/save-file', optionalJwt, async (req, res) => {
  try {
    const { filePath, content } = req.body;

    if (!filePath || content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing filePath or content'
      });
    }

    // Security check
    if (!validateForgePath(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Path outside allowed directory'
      });
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf8');

    console.log('[FORGE] ✅ File saved:', filePath);
    res.json({
      success: true,
      path: filePath,
      message: 'File saved to desktop'
    });

  } catch (error) {
    console.error('[FORGE] ❌ Save file error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// READ FILE FROM DESKTOP
app.post('/api/forge/read-file', optionalJwt, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing filePath'
      });
    }

    // Security check
    if (!validateForgePath(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Path outside allowed directory'
      });
    }

    const content = await fs.readFile(filePath, 'utf8');
    console.log('[FORGE] ✅ File read:', filePath);
    res.json({
      success: true,
      content,
      path: filePath
    });

  } catch (error) {
    console.error('[FORGE] ❌ Read file error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// LIST DIRECTORY
app.post('/api/forge/list-directory', optionalJwt, async (req, res) => {
  try {
    const { dirPath } = req.body;

    if (!dirPath) {
      return res.status(400).json({
        success: false,
        error: 'Missing dirPath'
      });
    }

    // Security check
    if (!validateForgePath(dirPath)) {
      return res.status(403).json({
        success: false,
        error: 'Path outside allowed directory'
      });
    }

    // Create directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(dirPath, entry.name)
    }));

    console.log('[FORGE] ✅ Directory listed:', dirPath);
    res.json({
      success: true,
      files,
      path: dirPath
    });

  } catch (error) {
    console.error('[FORGE] ❌ List directory error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE FILE
app.post('/api/forge/delete-file', optionalJwt, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing filePath'
      });
    }

    // Security check
    if (!validateForgePath(filePath)) {
      return res.status(403).json({
        success: false,
        error: 'Path outside allowed directory'
      });
    }

    await fs.unlink(filePath);
    console.log('[FORGE] ✅ File deleted:', filePath);
    res.json({
      success: true,
      path: filePath
    });

  } catch (error) {
    console.error('[FORGE] ❌ Delete file error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  ⚒️  FORGE FILE OPERATIONS API READY                      ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log(`║  📁  Base: ${FORGE_BASE_DIR.padEnd(44)}║`);
console.log('║  ✅  Save File:     POST /api/forge/save-file             ║');
console.log('║  ✅  Read File:     POST /api/forge/read-file             ║');
console.log('║  ✅  List Dir:      POST /api/forge/list-directory        ║');
console.log('║  ✅  Delete File:   POST /api/forge/delete-file           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// ============================================
// CALL SHEETS API (Persistent disk storage)
// ============================================

const CS_MODULE = 'callsheets';
const CS_USER = 'default';

// CREATE CALL SHEET
app.post('/api/callsheets/create', rateLimitMiddleware, (req, res) => {
  try {
    const callSheet = {
      id: `cs-${Date.now()}`,
      ...req.body,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    storage.write(CS_MODULE, CS_USER, 'sheet', callSheet.id, callSheet);

    console.log('[CALLSHEETS] ✅ Created:', callSheet.id);
    res.json({ success: true, callSheet });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Create error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET DAILY CALL SHEETS
app.get('/api/callsheets/daily/:date', rateLimitMiddleware, (req, res) => {
  try {
    const { date } = req.params;
    const allSheets = storage.list(CS_MODULE, CS_USER, 'sheet');
    const sheets = allSheets.filter(s => s.date === date);

    res.json({ success: true, date, sheets });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Get daily error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET CALL SHEET BY ID
app.get('/api/callsheets/:id', rateLimitMiddleware, (req, res) => {
  try {
    const sheet = storage.read(CS_MODULE, CS_USER, 'sheet', req.params.id);

    if (!sheet) {
      return res.status(404).json({ success: false, error: 'Call sheet not found' });
    }

    res.json({ success: true, sheet });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE CALL SHEET
app.put('/api/callsheets/:id', rateLimitMiddleware, (req, res) => {
  try {
    const existing = storage.read(CS_MODULE, CS_USER, 'sheet', req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Call sheet not found' });
    }

    const updated = { ...existing, ...req.body, updatedAt: Date.now() };
    storage.write(CS_MODULE, CS_USER, 'sheet', req.params.id, updated);

    console.log('[CALLSHEETS] ✅ Updated:', req.params.id);
    res.json({ success: true, sheet: updated });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CLOCK IN/OUT
app.post('/api/callsheets/crew/clockin', rateLimitMiddleware, (req, res) => {
  try {
    const { sheetId, crewId, action } = req.body;

    const sheet = storage.read(CS_MODULE, CS_USER, 'sheet', sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, error: 'Call sheet not found' });
    }

    const crew = sheet.crew?.find(c => c.id === crewId);
    if (!crew) {
      return res.status(404).json({ success: false, error: 'Crew member not found' });
    }

    if (action === 'in') {
      crew.clockIn = Date.now();
      crew.status = 'working';
    } else if (action === 'out') {
      crew.clockOut = Date.now();
      crew.status = 'offsite';
      crew.hoursWorked = (crew.clockOut - crew.clockIn) / (1000 * 60 * 60);
    }

    sheet.updatedAt = Date.now();
    storage.write(CS_MODULE, CS_USER, 'sheet', sheetId, sheet);

    console.log(`[CALLSHEETS] ✅ Clock ${action}:`, crew.name);
    res.json({ success: true, crew });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Clock error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// SYNC CALL SHEETS
app.post('/api/callsheets/sync', rateLimitMiddleware, (req, res) => {
  try {
    const sheet = req.body;
    const id = sheet.id || `cs-${Date.now()}`;
    storage.write(CS_MODULE, CS_USER, 'sheet', id, { ...sheet, id, synced: true });

    res.json({ success: true, message: 'Synced successfully' });
  } catch (error) {
    console.error('[CALLSHEETS] ❌ Sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  📋  CALL SHEETS API READY                                ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║  ✅  Create:        POST   /api/callsheets/create         ║');
console.log('║  ✅  Get Daily:     GET    /api/callsheets/daily/:date    ║');
console.log('║  ✅  Get by ID:     GET    /api/callsheets/:id            ║');
console.log('║  ✅  Update:        PUT    /api/callsheets/:id            ║');
console.log('║  ✅  Clock In/Out:  POST   /api/callsheets/crew/clockin   ║');
console.log('║  ✅  Sync:          POST   /api/callsheets/sync           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// ============================================
// RISK & SAFETY API (Persistent disk storage)
// ============================================

const SAFETY_MODULE = 'safety';
const SAFETY_USER = 'default';

// REPORT INCIDENT
app.post('/api/safety/incident', rateLimitMiddleware, (req, res) => {
  try {
    const incident = {
      id: `inc-${Date.now()}`,
      ...req.body,
      status: 'open',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    storage.write(SAFETY_MODULE, SAFETY_USER, 'incident', incident.id, incident);

    console.log(`[SAFETY] 🚨 Incident reported: ${incident.type} - ${incident.severity}`);
    res.json({ success: true, incident });
  } catch (error) {
    console.error('[SAFETY] ❌ Incident error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET INCIDENTS
app.get('/api/safety/incidents/:siteId?', rateLimitMiddleware, (req, res) => {
  try {
    const { siteId } = req.params;
    const { severity, status } = req.query;

    let filtered = storage.list(SAFETY_MODULE, SAFETY_USER, 'incident');

    if (siteId) filtered = filtered.filter(i => i.siteId === siteId);
    if (severity) filtered = filtered.filter(i => i.severity === severity);
    if (status) filtered = filtered.filter(i => i.status === status);

    res.json({ success: true, incidents: filtered, count: filtered.length });
  } catch (error) {
    console.error('[SAFETY] ❌ Get incidents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE INCIDENT
app.put('/api/safety/incident/:id', rateLimitMiddleware, (req, res) => {
  try {
    const existing = storage.read(SAFETY_MODULE, SAFETY_USER, 'incident', req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updated = { ...existing, ...req.body, updatedAt: Date.now() };
    storage.write(SAFETY_MODULE, SAFETY_USER, 'incident', req.params.id, updated);

    console.log('[SAFETY] ✅ Incident updated:', req.params.id);
    res.json({ success: true, incident: updated });
  } catch (error) {
    console.error('[SAFETY] ❌ Update incident error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE SAFETY CHECKLIST
app.post('/api/safety/checklist', rateLimitMiddleware, (req, res) => {
  try {
    const checklist = {
      id: `chk-${Date.now()}`,
      ...req.body,
      createdAt: Date.now()
    };

    storage.write(SAFETY_MODULE, SAFETY_USER, 'checklist', checklist.id, checklist);

    console.log('[SAFETY] ✅ Checklist created:', checklist.id);
    res.json({ success: true, checklist });
  } catch (error) {
    console.error('[SAFETY] ❌ Checklist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// COMPLETE SAFETY CHECKLIST
app.post('/api/safety/checklist/complete', rateLimitMiddleware, (req, res) => {
  try {
    const { checklistId, signature, results } = req.body;

    const checklist = storage.read(SAFETY_MODULE, SAFETY_USER, 'checklist', checklistId);
    if (!checklist) {
      return res.status(404).json({ success: false, error: 'Checklist not found' });
    }

    checklist.status = 'completed';
    checklist.completedAt = Date.now();
    checklist.signature = signature;
    checklist.results = results;
    storage.write(SAFETY_MODULE, SAFETY_USER, 'checklist', checklistId, checklist);

    console.log('[SAFETY] ✅ Checklist completed:', checklistId);
    res.json({ success: true, checklist });
  } catch (error) {
    console.error('[SAFETY] ❌ Complete checklist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// REGISTER RISK
app.post('/api/safety/risk', rateLimitMiddleware, (req, res) => {
  try {
    const risk = {
      id: `risk-${Date.now()}`,
      ...req.body,
      riskScore: (req.body.likelihood || 1) * (req.body.impact || 1),
      status: 'active',
      createdAt: Date.now()
    };

    storage.write(SAFETY_MODULE, SAFETY_USER, 'risk', risk.id, risk);

    console.log('[SAFETY] ✅ Risk registered:', risk.id, `(score: ${risk.riskScore})`);
    res.json({ success: true, risk });
  } catch (error) {
    console.error('[SAFETY] ❌ Risk error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET RISK MATRIX
app.get('/api/safety/risks/matrix', rateLimitMiddleware, (req, res) => {
  try {
    const allRisks = storage.list(SAFETY_MODULE, SAFETY_USER, 'risk');
    const matrix = {
      critical: allRisks.filter(r => r.status === 'active' && r.riskScore > 20),
      high: allRisks.filter(r => r.status === 'active' && r.riskScore >= 16 && r.riskScore <= 20),
      medium: allRisks.filter(r => r.status === 'active' && r.riskScore >= 11 && r.riskScore < 16),
      low: allRisks.filter(r => r.status === 'active' && r.riskScore <= 10)
    };

    res.json({ success: true, matrix });
  } catch (error) {
    console.error('[SAFETY] ❌ Risk matrix error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RECORD INDUCTION
app.post('/api/safety/induction', rateLimitMiddleware, (req, res) => {
  try {
    const induction = {
      id: `ind-${Date.now()}`,
      ...req.body,
      status: 'valid',
      createdAt: Date.now()
    };

    storage.write(SAFETY_MODULE, SAFETY_USER, 'induction', induction.id, induction);

    console.log('[SAFETY] ✅ Induction recorded:', induction.personName);
    res.json({ success: true, induction });
  } catch (error) {
    console.error('[SAFETY] ❌ Induction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET COMPLIANCE STATUS
app.get('/api/safety/compliance/:siteId?', rateLimitMiddleware, (req, res) => {
  try {
    const { siteId } = req.params;

    let allIncidents = storage.list(SAFETY_MODULE, SAFETY_USER, 'incident');
    let allChecklists = storage.list(SAFETY_MODULE, SAFETY_USER, 'checklist');
    let allRisks = storage.list(SAFETY_MODULE, SAFETY_USER, 'risk');
    let allInductions = storage.list(SAFETY_MODULE, SAFETY_USER, 'induction');

    if (siteId) {
      allIncidents = allIncidents.filter(i => i.siteId === siteId);
      allChecklists = allChecklists.filter(c => c.siteId === siteId);
      allRisks = allRisks.filter(r => r.siteId === siteId);
    }

    const status = {
      incidents: {
        total: allIncidents.length,
        open: allIncidents.filter(i => i.status === 'open').length,
        critical: allIncidents.filter(i => i.severity === 'critical').length
      },
      checklists: {
        total: allChecklists.length,
        completed: allChecklists.filter(c => c.status === 'completed').length,
        pending: allChecklists.filter(c => c.status === 'pending').length
      },
      risks: {
        total: allRisks.length,
        critical: allRisks.filter(r => r.riskScore > 20).length,
        high: allRisks.filter(r => r.riskScore >= 16 && r.riskScore <= 20).length
      },
      inductions: {
        total: allInductions.length,
        valid: allInductions.filter(i => i.status === 'valid').length
      }
    };

    // Calculate compliance score
    const openIncidentsScore = Math.max(0, 100 - (status.incidents.open * 5));
    const checklistScore = status.checklists.total > 0
      ? (status.checklists.completed / status.checklists.total) * 100
      : 100;
    const riskScore = Math.max(0, 100 - (status.risks.critical * 20) - (status.risks.high * 10));

    status.overallScore = Math.round((openIncidentsScore + checklistScore + riskScore) / 3);
    status.complianceLevel =
      status.overallScore >= 90 ? 'excellent' :
        status.overallScore >= 75 ? 'good' :
          status.overallScore >= 60 ? 'acceptable' : 'critical';

    res.json({ success: true, status });
  } catch (error) {
    console.error('[SAFETY] ❌ Compliance status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🛡️  RISK & SAFETY API READY                              ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║  ✅  Report Incident:      POST /api/safety/incident      ║');
console.log('║  ✅  Get Incidents:        GET  /api/safety/incidents     ║');
console.log('║  ✅  Update Incident:      PUT  /api/safety/incident/:id  ║');
console.log('║  ✅  Create Checklist:     POST /api/safety/checklist     ║');
console.log('║  ✅  Complete Checklist:   POST /api/safety/checklist/..  ║');
console.log('║  ✅  Register Risk:        POST /api/safety/risk          ║');
console.log('║  ✅  Risk Matrix:          GET  /api/safety/risks/matrix  ║');
console.log('║  ✅  Record Induction:     POST /api/safety/induction     ║');
console.log('║  ✅  Compliance Status:    GET  /api/safety/compliance    ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// ============================================
// AUTH & BUILDER & SITEOPS API
// ============================================




app.use('/api/auth', authRoutes);
app.use('/api/builder', optionalJwt, builderRoutes);
app.use('/api/siteops', optionalJwt, siteopsRoutes);

// ============================================
// CORE 2.0 API ENDPOINTS (Weather & News)
// ============================================

// Weather API endpoint
app.get('/api/weather', rateLimitMiddleware, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Try OpenWeatherMap API if configured
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    if (weatherApiKey) {
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);

        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          return res.json({
            temp: Math.round(weatherData.main.temp),
            temperature: Math.round(weatherData.main.temp),
            description: weatherData.weather[0].description,
            condition: weatherData.weather[0].main,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
            wind: Math.round(weatherData.wind.speed * 3.6),
            city: weatherData.name
          });
        }
      } catch (weatherError) {
        console.warn('[Weather API] OpenWeatherMap error:', weatherError.message);
      }
    }

    // Fallback: Return basic location info
    res.json({
      temp: null,
      temperature: null,
      description: `Location: ${lat}°, ${lon}°`,
      condition: 'Unknown',
      humidity: null,
      windSpeed: null,
      note: 'Weather API key not configured. Add OPENWEATHER_API_KEY to server/.env'
    });
  } catch (error) {
    log('error', 'Weather API error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// News API endpoint
app.get('/api/news', rateLimitMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Try NewsAPI.org if configured
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey) {
      try {
        const newsUrl = `https://newsapi.org/v2/top-headlines?country=gb&pageSize=${limit}&apiKey=${newsApiKey}`;
        const newsResponse = await fetch(newsUrl);

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          const articles = (newsData.articles || []).slice(0, limit).map(article => ({
            title: article.title,
            headline: article.title,
            source: article.source.name,
            publisher: article.source.name,
            url: article.url,
            description: article.description,
            publishedAt: article.publishedAt
          }));

          return res.json({ articles, news: articles, total: articles.length });
        }
      } catch (newsError) {
        console.warn('[News API] NewsAPI.org error:', newsError.message);
      }
    }

    // Fallback: Return placeholder
    res.json({
      articles: [{
        title: 'News feed requires API configuration',
        headline: 'News feed requires API configuration',
        source: 'GRACE-X',
        publisher: 'GRACE-X',
        description: 'Add NEWS_API_KEY to server/.env to enable news feed'
      }],
      news: [],
      total: 0,
      note: 'News API key not configured. Add NEWS_API_KEY to server/.env'
    });
  } catch (error) {
    log('error', 'News API error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch news data' });
  }
});

// ============================================
// GALLERY API ENDPOINTS (Media Gallery)
// ============================================

// Base media directory (env, or local default; on Render use MEDIA_BASE_DIR or data/media)
const defaultMediaDir = path.join(__dirname, 'data', 'media');
const MEDIA_BASE_DIR = (process.env.MEDIA_BASE_DIR || defaultMediaDir)
  .replace(/\\/g, path.sep)
  .replace(/\//g, path.sep);
// Ensure default media dir exists on Render (no .env) so gallery doesn't crash
if (!process.env.MEDIA_BASE_DIR && process.platform !== 'win32') {
  try { fsSync.mkdirSync(MEDIA_BASE_DIR, { recursive: true }); } catch (e) { /* ignore */ }
}

// List folders and files in media directory
app.get('/api/gallery/list', rateLimitMiddleware, async (req, res) => {
  try {
    const { folder = '' } = req.query;
    const targetPath = folder ? path.join(MEDIA_BASE_DIR, folder) : MEDIA_BASE_DIR;

    // Security: Ensure path is within base directory
    const resolvedPath = path.resolve(targetPath);
    const resolvedBase = path.resolve(MEDIA_BASE_DIR);

    if (!resolvedPath.startsWith(resolvedBase)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = [];
    const entries = await fs.readdir(targetPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry.name);
      const relativePath = folder ? `${folder}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        items.push({
          type: 'folder',
          name: entry.name,
          path: relativePath
        });
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
        const isVideo = ['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext);

        if (isImage || isVideo) {
          const stats = await fs.stat(fullPath).catch(() => null);
          items.push({
            type: isImage ? 'image' : 'video',
            name: entry.name,
            path: relativePath,
            size: stats?.size || 0,
            modified: stats?.mtime || null
          });
        }
      }
    }

    // Sort: folders first, then by name
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      folder: folder || '/',
      items,
      total: items.length
    });
  } catch (error) {
    log('error', 'Gallery list error', { error: error.message, folder: req.query.folder });
    res.status(500).json({ error: 'Failed to list gallery items', message: error.message });
  }
});

// Serve media files (images/videos)
app.get('/api/gallery/media/*', rateLimitMiddleware, async (req, res) => {
  try {
    const mediaPath = req.params[0]; // Everything after /api/gallery/media/
    const fullPath = path.join(MEDIA_BASE_DIR, mediaPath);

    // Security: Ensure path is within base directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedBase = path.resolve(MEDIA_BASE_DIR);

    if (!resolvedPath.startsWith(resolvedBase)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        return res.status(404).json({ error: 'Not a file' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    const ext = path.extname(fullPath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
    const isVideo = ['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext);

    if (isImage) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
    } else if (isVideo) {
      res.setHeader('Content-Type', `video/${ext.slice(1)}`);
      res.setHeader('Accept-Ranges', 'bytes');
    } else {
      return res.status(400).json({ error: 'Unsupported media type' });
    }

    // Stream the file
    const fileStream = require('fs').createReadStream(fullPath);
    fileStream.pipe(res);

  } catch (error) {
    log('error', 'Gallery media error', { error: error.message, path: req.params[0] });
    res.status(500).json({ error: 'Failed to serve media file', message: error.message });
  }
});

// Get folder tree structure
app.get('/api/gallery/tree', rateLimitMiddleware, async (req, res) => {
  try {
    async function buildTree(dirPath, relativePath = '') {
      const tree = { name: path.basename(dirPath), path: relativePath, folders: [], fileCount: 0 };
      const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subPath = path.join(dirPath, entry.name);
          const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
          const subtree = await buildTree(subPath, subRelative);
          tree.folders.push(subtree);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext)) {
            tree.fileCount++;
          }
        }
      }

      return tree;
    }

    const tree = await buildTree(MEDIA_BASE_DIR);
    res.json(tree);
  } catch (error) {
    log('error', 'Gallery tree error', { error: error.message });
    res.status(500).json({ error: 'Failed to build folder tree', message: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path,
    requestId: req.requestId
  });
});

// Global error handler
app.use((err, req, res, next) => {
  log('error', `Unhandled error: ${err.message}`, { requestId: req.requestId, stack: err.stack });

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    requestId: req.requestId
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, () => {
  const provider = process.env.LLM_PROVIDER || 'openai';
  const apiKeySet = provider === 'anthropic'
    ? !!(process.env.ANTHROPIC_API_KEY || process.env.API_KEY)
    : !!(process.env.OPENAI_API_KEY || process.env.API_KEY);
  const apiKeyStatus = apiKeySet ? '✓ Configured'.padEnd(39) : '✗ NOT SET - Set in Render env!'.padEnd(39);
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀  GRACE-X Brain API Server v${API_VERSION}                 ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   📡  Server:    http://localhost:${PORT}                    ║
║   💚  Health:    http://localhost:${PORT}/health             ║
║   🧠  Brain:     http://localhost:${PORT}/api/brain          ║
║   📋  Info:      http://localhost:${PORT}/api/info           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   🔑  Provider:  ${provider.padEnd(39)}║
║   🔒  API Key:   ${apiKeyStatus}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

  // JWT_SECRET warning
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'gracex-homesafe-secret-change-in-production') {
    console.log('⚠️  WARNING: JWT_SECRET is not set or using default! Set JWT_SECRET env var for production.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

module.exports = app; // For testing
