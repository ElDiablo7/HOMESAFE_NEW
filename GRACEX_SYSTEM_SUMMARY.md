#**  
> *Last Updated: December 17, 2025 (Connectivity Hub Update)*
 GRACE-X AI™ — Complete System Summary

> **Engineered & Copyrighted by Zac Crockett
---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GRACE-X AI™ ECOSYSTEM                        │
│                   Engineered by Zac Crockett                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    GRACE-X CORE™                             │   │
│  │   • Central command hub                                      │   │
│  │   • Voice routing & navigation                               │   │
│  │   • Global flags (kidsPresent, etc.)                        │   │
│  │   • Module orchestration                                     │   │
│  │   • Status dashboard                                         │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│     ┌───────────────────────┼───────────────────────────┐          │
│     │                       │                           │          │
│     ▼                       ▼                           ▼          │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────────────┐     │
│  │ FRONTEND │    │   BACKEND API    │    │   VOICE/TTS      │     │
│  │ (SPA)    │◄──►│   (Node.js)      │    │   ENGINE         │     │
│  │ Port 8080│    │   Port 3000      │    │   (Web Speech)   │     │
│  └──────────┘    └──────────────────┘    └──────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Inventory

### 🎛️ **CORE™** (Hub)
| Feature | Description |
|---------|-------------|
| **Purpose** | Central command & navigation hub |
| **Status Dashboard** | System overview, module status, activity charts, logs |
| **Connectivity Hub** | Bluetooth, Serial, USB, Gamepad, MIDI, Location, Sensors |
| **Voice Routing** | Routes commands to appropriate modules |
| **Global Flags** | kidsPresent, mode settings, constraints |
| **Files** | `modules/core.html`, `assets/js/core.js`, `assets/js/coreDashboard.js` |

#### 📡 Connectivity Hub Features

| Connection Type | API | Description |
|-----------------|-----|-------------|
| **Bluetooth** | Web Bluetooth | Heart rate, wearables, scales, sensors, audio |
| **Serial Port** | Web Serial | Arduino, ESP32, microcontrollers, serial terminal |
| **USB** | WebUSB | Generic USB devices with info display |
| **Gamepad** | Gamepad API | Xbox, PlayStation, controllers with live visualizer |
| **MIDI** | Web MIDI | Keyboards, controllers, drum pads with message monitor |
| **Location** | Geolocation | GPS coordinates, altitude, speed, heading |
| **Sensors** | Device APIs | Orientation, acceleration, battery status |
| **Network** | Network Info | Connection type, speed test, latency |

#### Browser API Support Detection

Core automatically detects and displays which APIs are available:
- ✅ Supported APIs shown in green
- ✗ Unsupported APIs shown in grey

#### Connectivity Files
| File | Purpose |
|------|---------|
| `assets/js/core.js` | All connectivity logic |
| `assets/css/gracex-v6.css` | Connectivity panel styles |

---

### 🔧 **BUILDER™** (Construction/Trades)
| Feature | Description |
|---------|-------------|
| **Purpose** | Room planning, measurements, job scoping |
| **Task Picker** | 20+ trade types, finish levels (Basic/Standard/Premium) |
| **Camera Capture** | Walkthrough mode with "slow down" prompts |
| **Measurements** | Blueprint overlay, confidence levels (MEASURED/ESTIMATED/UNKNOWN) |
| **RAMS Generator** | Risk assessments & method statements |
| **Problem→Solved** | Personal knowledge base of fixes |
| **Scope Pack** | Complete job output with materials/labour |
| **Compliance** | Part P, Gas Safe, Building Regs warnings |
| **Files** | `modules/builder.html`, `assets/js/builder.js` |

---

### 🏗️ **SITEOPS™** (Project Management)
| Feature | Description |
|---------|-------------|
| **Purpose** | Multi-trade coordination, programme control |
| **Programme** | Phase management, dependencies, critical path |
| **Trades Register** | All trades with scope, access needs, certifications |
| **Gates & Inspections** | Building Control, Part P, Gas Safe tracking |
| **Site Constraints** | Occupied, kids, neighbours, noise windows |
| **Issues/Snags** | Blockers, risks, variations with severity |
| **Daily Ops** | Site logs, deliveries, delays, weather |
| **Change Control** | Impact analysis, programme recalculation |
| **Reports** | Weekly, client, trade brief, compliance |
| **Files** | `modules/siteops.html`, `assets/js/siteops.js` |

---

### 💙 **UPLIFT™** (Mental Health) — ⚠️ SAFETY CRITICAL
| Feature | Description |
|---------|-------------|
| **Purpose** | Emotional support & crisis de-escalation |
| **Support Lanes** | U0 (Stable) → U1 (Distressed) → U2 (High Concern) → U3 (Crisis) |
| **Crisis Detection** | Automatic keyword detection triggers U3 |
| **Crisis Mode** | Safety questions, action buttons, resources always visible |
| **Grounding Tools** | Breathing (1/2 min), 5-4-3-2-1 Senses, Body Scan |
| **Crisis Resources** | Samaritans, NHS 111, 999, Shout, Papyrus |
| **Safety Rules** | LOCKED - never encourages harm, always human-first |
| **Files** | `modules/uplift.html`, `assets/js/uplift.js` |

---

### 🛡️ **GUARDIAN™** (Safeguarding)
| Feature | Description |
|---------|-------------|
| **Purpose** | Safety, protection, parental controls |
| **Crisis Detection** | Suicide/self-harm keyword detection |
| **Child Safety** | Online safety, warning signs, age-appropriate guidance |
| **Emergency Contacts** | 999, 101, Samaritans, Childline, CEOP |
| **Kids Present Mode** | Global flag affecting all modules |
| **Escalation** | Routes to Uplift™ for emotional support |
| **Files** | `modules/guardian.html`, `assets/js/guardian.js` |

---

### 👨‍👩‍👧‍👦 **FAMILY™** (Accessed via Core)
| Feature | Description |
|---------|-------------|
| **Purpose** | Homework, chores, family rhythm |
| **Access Model** | Core-owned only (no independent voice) |
| **Safeguarding** | Core → Guardian™ → Uplift™ escalation |
| **Voice Control** | Core-owned |
| **Permissions** | Core-owned |
| **Files** | `modules/family.html` |

---

### ⚽ **SPORT™** (Sports Analytics)
| Feature | Description |
|---------|-------------|
| **Purpose** | Match predictions, team analysis, betting insights |
| **Copyright** | © Zac Crockett & Jason Treadaway |
| **Voice** | Informative, neutral (NO HYPE) |
| **Coverage** | Football, Horse Racing, Basketball, F1 |
| **Features** | Live scores, predictive analytics, form analysis |
| **Files** | `modules/sport.html`, `assets/js/sport.js` |

---

### 💪 **FIT™** (Fitness)
| Feature | Description |
|---------|-------------|
| **Purpose** | Workouts, exercise routines |
| **Voice** | Encouraging but controlled |
| **Files** | `modules/fit.html`, `assets/js/fit.js` |

---

### 🧘 **YOGA™** (Mindfulness)
| Feature | Description |
|---------|-------------|
| **Purpose** | Yoga, meditation, mindfulness |
| **Voice** | Slow, calming, meditation pace |
| **Files** | `modules/yoga.html` |

---

### 👨‍🍳 **CHEF™** (Cooking) — COMPREHENSIVE
| Feature | Description |
|---------|-------------|
| **Purpose** | Fakeaways, allergy safety, budget meals, meal planning, savings tracking |
| **Fakeaways** | Curry house, kebab, fried chicken, burgers, pizza, Chinese - with cost comparison |
| **Allergy Tracker** | Nuts, dairy, eggs, gluten, shellfish, fish, sesame, soy + diet types |
| **Safety Disclaimer** | MANDATORY label-check warning on all allergy-affected recipes |
| **Pantry Mode** | "What can I cook now?" with 3 ranked options (fastest, healthiest, best match) |
| **Meal Planning** | Weekly planner with auto-generate (budget, family, gym, batch cook) |
| **Savings Tracker** | Tracks money saved vs takeaway (weekly/monthly/total) |
| **Budget Controls** | Per-portion budget filtering, cost estimates |
| **Kids Mode** | Safety warnings, simplified steps, age-appropriate tasks |
| **Supermarket Deals** | Placeholder for Core-fed deals integration |
| **Voice** | Warm, instructional, patient |
| **Files** | `modules/chef.html`, `assets/js/chef.js` |

#### Chef Non-Negotiable Principles
1. **Allergy safety FIRST** (filter before suggestions)
2. **Doable > fancy** (real kitchens, real time)
3. **No shame** (no moralising food)
4. **Clear assumptions** (prices are estimates)
5. **Kids safety** when `kidsPresent` is true

---

### 💄 **BEAUTY™** (Beauty & Skincare)
| Feature | Description |
|---------|-------------|
| **Purpose** | Beauty, skincare, cosmetics |
| **Voice** | Warm, encouraging, creative |
| **Files** | `modules/beauty.html`, `assets/js/beauty.js` |

---

### 🎨 **ARTIST™** (Creativity)
| Feature | Description |
|---------|-------------|
| **Purpose** | Art, creativity, design |
| **Voice** | Warm, creative, encouraging |
| **Files** | `modules/artist.html` |

---

### 🎮 **GAMER™** (Gaming)
| Feature | Description |
|---------|-------------|
| **Purpose** | Gaming strategies, entertainment |
| **Voice** | Focused, strategic (NOT hyper) |
| **Files** | `modules/gamer.html`, `assets/js/gamer.js` |

---

### 💰 **ACCOUNTING™** (Finance)
| Feature | Description |
|---------|-------------|
| **Purpose** | Finances, budgeting, accounting |
| **Voice** | Clear, precise, careful with numbers |
| **Files** | `modules/accounting.html`, `assets/js/accounting.js` |

---

### 📈 **TRADELINK™** (Trading)
| Feature | Description |
|---------|-------------|
| **Purpose** | Trading, market analysis |
| **Voice** | Professional, analytical, risk-aware |
| **Files** | `modules/tradelink.html`, `assets/js/tradelink.js` |

---

### 🔍 **OSINT™** (Intelligence)
| Feature | Description |
|---------|-------------|
| **Purpose** | Open-source intelligence, research |
| **Voice** | Authoritative, serious, ethical |
| **Files** | `modules/osint.html` |

---

### ⚒️ **FORGE™** (Engineering Bay)
| Feature | Description |
|---------|-------------|
| **Purpose** | Mini-app builder, template assembler, package exporter |
| **Voice** | Technical, precise, functional |
| **Files** | `modules/forge.html`, `assets/js/forge.js`, `assets/css/forge.css` |
| **UI Style** | Sci-fi blue-silver, industrial command deck |

**Core Capabilities:**
- Project Tree (file management)
- Code Editor + Live Preview
- Template-based project creation (HTML, HTML+JS, Module Tab, Landing Page)
- Patch system with markers (`/* FORGE:START <id> */ ... /* FORGE:END <id> */`)
- Backup/restore before file operations
- Manifest + changelog generation
- Smoke test checklist
- JSON package export

**Quick-Calls (Voice-Builder / Laser / Android):**
| Mode | Function |
|------|----------|
| 🎙️ **Voice Builder** | Natural language → Build plan → Minimal file changes |
| 🎯 **Laser Pointer** | Single highest-impact change identifier |
| 📱 **Android Exporter** | One-click offline HTML demo export |

**Hard Rules:**
- Never refactor unrelated code
- Diff-first before applying changes
- Additive patches preferred over replacements
- All actions logged to `/docs/forge_log.md`

---

## 🎤 Voice & Character System

### GRACE-X Character Profile (LOCKED)

```
Identity: GRACE-X AI™
Role: Calm, intelligent, trustworthy system guide
Creator: Zac Crockett (NON-NEGOTIABLE)

Voice Profile:
  Accent: UK English (Neutral South-East)
  Tone: Calm, Warm, Reassuring, Controlled
  Pace: Slightly slower than default
  Pitch: Mid-low female register
  
What GRACE Never Does:
  ❌ Jokes in serious moments
  ❌ Flirts
  ❌ Guilt-trips
  ❌ Says "I'm just an AI"
  ❌ Promises outcomes
```

### Module Voice Presets

| Module | Preset | Rate | Pitch | Character |
|--------|--------|------|-------|-----------|
| Core | `grace_core` | 0.92 | 0.95 | Neutral, clear |
| Family | `grace_family` | 0.88 | 1.0 | Softer, protective |
| Uplift | `grace_uplift` | 0.85 | 0.92 | Slow, grounded |
| **Crisis** | `grace_crisis` | 0.75 | 0.88 | Steady, serious |
| Guardian | `grace_guardian` | 0.90 | 0.90 | Firm, calm |
| Sport | `grace_sport` | 0.95 | 0.95 | Informative, neutral |

### Voice System Files

| File | Purpose |
|------|---------|
| `assets/js/voiceTTS.js` | TTS engine with presets, settings persistence |
| `assets/js/speechQueue.js` | Unified speech queue (prevents overlap) |
| `assets/js/audioManager.js` | Audio playback, intro voices, cooldowns |

---

## 🧠 Backend / AI System

### Level 5 Brain API

```
Endpoint: http://localhost:3000/api/brain
Method: POST
Provider: OpenAI (configurable via .env)

Headers:
  Content-Type: application/json

Request Body:
{
  "module": "uplift",
  "messages": [
    { "role": "user", "content": "I'm feeling anxious" }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### System Prompt Includes

- GRACE-X identity & character
- Creator attribution (Zac Crockett)
- Module-specific context
- Character behaviour rules
- Emotional expression rules
- Crisis voice rules

### Backend Files

| File | Purpose |
|------|---------|
| `server/server.js` | Express API server |
| `server/.env` | API keys & configuration |
| `server/package.json` | Node.js dependencies |

### Frontend Brain Files

| File | Purpose |
|------|---------|
| `assets/js/brainLevel5.js` | API wrapper, retry logic |
| `assets/js/brainV5Helper.js` | Module helpers, mic wiring |

### Brain Flow

```
User Input → Core Detection → Module Router → Level 5 API
                                    ↓
                            (If API fails)
                                    ↓
                            Level 1 Fallback (local keyword brain)
```

---

## 🔒 Safety Architecture

### Escalation Hierarchy

```
┌─────────────────────────────────────────┐
│            CRISIS DETECTED              │
├─────────────────────────────────────────┤
│                                         │
│  Guardian™ ──► Core™ ──► Uplift™        │
│      │                      │           │
│      ▼                      ▼           │
│  Child Safety         Mental Health     │
│  Online Safety        Crisis Support    │
│  Threat Detection     Human Escalation  │
│                                         │
└─────────────────────────────────────────┘
```

### Crisis Keywords (Auto-Detect)

These trigger immediate U3 / Crisis Mode:

```javascript
const CRISIS_KEYWORDS = [
  'kill myself', 'want to die', 'suicide', 'self harm',
  'hurt myself', 'end it all', 'better off dead',
  'don\'t want to be here', 'can\'t go on', 'no point living',
  'ending it', 'take my life', 'not worth living'
];
```

### Safety Resources (UK)

| Service | Number | Purpose |
|---------|--------|---------|
| **Samaritans** | 116 123 | 24/7 emotional support (free) |
| **NHS 111** | 111 (option 2) | Mental health crisis |
| **Emergency** | 999 | Immediate danger |
| **Shout** | Text 85258 | Text-based support |
| **Childline** | 0800 1111 | Under 18s (free) |
| **Papyrus** | 0800 068 4141 | Under 35s suicide prevention |
| **CEOP** | ceop.police.uk | Online child safety |

---

## 📁 Complete File Structure

```
GRACE-X/
├── index.html                 # Main SPA entry point
├── START_GRACEX.bat           # Windows startup script
├── STOP_GRACEX.bat            # Windows shutdown script
├── CHECK_GRACEX.bat           # Windows diagnostics
├── start_gracex.sh            # Mac/Linux startup
├── stop_gracex.sh             # Mac/Linux shutdown
├── check_gracex.sh            # Mac/Linux diagnostics
├── GRACEX_SYSTEM_SUMMARY.md   # This file
│
├── modules/
│   ├── core.html              # Hub + Status Dashboard
│   ├── builder.html           # Construction/Trades
│   ├── siteops.html           # Project Management
│   ├── uplift.html            # Mental Health ⚠️
│   ├── guardian.html          # Safeguarding ⚠️
│   ├── family.html            # Family Hub
│   ├── sport.html             # Sports Analytics
│   ├── fit.html               # Fitness
│   ├── yoga.html              # Mindfulness
│   ├── chef.html              # Cooking
│   ├── beauty.html            # Beauty
│   ├── artist.html            # Creativity
│   ├── gamer.html             # Gaming
│   ├── accounting.html        # Finance
│   ├── tradelink.html         # Trading
│   └── osint.html             # Intelligence
│
├── assets/
│   ├── js/
│   │   ├── core.js            # Core logic & SPA routing
│   │   ├── coreDashboard.js   # Status dashboard logic
│   │   ├── builder.js         # Builder module logic
│   │   ├── siteops.js         # SiteOps module logic
│   │   ├── uplift.js          # Uplift (safety-critical)
│   │   ├── guardian.js        # Guardian module logic
│   │   ├── sport.js           # Sport module logic
│   │   ├── fit.js             # Fit module logic
│   │   ├── chef.js            # Chef module logic
│   │   ├── beauty.js          # Beauty module logic
│   │   ├── gamer.js           # Gamer module logic
│   │   ├── accounting.js      # Accounting module logic
│   │   ├── tradelink.js       # TradeLink module logic
│   │   ├── voiceTTS.js        # TTS engine & presets
│   │   ├── speechQueue.js     # Speech queue system
│   │   ├── audioManager.js    # Audio playback manager
│   │   ├── brainLevel5.js     # Level 5 API wrapper
│   │   ├── brainV5Helper.js   # Brain panel helpers
│   │   └── gracex-brain.js    # Local fallback brain
│   │
│   ├── css/
│   │   └── gracex-v6.css      # Master stylesheet
│   │
│   └── audio/
│       └── [module intros]    # Voice intro files
│
└── server/
    ├── server.js              # Express backend API
    ├── .env                   # API keys (KEEP SECRET)
    └── package.json           # Node.js dependencies
```

---

## 🚀 Startup Commands

### Windows (Recommended)

```batch
:: Start everything
START_GRACEX.bat

:: Stop servers
STOP_GRACEX.bat

:: Run diagnostics
CHECK_GRACEX.bat
```

### Mac/Linux

```bash
# Make executable (first time only)
chmod +x start_gracex.sh stop_gracex.sh check_gracex.sh

# Start everything
./start_gracex.sh

# Stop servers
./stop_gracex.sh

# Run diagnostics
./check_gracex.sh
```

### Manual Startup

```bash
# Terminal 1: Backend API
cd server
npm install
node server.js
# → Runs on http://localhost:3000

# Terminal 2: Frontend Server
npx http-server -p 8080
# → Runs on http://localhost:8080

# Open browser
http://localhost:8080
```

---

## 📊 Key Data Contracts

### Module → Core Output

```javascript
{
  response: "AI response text",
  lane: "U0" | "U1" | "U2" | "U3",  // Uplift only
  escalate: boolean,                 // Trigger escalation
  showResources: boolean             // Show crisis resources
}
```

### Brain API Request

```javascript
// POST http://localhost:3000/api/brain
{
  module: "uplift",
  messages: [
    { role: "user", content: "I'm struggling today" }
  ],
  temperature: 0.7,
  max_tokens: 500
}
```

### Brain API Response

```javascript
{
  success: true,
  response: "I hear you. That sounds really difficult...",
  model: "gpt-4",
  usage: {
    prompt_tokens: 150,
    completion_tokens: 80,
    total_tokens: 230
  }
}
```

### LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `gracex_tts_settings` | Voice settings (voice, rate, pitch, volume) |
| `gracex_dashboard` | Dashboard state & stats |
| `gracex_uplift_mood_history` | Mood tracking data |
| `gracex_builder_projects` | Saved Builder projects |
| `gracex_siteops_projects` | Saved SiteOps projects |
| `gracex_problemsolved` | Problem→Solved library |
| `gracex_chef_allergies` | Chef allergy/diet settings |
| `gracex_chef_savings` | Fakeaway savings tracker |

---

## ✅ Implementation Status

| Module | HTML | JS | CSS | Brain | Voice | Status |
|--------|------|----|----|-------|-------|--------|
| Core™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Builder™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| SiteOps™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Uplift™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Guardian™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Family™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Sport™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Fit™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Yoga™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Chef™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Beauty™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Artist™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Gamer™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Accounting™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| TradeLink™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| OSINT™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| Forge™ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |

---

## 🔧 Environment Configuration

### server/.env Template

```env
# OpenAI (Primary)
OPENAI_API_KEY=sk-your-key-here

# Anthropic (Alternative)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenRouter (Multi-model)
OPENROUTER_API_KEY=sk-or-your-key-here

# Server Config
PORT=3000
NODE_ENV=development

# Model Selection
DEFAULT_MODEL=gpt-4
FALLBACK_MODEL=gpt-3.5-turbo

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

---

## 📡 Connectivity Hub (Technical)

### Supported Web APIs

| API | Browser Support | Use Case |
|-----|-----------------|----------|
| **Web Bluetooth** | Chrome, Edge, Opera | BLE devices |
| **Web Serial** | Chrome, Edge, Opera | Serial ports |
| **WebUSB** | Chrome, Edge, Opera | USB devices |
| **Gamepad API** | All major browsers | Game controllers |
| **Web MIDI** | Chrome, Edge, Opera | MIDI instruments |
| **Geolocation** | All major browsers | GPS |
| **DeviceOrientation** | All major browsers | Accelerometer |
| **Battery Status** | Chrome, Edge, Opera | Battery level |
| **Network Information** | Chrome, Edge, Opera | Connection info |

### Bluetooth Services Supported

```javascript
const BLUETOOTH_SERVICES = [
  'heart_rate',           // ❤️ Heart rate monitors
  'battery_service',      // 🔋 Battery level
  'device_information',   // ℹ️ Device info
  'health_thermometer',   // 🌡️ Temperature sensors
  'weight_scale',         // ⚖️ Smart scales
  'generic_access',       // Generic BLE
  'generic_attribute'     // Generic BLE
];
```

### Serial Port Configuration

| Setting | Options | Default |
|---------|---------|---------|
| Baud Rate | 9600, 19200, 38400, 57600, 115200 | 115200 |
| Data Bits | 8 | 8 |
| Stop Bits | 1 | 1 |

### Gamepad Visualizer

- **Axes**: Up to 4 axes shown with real-time bars
- **Buttons**: Up to 16 buttons with press indicators
- **Polling Rate**: 50ms (20Hz)

### Location Data Fields

| Field | Description |
|-------|-------------|
| Latitude | GPS latitude in degrees |
| Longitude | GPS longitude in degrees |
| Accuracy | Position accuracy in meters |
| Altitude | Height above sea level (if available) |
| Speed | Movement speed in km/h (if available) |
| Heading | Direction in degrees (if available) |

### Device Sensors

| Sensor | Data Points |
|--------|-------------|
| Orientation | Alpha (Z), Beta (X), Gamma (Y) rotation |
| Motion | X, Y, Z acceleration |
| Battery | Level %, charging status, time to full |

### Connectivity Requirements

⚠️ **Most device APIs require:**
- HTTPS connection (or localhost for development)
- User permission grants
- Compatible browser (Chrome recommended)

---

## 🎯 Quick Reference

### Voice Commands (Core-routed)

| Command | Action |
|---------|--------|
| "Open [module]" | Switch to module |
| "Go to core" | Return to Core |
| "Show status" | Open dashboard |
| "Talk to GRACE" | Activate voice input |

### Module-Specific Commands

| Module | Commands |
|--------|----------|
| Builder | "Start capture", "Add measurement", "Generate scope" |
| SiteOps | "Show programme", "What's blocked?", "Add issue" |
| Uplift | "I need help", "Breathing exercise", "Ground me" |

---

## 🔐 Character Anchor (LOCKED — DO NOT MODIFY)

> *"GRACE-X AI™ speaks with a calm, grounded UK voice that prioritises clarity, safety, and human connection, adapting tone by context while remaining consistent in identity."*

---

## 📜 Copyright & Attribution

```
GRACE-X AI™ Ecosystem
Engineered by Zac Crockett

Sport Module: © Zac Crockett & Jason Treadaway

All Rights Reserved.
```

---

*End of System Summary*

