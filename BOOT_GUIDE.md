# 🚀 TITAN BOOT GUIDE - FIXED & READY!

**GRACE-X Sport™ v7.1 with Voice Assistant**  
**© Zac Crockett & Jason Treadaway**

---

## ⚡ QUICK BOOT (30 SECONDS)

### 1. Extract Package
```bash
unzip TITAN_V7.1_SPORT_FREE_TIER_COMPLETE.zip
cd TITAN_V7.1_SPORT_FREE_TIER_COMPLETE
```

### 2. Start Server
```bash
# Windows:
START.bat

# Linux/Mac:
chmod +x START.sh
./START.sh
```

### 3. Open Browser
```
http://localhost:3000
```
Or just double-click `index.html`

### 4. ✅ DONE! System is running!

---

## 🎤 VOICE ASSISTANT - FIXED!

### How to Activate Voice:

**Method 1: Auto-Activation (Recommended)**
1. System loads
2. Click "Allow" when browser asks for microphone
3. You'll see: "🎤 Say Hey Gracie to talk!"
4. Just say: **"Hey Gracie"** or **"Ok Grace"**
5. Speak your command
6. Gracie responds!

**Method 2: Manual Activation**
1. Click the 🔊 button (bottom right)
2. Say your command
3. Gracie responds!

### Wake Words That Work:
✅ "Hey Gracie"  
✅ "Ok Gracie"  
✅ "Hey Grace"  
✅ "Ok Grace"  
✅ "Okay Grace"  
✅ "Hi Gracie"  

### Example Conversation:
```
YOU: "Hey Gracie"
GRACIE: "Yes?" [listening indicator appears]
YOU: "What's the weather like?"
GRACIE: [responds with weather info]
```

### Troubleshooting Voice:

**❌ "Microphone access denied"**
- Click 🔊 button (bottom right)
- Browser will ask for permission
- Click "Allow"
- Voice will activate

**❌ "Wake word not working"**
- Speak clearly and slowly
- Use one of the exact wake words above
- Make sure mic button shows 🔊 (not 🔇)
- Try clicking the mic button first

**❌ "Can't hear Gracie respond"**
- Check volume is up
- Right-click 🔊 button → Enable voice responses
- Check browser hasn't muted the tab

---

## 🏆 SPORT MODULE - ALL WORKING!

### Default Configuration (Works Immediately):
```env
✅ All sports set to MOCK mode
✅ No API keys needed
✅ Works offline
✅ Perfect for testing
```

### To Get REAL Live Data (Optional):

**Edit** `server/.env`:

```env
# Switch to FREE unlimited providers:
FOOTBALL_PROVIDER=football-data
BASKETBALL_PROVIDER=balldontlie
F1_PROVIDER=ergast
BASEBALL_PROVIDER=mlb-official

# Add just 2 free API keys:
FOOTBALL_DATA_API_KEY=get_free_from_football-data.org
THE_ODDS_API_KEY=get_free_from_the-odds-api.com
```

**Get Free Keys:**
1. Football-Data.org: https://www.football-data.org/client/register
2. The Odds API: https://the-odds-api.com

**Restart server** and you have unlimited free live data! 🎯

---

## 🔧 SYSTEM STATUS CHECK

After booting, verify everything works:

### 1. Server Check
```bash
curl http://localhost:3000/health
```
**Expected:** `{"status":"ok",...}`

### 2. Sports API Check
```bash
curl http://localhost:3000/api/sports/status
```
**Expected:** Shows all providers in MOCK mode

### 3. Browser Check
- Open http://localhost:3000
- Click Sport module
- Click "Refresh"
- See mock match data load
- Connection badge shows "🟡 Simulated"

### 4. Voice Check
- Boot complete
- Browser asks for mic (click Allow)
- Status shows "🎤 Say Hey Gracie"
- Say "Hey Gracie"
- Should hear "Yes?"
- Say "Hello"
- Should respond!

---

## 📊 WHAT'S BOOTING?

### Core Systems:
✅ Node.js Server (port 3000)  
✅ Brain API (Anthropic Claude Sonnet 4)  
✅ Sports API Service (Mock mode)  
✅ All 17 GRACE-X modules  
✅ Voice Assistant (Wake word detection)  
✅ Text-to-Speech (UK English voice)  
✅ UI Framework  

### Sport Module Status:
✅ Football: Mock data ready  
✅ Basketball: Mock data ready  
✅ Tennis: Mock data ready  
✅ Racing: Mock data ready  
✅ All 14 sports: Mock mode working  
✅ Auto-refresh: Available  
✅ AI predictions: Working  
✅ Connection: Offline mode ✓  

---

## 🎯 FIRST STEPS AFTER BOOT

### 1. Test Voice Assistant
```
Say: "Hey Gracie"
Wait for: "Yes?"
Say: "What can you do?"
```

### 2. Explore Sport Module
- Click "Sport" in menu
- Browse different sports
- Click "Get AI Predictions"
- Try the AI assistant

### 3. Test Other Modules
- Builder (build custom modules)
- Core (main AI chat)
- SiteOps (system operations)
- All 17 modules ready!

### 4. (Optional) Connect Real APIs
- Edit server/.env
- Add free API keys
- Restart server
- Get live data!

---

## 🔍 BOOT TROUBLESHOOTING

### ❌ Server Won't Start

**Problem:** "Port 3000 already in use"
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

**Problem:** "Cannot find module"
```bash
cd server
npm install
npm start
```

**Problem:** ".env file missing"
```bash
# Already configured! Should work.
# But if needed:
cd server
cp .env.complete.example .env
```

---

### ❌ Browser Issues

**Problem:** "Can't connect to localhost"
- Make sure server is running (check Terminal)
- Try: http://127.0.0.1:3000
- Or just open index.html directly

**Problem:** "Module won't load"
- Hard refresh: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
- Clear cache
- Try different browser (Chrome recommended)

**Problem:** "Sport data not loading"
- **This is NORMAL in mock mode!**
- Mock data shows sample matches
- For real data, add API keys (optional)

---

### ❌ Voice Issues (FIXED!)

**Problem:** "Wake word not detected"
**Solution:**
1. Check mic permissions (click 🔊 button)
2. Speak clearly: "Hey Gracie"
3. Wait for "Yes?" response
4. Then speak your command

**Problem:** "Mic button is 🔇"
**Solution:**
- Click the button to toggle ON (🔊)
- Browser will request mic access
- Click "Allow"

**Problem:** "No response from Gracie"
**Solution:**
- Check volume is on
- Right-click 🔊 → Voice Settings
- Enable voice responses
- Try: "Hey Gracie, hello"

---

## 💡 PRO TIPS

### Voice Assistant Pro Tips:
1. **Speak naturally** - No need to be robotic
2. **Wait for "Yes?"** - Confirms she's listening
3. **Be specific** - "Show me football scores" works better than "sports"
4. **One command at a time** - She processes one request per activation
5. **15-second window** - You have 15 seconds to speak after wake word

### Sport Module Pro Tips:
1. **Mock mode is instant** - No API delays
2. **Cache is smart** - Saves API calls
3. **Auto-refresh** - Toggle for live matches only
4. **Provider switching** - Change any provider in 1 line
5. **Free tier setup** - Takes 2 minutes, works forever

### System Pro Tips:
1. **Use Chrome** - Best compatibility
2. **Keep Terminal open** - See server logs
3. **Check status endpoints** - `/api/sports/status`, `/health`
4. **Read the logs** - They tell you what's happening
5. **Restart fixes most issues** - Stop server, start again

---

## 📋 BOOT CHECKLIST

Before you start:
- [ ] Extracted zip file
- [ ] In correct directory
- [ ] Terminal/Command Prompt ready

After START.bat/START.sh:
- [ ] Server shows "Running on port 3000"
- [ ] No errors in Terminal
- [ ] Can access http://localhost:3000
- [ ] TITAN UI loads
- [ ] Mic permission granted (click Allow)
- [ ] Voice status shows "Ready"
- [ ] Sport module loads
- [ ] All modules accessible

If ALL checked: ✅ **SYSTEM FULLY OPERATIONAL!**

---

## 🎮 TESTING COMMANDS

### Voice Commands to Try:
```
"Hey Gracie, what time is it?"
"Hey Gracie, tell me about football"
"Ok Grace, show me the weather"
"Hey Gracie, what can you do?"
"Ok Gracie, help me with coding"
```

### Sport Module Actions:
- Click different sport buttons (⚽🏀🎾)
- Click "🔄 Refresh"
- Click "🎯 Get AI Predictions"
- Click "⏰ Auto: ON"
- Try AI chat in Sport module

### System Checks:
```bash
# Health
curl http://localhost:3000/health

# Sports status
curl http://localhost:3000/api/sports/status

# Sports data
curl http://localhost:3000/api/sports/football/live
```

---

## 🆘 STILL HAVING ISSUES?

### Quick Fixes:

**1. Complete Restart:**
```bash
# Stop everything
Ctrl+C in Terminal
Close browser

# Fresh start
START.bat (or START.sh)
Open browser
Navigate to localhost:3000
```

**2. Check Browser Console:**
- Press F12
- Click "Console" tab
- Look for errors
- Take screenshot if asking for help

**3. Check Server Logs:**
- Look at Terminal/Command Prompt
- Any red errors?
- Take screenshot

**4. Reset to Defaults:**
```bash
cd server
mv .env .env.backup
echo "USE_MOCK_DATA=true" > .env
echo "LLM_PROVIDER=anthropic" >> .env
npm start
```

---

## ✅ SUCCESS INDICATORS

You know it's working when:

✅ Server shows:
```
╔══════════════════════════════════════════╗
║   🚀  GRACE-X Brain API Server v2.0     ║
║   📡  Port:      3000                    ║
║   🔒  API Key:   ✓ Configured            ║
╚══════════════════════════════════════════╝
```

✅ Browser shows:
- GRACE-X logo/boot screen
- Module menu loads
- Sport module accessible
- Voice button visible (🔊)
- Status indicator present

✅ Voice works:
- Say "Hey Gracie"
- Hear "Yes?"
- She responds to commands
- Indicator shows listening

✅ Sport works:
- Mock data loads
- Predictions generate
- AI chat responds
- No errors shown

---

## 🎉 YOU'RE READY!

If you see all the success indicators above, **you're fully booted and ready to go!**

### Next Steps:
1. ✅ Explore all 17 modules
2. ✅ Talk to Gracie via voice
3. ✅ Test Sport predictions
4. ✅ (Optional) Add real API keys for live data
5. ✅ Customize to your needs

---

## 📞 SUPPORT

**Documentation:**
- QUICK_SETUP_FREE_TIERS.md - API configuration
- FREE_SPORTS_API_GUIDE.md - All free APIs
- SPORT_MODULE_V7_UPGRADE_GUIDE.md - Technical docs

**Common Issues:**
- Voice not working → Click 🔊, allow mic
- Sport data not loading → Normal in mock mode
- Server won't start → Run `npm install`

**Contact:**
- Zac Crockett (Primary Owner - 51%)
- Jason Treadaway (Co-Owner - 49%)

---

## 🔥 QUICK REFERENCE

```bash
# START
START.bat (Windows)
./START.sh (Linux/Mac)

# STOP
Ctrl+C in Terminal

# RESTART
Ctrl+C, then START again

# CHECK STATUS
curl http://localhost:3000/health

# VIEW LOGS
Look at Terminal/Command Prompt

# VOICE ACTIVATE
Say: "Hey Gracie"
Or click: 🔊 button

# TEST SPORT
http://localhost:3000 → Sport → Refresh
```

---

**System Version:** TITAN v7.1 Free Tier Edition  
**Status:** Production Ready ✅  
**Voice:** Fixed & Working ✅  
**Sport APIs:** 30+ Free Tiers Available ✅  
**Boot Time:** ~5-10 seconds ✅

**ENJOY YOUR GRACE-X SYSTEM!** 🏆
