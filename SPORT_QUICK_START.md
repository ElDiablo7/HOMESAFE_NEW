# 🚀 QUICK START - GRACE-X Sport™ v7.0

## ⚡ 60-Second Setup

### 1. Get API Keys (5 minutes)
- **RapidAPI (Football)**: https://rapidapi.com/api-sports/api/api-football
  - Sign up → Subscribe (Free 100/day) → Copy API key
- **The Odds API (Betting)**: https://the-odds-api.com
  - Sign up → Get API key (Free 500/month)

### 2. Configure (30 seconds)
Edit `server/.env`:
```env
RAPIDAPI_KEY=paste_your_key_here
THE_ODDS_API_KEY=paste_your_key_here
```

### 3. Install (30 seconds)
```bash
# Windows
install_sport_upgrade.bat

# Linux/Mac
chmod +x install_sport_upgrade.sh
./install_sport_upgrade.sh
```

### 4. Start Server
```bash
cd server
npm start
```

### 5. Test
Open TITAN → Navigate to Sport module → Click "Refresh"

---

## 🎯 Key Features

| Feature | Action | Result |
|---------|--------|--------|
| **Live Scores** | Click sport → Refresh | Real-time match data |
| **Auto-Refresh** | Toggle "Auto: ON" | Updates every 30s |
| **Predictions** | Click "Get AI Predictions" | AI analysis & odds |
| **Betting Odds** | Click "Get Odds" | Real bookmaker prices |
| **Racing** | Click "Get Racing Data" | Race cards & tips |
| **AI Assistant** | Type question → Ask | Sports analysis |

---

## 📋 API Endpoints

Test these in your browser or with curl:

```bash
# Live football scores
http://localhost:3000/api/sports/football/live

# Today's fixtures
http://localhost:3000/api/sports/football/fixtures

# Betting odds
http://localhost:3000/api/sports/odds/soccer_epl

# Basketball
http://localhost:3000/api/sports/basketball/live

# Tennis
http://localhost:3000/api/sports/tennis/live

# Racing
http://localhost:3000/api/sports/racing/cards
```

---

## 🐛 Quick Troubleshoot

| Problem | Solution |
|---------|----------|
| "Failed to load scores" | Add API keys to `.env` |
| "Connection: Offline" | Start server: `npm start` |
| Mock data showing | Verify API keys are correct |
| Server won't start | Run `npm install` in server/ |

---

## 💡 Pro Tips

1. **Free Tier Limits**:
   - RapidAPI: 100 requests/day
   - Odds API: 500 requests/month
   - Cache reduces API calls (5min default)

2. **Best Performance**:
   - Enable auto-refresh for live matches only
   - Use manual refresh during low activity
   - Clear cache if data seems stale

3. **Cost Saving**:
   - Mock data works without API keys
   - Upgrade APIs only when needed
   - Set longer cache duration in `.env`

---

## 📞 Need Help?

1. Check `SPORT_MODULE_V7_UPGRADE_GUIDE.md` (full docs)
2. Review server console for errors
3. Test endpoints with curl/browser
4. Contact: Zac Crockett (Primary Owner)

---

**Version**: 7.0.0  
**Status**: Production Ready ✅  
**License**: © Zac Crockett & Jason Treadaway
