# 🚀 QUICK SETUP - Free Tier Configurations

**GRACE-X Sport™ v7.0** - Provider Switching Guide  
**© Zac Crockett & Jason Treadaway**

---

## 🎯 CHOOSE YOUR SETUP

Pick one of these configurations and copy to your `server/.env` file:

---

## 📋 OPTION 1: 100% FREE UNLIMITED ⭐ RECOMMENDED

**Perfect for**: Most users  
**Cost**: £0/month forever  
**Limitations**: None (truly unlimited!)

### Copy this to `.env`:

```env
# OPTION 1: 100% FREE UNLIMITED
# ================================

# Football - Unlimited (10 requests/min)
FOOTBALL_PROVIDER=football-data
FOOTBALL_DATA_API_KEY=your_free_key_from_football-data.org

# Basketball - Unlimited
BASKETBALL_PROVIDER=balldontlie
# No key needed!

# Baseball - Unlimited
BASEBALL_PROVIDER=mlb-official
# No key needed!

# F1 - Unlimited
F1_PROVIDER=ergast
# No key needed!

# Betting Odds - 500/month
ODDS_PROVIDER=theoddsapi
THE_ODDS_API_KEY=your_free_key_from_the-odds-api.com

# Tennis - Mock data (or add RapidAPI key)
TENNIS_PROVIDER=mock

# Other sports - Mock data
CRICKET_PROVIDER=mock
RACING_PROVIDER=mock
NFL_PROVIDER=mock
GOLF_PROVIDER=mock
MMA_PROVIDER=mock

# Caching (maximize free tier)
SPORTS_CACHE_DURATION=10
```

### Get Your Keys (2 minutes):

1. **Football-Data.org** (Unlimited!)
   - Go to: https://www.football-data.org/client/register
   - Free tier: 10 requests/minute (unlimited daily)
   - Copy API key to `FOOTBALL_DATA_API_KEY`

2. **The Odds API** (500/month)
   - Go to: https://the-odds-api.com/
   - Free tier: 500 requests/month
   - Copy API key to `THE_ODDS_API_KEY`

3. **Done!** Basketball, Baseball, and F1 need no keys!

---

## 📋 OPTION 2: RAPIDAPI STARTER (Easy Single Key)

**Perfect for**: Simple setup, one account  
**Cost**: £0/month (100 requests/day per sport)  
**Limitations**: 100/day total across all RapidAPI sports

### Copy this to `.env`:

```env
# OPTION 2: RAPIDAPI STARTER
# ================================

# One key for multiple sports!
RAPIDAPI_KEY=your_rapidapi_key_here

# Football - 100/day
FOOTBALL_PROVIDER=rapidapi

# Basketball - 100/day
BASKETBALL_PROVIDER=rapidapi

# Tennis - 100/day
TENNIS_PROVIDER=rapidapi

# Racing - 100/day
RACING_PROVIDER=rapidapi

# Betting Odds - 500/month
ODDS_PROVIDER=theoddsapi
THE_ODDS_API_KEY=your_free_key_here

# F1 - Unlimited (no key needed)
F1_PROVIDER=ergast

# Baseball - Unlimited (no key needed)
BASEBALL_PROVIDER=mlb-official

# Caching (important for 100/day limit!)
SPORTS_CACHE_DURATION=5
SMART_CACHE=true
```

### Get Your Keys (3 minutes):

1. **RapidAPI** (One key for everything!)
   - Go to: https://rapidapi.com/
   - Sign up for free account
   - Subscribe to these (all have 100/day free):
     * API-Football
     * API-Basketball  
     * Tennis Live Data
     * Horse Racing API
   - Copy your **same** key to `RAPIDAPI_KEY`

2. **The Odds API**
   - Go to: https://the-odds-api.com/
   - Copy key to `THE_ODDS_API_KEY`

---

## 📋 OPTION 3: MAXIMUM COVERAGE (Best Quality)

**Perfect for**: Power users who want everything  
**Cost**: £0/month  
**Limitations**: Different limits per sport (all manageable)

### Copy this to `.env`:

```env
# OPTION 3: MAXIMUM COVERAGE
# ================================

# Football - Unlimited!
FOOTBALL_PROVIDER=football-data
FOOTBALL_DATA_API_KEY=your_football_data_key

# Basketball - Unlimited!
BASKETBALL_PROVIDER=balldontlie

# Baseball - Unlimited!
BASEBALL_PROVIDER=mlb-official

# F1 - Unlimited!
F1_PROVIDER=ergast

# Cricket - 100/day
CRICKET_PROVIDER=cricapi
CRICAPI_KEY=your_cricapi_key

# Racing - 100/day
RACING_PROVIDER=theracingapi
RACING_API_KEY=your_racing_api_key

# Tennis - 100/day
TENNIS_PROVIDER=rapidapi
RAPIDAPI_KEY=your_rapidapi_key

# Betting Odds - 500/month
ODDS_PROVIDER=theoddsapi
THE_ODDS_API_KEY=your_odds_api_key

# NFL - Free (no key)
NFL_PROVIDER=espn-unofficial

# Golf, MMA - 100/day
GOLF_PROVIDER=rapidapi
MMA_PROVIDER=rapidapi

# Advanced caching
SPORTS_CACHE_DURATION=5
CACHE_LIVE_SCORES=2
CACHE_FIXTURES=15
CACHE_STANDINGS=60
SMART_CACHE=true
```

### Get Your Keys (10 minutes):

All free tiers! See `FREE_SPORTS_API_GUIDE.md` for signup links.

---

## 📋 OPTION 4: OFFLINE MODE (No APIs)

**Perfect for**: Testing, development, no internet  
**Cost**: £0  
**Limitations**: Mock data only (no real scores)

### Copy this to `.env`:

```env
# OPTION 4: OFFLINE MODE
# ================================

# Use mock data for everything
USE_MOCK_DATA=true

# All providers set to mock
FOOTBALL_PROVIDER=mock
BASKETBALL_PROVIDER=mock
TENNIS_PROVIDER=mock
CRICKET_PROVIDER=mock
BASEBALL_PROVIDER=mock
RACING_PROVIDER=mock
NFL_PROVIDER=mock
F1_PROVIDER=mock
GOLF_PROVIDER=mock
MMA_PROVIDER=mock
ODDS_PROVIDER=mock

# No API keys needed!
# Great for testing UI without API costs
```

---

## 🔄 SWITCHING PROVIDERS (SUPER EASY!)

### Example: Switch football from Football-Data to RapidAPI

**Before:**
```env
FOOTBALL_PROVIDER=football-data
FOOTBALL_DATA_API_KEY=abc123
```

**After:**
```env
FOOTBALL_PROVIDER=rapidapi
RAPIDAPI_KEY=xyz789
```

**That's it!** Restart server and you're using RapidAPI!

### Switch Multiple Sports at Once:

```env
# Switch everything to RapidAPI
FOOTBALL_PROVIDER=rapidapi
BASKETBALL_PROVIDER=rapidapi
TENNIS_PROVIDER=rapidapi
RACING_PROVIDER=rapidapi

# One key for all of them
RAPIDAPI_KEY=your_key_here
```

---

## 💡 PROVIDER CHEAT SHEET

| Provider | Sports | Free Tier | Key Needed? |
|----------|--------|-----------|-------------|
| football-data | Football | 10/min (unlimited!) | ✅ Yes |
| balldontlie | NBA | Unlimited | ❌ No |
| ergast | F1 | Unlimited | ❌ No |
| mlb-official | Baseball | Unlimited | ❌ No |
| espn-unofficial | NFL | Free | ❌ No |
| rapidapi | 10+ sports | 100/day each | ✅ Yes (one key) |
| theoddsapi | Betting | 500/month | ✅ Yes |
| cricapi | Cricket | 100/day | ✅ Yes |
| theracingapi | Racing | 100/day | ✅ Yes |
| mock | All | Unlimited | ❌ No |

---

## 🎯 RECOMMENDED BY USE CASE

### Casual Fan (Check scores daily):
```env
FOOTBALL_PROVIDER=football-data   # Unlimited
BASKETBALL_PROVIDER=balldontlie    # Unlimited
F1_PROVIDER=ergast                 # Unlimited
BASEBALL_PROVIDER=mlb-official     # Unlimited
ODDS_PROVIDER=mock                 # Don't need odds
```
**Cost**: £0 | **Setup Time**: 2 min | **Limits**: None

---

### Sports Bettor (Need live odds):
```env
FOOTBALL_PROVIDER=football-data   # Unlimited
BASKETBALL_PROVIDER=balldontlie    # Unlimited
ODDS_PROVIDER=theoddsapi           # 500/month (enough!)
SPORTS_CACHE_DURATION=2            # Fresh odds
```
**Cost**: £0 | **Setup Time**: 5 min | **Limits**: 500 odds/month

---

### Multi-Sport Fan (Follow everything):
```env
# Get RapidAPI key for convenience
RAPIDAPI_KEY=your_key
FOOTBALL_PROVIDER=rapidapi
BASKETBALL_PROVIDER=rapidapi
TENNIS_PROVIDER=rapidapi
RACING_PROVIDER=rapidapi
# Plus free unlimited APIs
F1_PROVIDER=ergast
BASEBALL_PROVIDER=mlb-official
ODDS_PROVIDER=theoddsapi
```
**Cost**: £0 | **Setup Time**: 10 min | **Limits**: 100/day per sport

---

### Developer (Testing/Development):
```env
USE_MOCK_DATA=true
# Test UI without burning API credits
```
**Cost**: £0 | **Setup Time**: 0 min | **Limits**: Mock data only

---

## ⚙️ ADVANCED OPTIMIZATION

### Maximize Free Tier Usage:

```env
# Aggressive caching
SPORTS_CACHE_DURATION=10

# Smart features
SMART_CACHE=true
SMART_LIVE_DETECTION=true
BATCH_REQUESTS=true

# Usage tracking
TRACK_API_USAGE=true
USAGE_WARNING_THRESHOLD=80
ENFORCE_RATE_LIMITS=true
```

### Cache Duration Guide:

```env
# Live matches (2 min - very fresh)
CACHE_LIVE_SCORES=2

# Fixtures (15 min - stable)
CACHE_FIXTURES=15

# Standings (60 min - changes slowly)
CACHE_STANDINGS=60

# Odds (5 min - balance freshness & usage)
CACHE_ODDS=5

# Stats (30 min - historical data)
CACHE_STATS=30
```

---

## 🧪 TESTING YOUR SETUP

### 1. Check Server Starts:
```bash
cd server
npm start
```

### 2. Test API Status:
```bash
curl http://localhost:3000/api/sports/status
```

Should show your configured providers and key status.

### 3. Test Each Sport:
```bash
# Football
curl http://localhost:3000/api/sports/football/live

# Basketball
curl http://localhost:3000/api/sports/basketball/live

# Odds
curl http://localhost:3000/api/sports/odds/soccer_epl
```

### 4. Check Browser:
1. Open TITAN in browser
2. Go to Sport module
3. Click "Refresh"
4. Verify data loads

---

## 🆘 QUICK TROUBLESHOOTING

### "Failed to load scores"
```env
# Check your provider setting
FOOTBALL_PROVIDER=football-data

# Make sure you have the right key
FOOTBALL_DATA_API_KEY=your_actual_key_not_placeholder

# Or switch to free option
FOOTBALL_PROVIDER=mock  # Works immediately
```

### "Rate limit exceeded"
```env
# Increase cache duration
SPORTS_CACHE_DURATION=15

# Enable smart caching
SMART_CACHE=true

# Or switch to unlimited provider
FOOTBALL_PROVIDER=football-data  # Instead of rapidapi
```

### "Invalid API key"
```env
# Make sure key is correct (no quotes needed)
RAPIDAPI_KEY=abc123xyz789   # ✅ Correct
RAPIDAPI_KEY="abc123"       # ❌ Wrong (no quotes!)
RAPIDAPI_KEY= abc123        # ❌ Wrong (no spaces!)
```

---

## 📊 USAGE MONITORING

With tracking enabled:
```env
TRACK_API_USAGE=true
```

Check usage in server logs:
```
✅ football-data: 45/600 hourly (7.5%)
⚠️  theoddsapi: 423/500 monthly (84.6%)
```

Or via API:
```bash
curl http://localhost:3000/api/sports/usage
```

---

## 🎓 LEARNING PATH

### Day 1: Start Simple
- Use OPTION 1 (100% Free Unlimited)
- Just football-data + theoddsapi
- Learn the basics

### Day 2: Add Sports
- Enable basketball (balldontlie - no key!)
- Enable F1 (ergast - no key!)
- Still £0/month

### Week 1: Optimize
- Monitor usage
- Adjust cache durations
- Add more sports as needed

### Month 1: Go Pro (if needed)
- Evaluate if you need paid tiers
- Most users stay on free tier forever!

---

## 💰 WHEN TO UPGRADE (Rarely Needed)

Stay on free tier if:
- ✅ Checking scores a few times daily
- ✅ Following 2-3 sports
- ✅ Using caching properly
- ✅ Not running commercial service

Consider upgrading if:
- ⚠️ Hitting rate limits daily
- ⚠️ Need scores every 30 seconds
- ⚠️ Running public website
- ⚠️ Commercial use

Most users never need to upgrade!

---

## ⚖️ COPYRIGHT

**GRACE-X Sport™** - © 2025 Zac Crockett & Jason Treadaway  
All Rights Reserved

---

**Last Updated**: December 25, 2025  
**Version**: 7.0.0  
**Total Free Options**: 30+ APIs  
**Average Setup Time**: 2-10 minutes
