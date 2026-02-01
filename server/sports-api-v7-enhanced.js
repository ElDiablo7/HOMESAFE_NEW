// ============================================
// GRACE-X Sport™ API Service v7.0 Enhanced
// © Zac Crockett & Jason Treadaway
// ============================================
// Multi-Provider Sports Data Service
// Supports 30+ free tier APIs with easy switching
// ============================================

const https = require('https');
const http = require('http');

// Configuration from environment
const CONFIG = {
  football: process.env.FOOTBALL_PROVIDER || 'football-data',
  basketball: process.env.BASKETBALL_PROVIDER || 'balldontlie',
  tennis: process.env.TENNIS_PROVIDER || 'rapidapi',
  cricket: process.env.CRICKET_PROVIDER || 'cricapi',
  baseball: process.env.BASEBALL_PROVIDER || 'mlb-official',
  racing: process.env.RACING_PROVIDER || 'theracingapi',
  nfl: process.env.NFL_PROVIDER || 'espn-unofficial',
  f1: process.env.F1_PROVIDER || 'ergast',
  golf: process.env.GOLF_PROVIDER || 'rapidapi',
  mma: process.env.MMA_PROVIDER || 'rapidapi',
  odds: process.env.ODDS_PROVIDER || 'theoddsapi',
  cacheDuration: (process.env.SPORTS_CACHE_DURATION || 5) * 60 * 1000,
  useMockData: process.env.USE_MOCK_DATA === 'true',
  fallbackMode: process.env.FALLBACK_MODE || 'mock',
  trackUsage: process.env.TRACK_API_USAGE === 'true'
};

// API Keys
const KEYS = {
  rapidapi: process.env.RAPIDAPI_KEY,
  footballData: process.env.FOOTBALL_DATA_API_KEY,
  theOddsApi: process.env.THE_ODDS_API_KEY,
  cricapi: process.env.CRICAPI_KEY,
  racingApi: process.env.RACING_API_KEY,
  apiSports: process.env.API_SPORTS_KEY,
  theSportsDb: process.env.THESPORTSDB_API_KEY || '3', // Free tier key
  oddsApiIo: process.env.ODDSAPI_IO_KEY,
  betfair: {
    appKey: process.env.BETFAIR_APP_KEY,
    sessionToken: process.env.BETFAIR_SESSION_TOKEN
  }
};

// In-memory cache
const cache = new Map();

// Usage tracking
const usage = {
  rapidapi: { calls: 0, limit: 100, window: 'daily' },
  footballData: { calls: 0, limit: 600, window: 'hourly' }, // 10/min
  theOddsApi: { calls: 0, limit: 500, window: 'monthly' },
  cricapi: { calls: 0, limit: 100, window: 'daily' }
};

/**
 * Generic HTTP request helper
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Cache helper functions
 */
function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG.cacheDuration) {
    console.log(`✅ Cache HIT: ${key}`);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached: ${key}`);
}

function clearCache() {
  const size = cache.size;
  cache.clear();
  console.log(`🗑️  Cleared ${size} cache entries`);
}

/**
 * Usage tracking
 */
function trackApiCall(provider) {
  if (!CONFIG.trackUsage) return;
  if (usage[provider]) {
    usage[provider].calls++;
    const percent = (usage[provider].calls / usage[provider].limit) * 100;
    if (percent >= 80) {
      console.warn(`⚠️  ${provider} usage at ${percent.toFixed(1)}%`);
    }
  }
}

// ============================================
// FOOTBALL/SOCCER PROVIDERS
// ============================================

/**
 * Football-Data.org (Unlimited free!)
 */
async function getFootballFromFootballData() {
  const apiKey = KEYS.footballData;
  if (!apiKey || apiKey === 'your_football_data_key_here') {
    throw new Error('Football-Data API key not configured');
  }

  trackApiCall('footballData');
  
  const url = 'https://api.football-data.org/v4/matches';
  const options = {
    headers: { 'X-Auth-Token': apiKey }
  };

  const data = await makeRequest(url, options);
  return formatFootballDataMatches(data);
}

function formatFootballDataMatches(data) {
  if (!data.matches) return [];
  
  return data.matches.slice(0, 20).map(match => ({
    id: match.id,
    league: match.competition.name,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
    status: match.status,
    time: match.minute || 0,
    date: match.utcDate
  }));
}

/**
 * API-Football (RapidAPI) (100/day free)
 */
async function getFootballFromRapidAPI() {
  const apiKey = KEYS.rapidapi;
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    throw new Error('RapidAPI key not configured');
  }

  trackApiCall('rapidapi');

  const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all';
  const options = {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': process.env.RAPIDAPI_FOOTBALL_HOST || 'api-football-v1.p.rapidapi.com'
    }
  };

  const data = await makeRequest(url, options);
  return formatRapidAPIFootball(data);
}

function formatRapidAPIFootball(data) {
  if (!data.response) return [];
  
  return data.response.slice(0, 20).map(match => ({
    id: match.fixture.id,
    league: match.league.name,
    homeTeam: match.teams.home.name,
    awayTeam: match.teams.away.name,
    homeScore: match.goals.home || 0,
    awayScore: match.goals.away || 0,
    status: match.fixture.status.short,
    time: match.fixture.status.elapsed || 0,
    date: match.fixture.date
  }));
}

/**
 * TheSportsDB (Unlimited free!)
 */
async function getFootballFromTheSportsDB() {
  const apiKey = KEYS.theSportsDb || '3'; // '3' is the free tier key
  
  // TheSportsDB doesn't have live scores in free tier, use fixtures
  const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=4328`;
  const data = await makeRequest(url);
  return formatTheSportsDBMatches(data);
}

function formatTheSportsDBMatches(data) {
  if (!data.events) return [];
  
  return data.events.slice(0, 20).map(match => ({
    id: match.idEvent,
    league: match.strLeague,
    homeTeam: match.strHomeTeam,
    awayTeam: match.strAwayTeam,
    homeScore: parseInt(match.intHomeScore) || null,
    awayScore: parseInt(match.intAwayScore) || null,
    status: match.strStatus || 'NS',
    time: 0,
    date: match.dateEvent
  }));
}

// ============================================
// BASKETBALL PROVIDERS
// ============================================

/**
 * BalldontLie (Unlimited free!)
 */
async function getBasketballFromBalldontlie() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://www.balldontlie.io/api/v1/games?dates[]=${today}`;
  
  const data = await makeRequest(url);
  return formatBalldontlieGames(data);
}

function formatBalldontlieGames(data) {
  if (!data.data) return [];
  
  return data.data.map(game => ({
    id: game.id,
    league: 'NBA',
    homeTeam: game.home_team.full_name,
    awayTeam: game.visitor_team.full_name,
    homeScore: game.home_team_score,
    awayScore: game.visitor_team_score,
    quarter: game.period > 4 ? `OT${game.period - 4}` : `Q${game.period}`,
    time: game.time || '12:00',
    status: game.status
  }));
}

/**
 * NBA Official API (Unofficial free access)
 */
async function getBasketballFromNBAOfficial() {
  const url = 'https://stats.nba.com/stats/scoreboardv3';
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://www.nba.com/'
    }
  };
  
  const data = await makeRequest(url, options);
  return formatNBAOfficialGames(data);
}

function formatNBAOfficialGames(data) {
  if (!data.scoreboard || !data.scoreboard.games) return [];
  
  return data.scoreboard.games.map(game => ({
    id: game.gameId,
    league: 'NBA',
    homeTeam: game.homeTeam.teamName,
    awayTeam: game.awayTeam.teamName,
    homeScore: game.homeTeam.score,
    awayScore: game.awayTeam.score,
    quarter: game.period > 4 ? `OT${game.period - 4}` : `Q${game.period}`,
    time: game.gameClock,
    status: game.gameStatusText
  }));
}

// ============================================
// BETTING ODDS PROVIDERS
// ============================================

/**
 * The Odds API (500/month free)
 */
async function getOddsFromTheOddsAPI(sport = 'soccer_epl') {
  const apiKey = KEYS.theOddsApi;
  if (!apiKey || apiKey === 'your_odds_api_key_here') {
    throw new Error('The Odds API key not configured');
  }

  trackApiCall('theOddsApi');

  const regions = process.env.THE_ODDS_API_REGIONS || 'uk';
  const markets = process.env.THE_ODDS_API_MARKETS || 'h2h';
  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=${regions}&markets=${markets}`;
  
  const data = await makeRequest(url);
  return formatTheOddsAPIData(data);
}

function formatTheOddsAPIData(data) {
  if (!Array.isArray(data)) return [];
  
  return data.slice(0, 10).map(match => ({
    id: match.id,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    commence: match.commence_time,
    odds: match.bookmakers?.[0]?.markets?.[0]?.outcomes || []
  }));
}

/**
 * Odds API IO (100/day free)
 */
async function getOddsFromOddsAPIIO(sport = 'football') {
  const apiKey = KEYS.oddsApiIo;
  if (!apiKey || apiKey === 'your_oddsapi_io_key_here') {
    throw new Error('Odds API IO key not configured');
  }

  const url = `https://api.oddsapi.io/v1/${sport}/odds?apiKey=${apiKey}`;
  const data = await makeRequest(url);
  return formatOddsAPIIOData(data);
}

function formatOddsAPIIOData(data) {
  if (!data.data) return [];
  
  return data.data.map(match => ({
    id: match.id,
    homeTeam: match.home,
    awayTeam: match.away,
    commence: match.timestamp,
    odds: match.odds || []
  }));
}

// ============================================
// F1 PROVIDERS
// ============================================

/**
 * Ergast F1 API (Unlimited free forever!)
 */
async function getF1FromErgast() {
  const url = 'http://ergast.com/api/f1/current/last/results.json';
  const data = await makeRequest(url);
  return formatErgastF1Data(data);
}

function formatErgastF1Data(data) {
  if (!data.MRData || !data.MRData.RaceTable || !data.MRData.RaceTable.Races) {
    return [];
  }
  
  const race = data.MRData.RaceTable.Races[0];
  return {
    season: race.season,
    round: race.round,
    raceName: race.raceName,
    circuit: race.Circuit.circuitName,
    date: race.date,
    results: race.Results.map(result => ({
      position: result.position,
      driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
      constructor: result.Constructor.name,
      time: result.Time?.time || result.status,
      points: result.points
    }))
  };
}

/**
 * OpenF1 API (Free, rate limited)
 */
async function getF1FromOpenF1() {
  const url = 'https://api.openf1.org/v1/sessions/latest';
  const data = await makeRequest(url);
  return data;
}

// ============================================
// BASEBALL PROVIDERS
// ============================================

/**
 * MLB Official Stats API (Unlimited free!)
 */
async function getBaseballFromMLBOfficial() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`;
  
  const data = await makeRequest(url);
  return formatMLBOfficialGames(data);
}

function formatMLBOfficialGames(data) {
  if (!data.dates || data.dates.length === 0) return [];
  
  const games = data.dates[0].games || [];
  return games.map(game => ({
    id: game.gamePk,
    league: 'MLB',
    homeTeam: game.teams.home.team.name,
    awayTeam: game.teams.away.team.name,
    homeScore: game.teams.home.score,
    awayScore: game.teams.away.score,
    inning: game.linescore?.currentInning || 0,
    status: game.status.detailedState
  }));
}

// ============================================
// CRICKET PROVIDERS
// ============================================

/**
 * CricAPI (100/day free)
 */
async function getCricketFromCricAPI() {
  const apiKey = KEYS.cricapi;
  if (!apiKey || apiKey === 'your_cricapi_key_here') {
    throw new Error('CricAPI key not configured');
  }

  trackApiCall('cricapi');

  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}`;
  const data = await makeRequest(url);
  return formatCricAPIMatches(data);
}

function formatCricAPIMatches(data) {
  if (!data.data) return [];
  
  return data.data.slice(0, 10).map(match => ({
    id: match.id,
    name: match.name,
    matchType: match.matchType,
    status: match.status,
    teams: match.teams,
    score: match.score
  }));
}

// ============================================
// RACING PROVIDERS
// ============================================

/**
 * The Racing API (100/day free)
 */
async function getRacingFromTheRacingAPI() {
  const apiKey = KEYS.racingApi;
  if (!apiKey || apiKey === 'your_racing_api_key_here') {
    throw new Error('Racing API key not configured');
  }

  const url = `https://api.theracingapi.com/v1/racecards?apiKey=${apiKey}`;
  const data = await makeRequest(url);
  return formatRacingAPIData(data);
}

function formatRacingAPIData(data) {
  // Format according to The Racing API response structure
  return data;
}

// ============================================
// MAIN ROUTING FUNCTIONS
// ============================================

/**
 * Get Football Live Scores (with provider routing)
 */
async function getFootballLiveScores() {
  const cacheKey = 'football_live';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (CONFIG.useMockData) {
    return getMockFootballData();
  }

  try {
    let data;
    
    switch (CONFIG.football) {
      case 'football-data':
        data = await getFootballFromFootballData();
        break;
      case 'rapidapi':
        data = await getFootballFromRapidAPI();
        break;
      case 'thesportsdb':
        data = await getFootballFromTheSportsDB();
        break;
      case 'mock':
        data = getMockFootballData();
        break;
      default:
        console.warn(`Unknown football provider: ${CONFIG.football}, using mock`);
        data = getMockFootballData();
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Football API error (${CONFIG.football}):`, error.message);
    
    if (CONFIG.fallbackMode === 'mock') {
      console.log('📋 Falling back to mock data');
      return getMockFootballData();
    }
    
    throw error;
  }
}

/**
 * Get Basketball Live Scores (with provider routing)
 */
async function getBasketballLiveScores() {
  const cacheKey = 'basketball_live';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (CONFIG.useMockData) {
    return getMockBasketballData();
  }

  try {
    let data;
    
    switch (CONFIG.basketball) {
      case 'balldontlie':
        data = await getBasketballFromBalldontlie();
        break;
      case 'nba-official':
        data = await getBasketballFromNBAOfficial();
        break;
      case 'rapidapi':
        data = await getBasketballFromRapidAPI();
        break;
      case 'mock':
        data = getMockBasketballData();
        break;
      default:
        data = getMockBasketballData();
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Basketball API error (${CONFIG.basketball}):`, error.message);
    return CONFIG.fallbackMode === 'mock' ? getMockBasketballData() : [];
  }
}

/**
 * Get Betting Odds (with provider routing)
 */
async function getBettingOdds(sport = 'soccer_epl') {
  const cacheKey = `odds_${sport}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (CONFIG.useMockData) {
    return getMockOddsData();
  }

  try {
    let data;
    
    switch (CONFIG.odds) {
      case 'theoddsapi':
        data = await getOddsFromTheOddsAPI(sport);
        break;
      case 'oddsapi-io':
        data = await getOddsFromOddsAPIIO(sport);
        break;
      case 'mock':
        data = getMockOddsData();
        break;
      default:
        data = getMockOddsData();
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Odds API error (${CONFIG.odds}):`, error.message);
    return CONFIG.fallbackMode === 'mock' ? getMockOddsData() : [];
  }
}

/**
 * Get F1 Data (with provider routing)
 */
async function getF1Data() {
  const cacheKey = 'f1_latest';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let data;
    
    switch (CONFIG.f1) {
      case 'ergast':
        data = await getF1FromErgast();
        break;
      case 'openf1':
        data = await getF1FromOpenF1();
        break;
      default:
        data = await getF1FromErgast(); // Default to free Ergast
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('F1 API error:', error.message);
    return {};
  }
}

/**
 * Get Baseball Data (with provider routing)
 */
async function getBaseballLiveScores() {
  const cacheKey = 'baseball_live';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let data;
    
    switch (CONFIG.baseball) {
      case 'mlb-official':
        data = await getBaseballFromMLBOfficial();
        break;
      case 'rapidapi':
        data = await getBaseballFromRapidAPI();
        break;
      default:
        data = await getBaseballFromMLBOfficial();
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Baseball API error:', error.message);
    return [];
  }
}

// Mock data fallback functions (same as before)
function getMockFootballData() {
  return [
    {
      id: 1001,
      league: 'Premier League',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      homeScore: 2,
      awayScore: 1,
      status: '2H',
      time: 67,
      date: new Date().toISOString()
    },
    {
      id: 1002,
      league: 'Premier League',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      homeScore: 1,
      awayScore: 1,
      status: 'HT',
      time: 45,
      date: new Date().toISOString()
    }
  ];
}

function getMockBasketballData() {
  return [
    {
      id: 3001,
      league: 'NBA',
      homeTeam: 'LA Lakers',
      awayTeam: 'Boston Celtics',
      homeScore: 98,
      awayScore: 102,
      quarter: 'Q4',
      time: '2:34',
      status: 'LIVE'
    }
  ];
}

function getMockOddsData() {
  return [
    {
      id: 'odds_1',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      commence: new Date().toISOString(),
      odds: [
        { name: 'Manchester City', price: 1.85 },
        { name: 'Draw', price: 3.50 },
        { name: 'Arsenal', price: 4.20 }
      ]
    }
  ];
}

function getMockTennisData() {
  return [
    {
      id: 4001,
      tournament: 'ATP Finals',
      player1: 'Novak Djokovic',
      player2: 'Carlos Alcaraz',
      score: '6-4, 3-2',
      set: 2,
      status: 'LIVE'
    }
  ];
}

function getMockRacingData() {
  return {
    venue: 'Cheltenham',
    races: [
      {
        id: 5001,
        time: '14:30',
        name: 'Gold Cup',
        distance: '3m 2f',
        runners: [
          { position: 1, name: 'Galopin Des Champs', form: '1-1-1-2', odds: '2/1', rating: 3 }
        ]
      }
    ]
  };
}

// Placeholder functions for other sports
async function getTennisLiveScores() {
  const cacheKey = 'tennis_live';
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  const data = getMockTennisData();
  setCache(cacheKey, data);
  return data;
}

async function getRacingCards() {
  const cacheKey = 'racing_cards';
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  const data = getMockRacingData();
  setCache(cacheKey, data);
  return data;
}

async function getFootballFixtures(date = null) {
  // Implement based on selected provider
  return [];
}

async function getBasketballFromRapidAPI() {
  // Implement RapidAPI basketball if needed
  return getMockBasketballData();
}

async function getBaseballFromRapidAPI() {
  // Implement RapidAPI baseball if needed
  return [];
}

// Utility: Get API status
function getAPIStatus() {
  return {
    config: {
      football: CONFIG.football,
      basketball: CONFIG.basketball,
      odds: CONFIG.odds,
      f1: CONFIG.f1,
      baseball: CONFIG.baseball,
      useMockData: CONFIG.useMockData
    },
    keys: {
      rapidapi: !!KEYS.rapidapi && KEYS.rapidapi !== 'your_rapidapi_key_here',
      footballData: !!KEYS.footballData && KEYS.footballData !== 'your_football_data_key_here',
      theOddsApi: !!KEYS.theOddsApi && KEYS.theOddsApi !== 'your_odds_api_key_here'
    },
    usage: CONFIG.trackUsage ? usage : { tracking: 'disabled' },
    cache: {
      entries: cache.size,
      duration: `${CONFIG.cacheDuration / 60000} minutes`
    }
  };
}

// Export all functions
module.exports = {
  getFootballLiveScores,
  getFootballFixtures,
  getBettingOdds,
  getBasketballLiveScores,
  getTennisLiveScores,
  getRacingCards,
  getF1Data,
  getBaseballLiveScores,
  clearCache,
  getAPIStatus
};
