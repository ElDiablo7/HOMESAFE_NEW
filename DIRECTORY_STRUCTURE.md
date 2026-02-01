# GRACE-X AI™ — Directory Structure

```
GRACEX/
│
├── 📄 START.bat              ⭐ WINDOWS: Double-click to start
├── 📄 START.sh               ⭐ LINUX/MAC: Run to start  
├── 📄 STOP.bat               🛑 WINDOWS: Stop all servers
├── 📄 STOP.sh                🛑 LINUX/MAC: Stop all servers
├── 📄 README.md              📖 Quick start guide
├── 📄 index.html             🏠 Main entry point
│
├── 📁 server/                🧠 Backend API (Node.js)
│   ├── server.js             Main server file
│   ├── package.json          Dependencies
│   ├── .env                  API keys (create from env.example.txt)
│   └── env.example.txt       Template for .env
│
├── 📁 modules/               🎛️ All 17 modules
│   ├── core.html             ⚙️ Central hub & navigation
│   ├── builder.html          🔧 Construction/trades
│   ├── siteops.html          🏗️ Project management
│   ├── uplift.html           💙 Mental health support
│   ├── guardian.html         🛡️ Safeguarding
│   ├── family.html           👨‍👩‍👧‍👦 Family hub
│   ├── sport.html            ⚽ Sports analytics
│   ├── fit.html              💪 Fitness
│   ├── yoga.html             🧘 Mindfulness
│   ├── chef.html             👨‍🍳 Cooking & fakeaways
│   ├── beauty.html           💄 Beauty & skincare
│   ├── artist.html           🎨 Creativity
│   ├── gamer.html            🎮 Gaming
│   ├── accounting.html       💰 Finance
│   ├── tradelink.html        📈 Trading
│   ├── osint.html            🔍 Intelligence
│   └── forge.html            ⚒️ Engineering bay
│
├── 📁 assets/                🎨 Shared resources
│   ├── 📁 js/                JavaScript files
│   │   ├── core.js           Core logic
│   │   ├── brainV5Helper.js  AI integration
│   │   ├── voiceTTS.js       Text-to-speech
│   │   ├── speechQueue.js    Voice queue
│   │   ├── [module].js       Module-specific JS
│   │   └── ...
│   ├── 📁 css/               Stylesheets
│   │   ├── gracex-v6.css     Main styles
│   │   ├── [module].css      Module styles
│   │   └── ...
│   ├── 📁 audio/             Voice files
│   │   └── voices/           Module intro voices
│   ├── 📁 img/               Images
│   └── 📁 video/             Videos (if any)
│
├── 📁 config/                ⚙️ Configuration files
│
├── 📁 docs/                  📚 Module documentation
│   ├── OSINT_README.md
│   ├── accounting_readme.md
│   ├── forge_readme.md
│   └── ...
│
├── 📁 archive/               🗄️ Old documentation
│   └── documents/            Historical dev docs
│
├── 📄 CHANGELOG_v6.4.1.md           📝 Recent updates
├── 📄 DEPLOYMENT_SUMMARY_v6.4.1.md  📋 Deploy guide
├── 📄 VOICE_REFERENCE_v6.4.1.md     🎙️ Voice guide
└── 📄 GRACEX_SYSTEM_SUMMARY.md      📊 Full system overview

```

---

## 🎯 Key Files to Know

### Start/Stop (Most Important!)
- **START.bat** / **START.sh** — One-click launch
- **STOP.bat** / **STOP.sh** — One-click shutdown
- **README.md** — Quick reference

### Configuration
- **server/.env** — API keys (copy from env.example.txt)
- **config/** — System configuration

### Documentation
- **DEPLOYMENT_SUMMARY_v6.4.1.md** — How to deploy
- **CHANGELOG_v6.4.1.md** — What changed
- **GRACEX_SYSTEM_SUMMARY.md** — Complete overview
- **docs/** — Module-specific help

### Development
- **server/server.js** — Backend API server
- **assets/js/brainV5Helper.js** — AI integration
- **assets/js/core.js** — Core system logic

---

## 📦 Clean Structure

✅ **Removed:**
- `/legacy` — Old backups (2MB saved)
- `/forge-builds` — Test builds
- Old start scripts (START_GRACEX.bat, etc.)
- Unused module files

✅ **Archived:**
- `/archive/documents` — Historical dev docs

✅ **Added:**
- Simple START/STOP scripts
- Clear README
- Updated documentation

---

## 🚀 Production Ready

This structure is now:
- ✅ Clean and organized
- ✅ Easy to navigate
- ✅ Simple to deploy
- ✅ Well documented
- ✅ 2MB+ lighter

---

**GRACE-X AI™ v6.4.1**  
*Engineered by Zac Crockett*
