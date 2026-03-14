// assets/js/sport.js
// GRACE-X Sport™ Module v2.0 - Streamlined & Enhanced
// © Zac Crockett & Jason Treadaway
// Real-time sports analytics, live scores, predictive insights & betting analysis

(function() {
  // Global online-mode flags (offline by default)
  window.GRACEX_NET = window.GRACEX_NET || { footballLive: false, racingLive: false };

// Data mode (for clear labels: OFFLINE / SIMULATED / LIVE)
window.GRACEX_SPORT_DATA_MODE = window.GRACEX_SPORT_DATA_MODE || { football: 'simulated', racing: 'simulated' };

  'use strict';

  // ============================================
  // MODULE CONFIGURATION
  // ============================================
  
  const MODULE_ID = 'sport';
  const VERSION = '2.0.0';
  const STORAGE_KEY = 'gracex_sport_data';
  
  // Sports API endpoints (configurable)
  function gxSportLabel(kind){
  const net = (window.GRACEX_NET || {footballLive:false,racingLive:false});
  const mode = (window.GRACEX_SPORT_DATA_MODE || {football:'simulated',racing:'simulated'});
  const on = kind === 'football' ? !!net.footballLive : !!net.racingLive;
  if (!on) return 'OFFLINE';
  const m = kind === 'football' ? (mode.football || 'simulated') : (mode.racing || 'simulated');
  return (m === 'live') ? 'LIVE' : 'SIMULATED';
}

function gxSyncSportLiveUI(){
  const fs = document.getElementById('sport-football-live-status');
  const rs = document.getElementById('sport-racing-live-status');
  if (fs) fs.textContent = gxSportLabel('football');
  if (rs) rs.textContent = gxSportLabel('racing');

  const badge = document.getElementById('sport-connection-badge');
  if (badge){
    const net = window.GRACEX_NET || {};
    const anyOn = !!net.footballLive || !!net.racingLive;
    const anyLive = (window.GRACEX_SPORT_DATA_MODE?.football === 'live') || (window.GRACEX_SPORT_DATA_MODE?.racing === 'live');
    if (!anyOn){
      badge.textContent = '⚪ Offline';
      badge.classList.remove('gx-badge-success');
      badge.classList.add('gx-badge-warning');
    } else if (anyLive){
      badge.textContent = '🟢 Live';
      badge.classList.add('gx-badge-success');
      badge.classList.remove('gx-badge-warning');
    } else {
      badge.textContent = '🟡 Simulated';
      badge.classList.remove('gx-badge-success');
      badge.classList.add('gx-badge-warning');
    }
  }
}

const API_CONFIG = {
    // Free APIs for live data (can be extended)
    football: 'https://api.football-data.org/v4',
    odds: null, // Add betting API key here
    refreshInterval: 60000, // 1 minute refresh for live scores
    enableAutoRefresh: true
  };

  // Sports configuration with enhanced metadata
  const SPORTS = {
    'football': { emoji: '⚽', name: 'Football', color: '#10b981' },
    'basketball': { emoji: '🏀', name: 'Basketball', color: '#f97316' },
    'tennis': { emoji: '🎾', name: 'Tennis', color: '#eab308' },
    'cricket': { emoji: '🏏', name: 'Cricket', color: '#3b82f6' },
    'rugby': { emoji: '🏉', name: 'Rugby', color: '#16a34a' },
    'golf': { emoji: '⛳', name: 'Golf', color: '#22c55e' },
    'f1': { emoji: '🏎️', name: 'Formula 1', color: '#ef4444' },
    'horse-racing': { emoji: '🐎', name: 'Horse Racing', color: '#8b5cf6' },
    'boxing': { emoji: '🥊', name: 'Boxing', color: '#dc2626' },
    'mma': { emoji: '🥋', name: 'MMA', color: '#7c3aed' },
    'baseball': { emoji: '⚾', name: 'Baseball', color: '#1d4ed8' },
    'nfl': { emoji: '🏈', name: 'NFL', color: '#0891b2' },
    'darts': { emoji: '🎯', name: 'Darts', color: '#f59e0b' },
    'snooker': { emoji: '🎱', name: 'Snooker', color: '#059669' }
  };

  // Default state
  const DEFAULT_DATA = {
    selectedSport: 'football',
    favoriteTeams: [],
    favoritePlayers: [],
    predictions: [],
    alerts: [],
    bettingHistory: [],
    stats: {
      predictionsMade: 0,
      correctPredictions: 0,
      accuracy: 0,
      matchesTracked: 0,
      alertsSet: 0,
      totalProfit: 0
    },
    settings: {
      notifications: true,
      autoRefresh: true,
      darkOdds: false,
      currency: 'GBP'
    }
  };

  // State management
  let sportData = loadData();
  let refreshTimer = null;
  let isVoiceListening = false;
  let isInitializedOnce = false;

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_DATA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[GRACEX SPORT] Failed to load saved data:', e);
    }
    return { ...DEFAULT_DATA };
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sportData));
    } catch (e) {
      console.warn('[GRACEX SPORT] Failed to save data:', e);
    }
  }

  // ============================================
  // UI UTILITIES
  // ============================================

  function showToast(message, type = 'info', duration = 2500) {
    if (window.GRACEX_Utils && GRACEX_Utils.showToast) {
      GRACEX_Utils.showToast(message, type, duration);
    } else {
      console.log(`[GRACEX SPORT] ${type.toUpperCase()}: ${message}`);
    }
  }

  function showModal(config) {
    if (window.GRACEX_Utils && GRACEX_Utils.showModal) {
      GRACEX_Utils.showModal(config);
    }
  }

  function speak(text) {
    if (window.GRACEX_TTS && GRACEX_TTS.isEnabled()) {
      return GRACEX_TTS.speak(text);
    }
    return Promise.resolve();
  }

  function getSportConfig(sport) {
    return SPORTS[sport] || { emoji: '🏆', name: sport, color: '#10b981' };
  }

  // ============================================
  // SPORT SELECTION
  // ============================================

function initLiveBarToggles() {
  const net = window.GRACEX_NET || { footballLive: false, racingLive: false };
  const ft = document.getElementById('sport-football-live');
  const rt = document.getElementById('sport-racing-live');
  const fs = document.getElementById('sport-football-live-status');
  const rs = document.getElementById('sport-racing-live-status');

  const sync = () => {
    if (ft) ft.checked = !!net.footballLive;
    if (rt) rt.checked = !!net.racingLive;
    if (fs) fs.textContent = gxSportLabel('football');
    if (rs) rs.textContent = gxSportLabel('racing');
  };

  sync();
  gxSyncSportLiveUI();
  ft?.addEventListener('change', () => { net.footballLive = !!ft.checked; window.GRACEX_NET = net; sync(); });
  rt?.addEventListener('change', () => { net.racingLive = !!rt.checked; window.GRACEX_NET = net; sync(); });
}

function initSportSelector() {

    const buttons = document.querySelectorAll('.sport-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sport = btn.dataset.sport;
        selectSport(sport);
      });
    });

    // Set initial selection
    const initialBtn = document.querySelector(`.sport-btn[data-sport="${sportData.selectedSport}"]`);
    if (initialBtn) initialBtn.classList.add('active');
  }

  function selectSport(sport) {
    const buttons = document.querySelectorAll('.sport-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.sport-btn[data-sport="${sport}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    sportData.selectedSport = sport;
    saveData();
    
    const config = getSportConfig(sport);
    showToast(`${config.emoji} Switched to ${config.name}`, 'info', 1500);
    
    updateLiveScores(sport);
    updatePredictions(sport);
  }

  // ============================================
  // LIVE SCORES - Enhanced
  // ============================================

  async function updateLiveScores(sport = sportData.selectedSport) {
    const container = document.getElementById('sport-live-matches');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="sport-loading">
        <div class="gx-spinner"></div>
        <p>Loading live scores...</p>
      </div>
    `;

    try {
      const matches = await fetchLiveMatches(sport);
      renderLiveScores(container, matches, sport);
    } catch (err) {
      console.warn('[GRACEX SPORT] Failed to fetch live scores:', err);
      renderDemoScores(container, sport);
    }
  }

async function fetchLiveMatches(sport) {
  // Offline-by-default: only hit the internet if user explicitly enables it.
  const net = window.GRACEX_NET || { footballLive: false, racingLive: false };

  // Football: optional live API (requires token/config). If missing, fall back safely.
  if (sport === 'football' && net.footballLive) {
    try {
      const token = localStorage.getItem('GRACEX_FOOTBALLDATA_TOKEN') || '';
      if (!token) throw new Error('Missing GRACEX_FOOTBALLDATA_TOKEN (using demo)');
      const url = `${API_CONFIG.football}/matches`;
      const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Map minimal fields into our internal format
      return (data.matches || []).slice(0, 10).map(m => ({
        home: m.homeTeam?.name || 'Home',
        away: m.awayTeam?.name || 'Away',
        homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? 0,
        awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? 0,
        minute: 0,
        status: (m.status === 'IN_PLAY' || m.status === 'PAUSED') ? 'LIVE' : (m.status || 'SCHEDULED'),
        league: m.competition?.name || 'Competition'
      }));
    } catch (err) {
      console.warn('[GRACEX SPORT] Football online mode fallback:', err);
      // continue to demo below
    }
  }

  // Default: return simulated live data (no internet calls)
  await new Promise(r => setTimeout(r, 800));
  return generateDemoMatches(sport);
}

  function generateDemoMatches(sport) {
    const config = getSportConfig(sport);
    const now = new Date();
    
    const demoData = {
      'football': [
        { home: 'Manchester United', away: 'Liverpool', homeScore: 2, awayScore: 1, minute: 67, status: 'SIMULATED', league: 'Premier League' },
        { home: 'Arsenal', away: 'Chelsea', homeScore: 0, awayScore: 0, minute: 34, status: 'SIMULATED', league: 'Premier League' },
        { home: 'Real Madrid', away: 'Barcelona', homeScore: 1, awayScore: 2, minute: 0, status: 'HT', league: 'La Liga' }
      ],
      'basketball': [
        { home: 'Lakers', away: 'Celtics', homeScore: 98, awayScore: 102, quarter: 'Q4', time: '4:32', status: 'SIMULATED', league: 'NBA' },
        { home: 'Warriors', away: 'Nets', homeScore: 78, awayScore: 81, quarter: 'Q3', time: '8:15', status: 'SIMULATED', league: 'NBA' }
      ],
      'tennis': [
        { player1: 'Djokovic', player2: 'Alcaraz', sets: '2-1', games: '5-4', status: 'SIMULATED', tournament: 'Wimbledon' },
        { player1: 'Sinner', player2: 'Medvedev', sets: '1-1', games: '3-3', status: 'SIMULATED', tournament: 'Australian Open' }
      ],
      'f1': [
        { position: 1, driver: 'Verstappen', team: 'Red Bull', gap: 'LEADER', status: 'Lap 45/57' },
        { position: 2, driver: 'Hamilton', team: 'Mercedes', gap: '+3.2s', status: 'Lap 45/57' },
        { position: 3, driver: 'Norris', team: 'McLaren', gap: '+8.7s', status: 'Lap 45/57' }
      ]
    };

    return demoData[sport] || demoData['football'];
  }

  function renderLiveScores(container, matches, sport) {
    const config = getSportConfig(sport);
    
    if (!matches || matches.length === 0) {
      container.innerHTML = `
        <div class="sport-no-matches">
          <span>${config.emoji}</span>
          <p>No live ${config.name} matches right now</p>
          <p class="hint">Check back later or view upcoming fixtures</p>
        </div>
      `;
      return;
    }

    let html = '';
    
    if (sport === 'f1') {
      // F1 specific layout
      html = `<div class="f1-standings">`;
      matches.forEach(entry => {
        html += `
          <div class="f1-position-row">
            <span class="f1-pos">P${entry.position}</span>
            <span class="f1-driver">${entry.driver}</span>
            <span class="f1-team">${entry.team}</span>
            <span class="f1-gap">${entry.gap}</span>
          </div>
        `;
      });
      html += `<p class="hint" style="text-align: center; margin-top: 12px;">${matches[0]?.status || 'Race in Progress'}</p></div>`;
    } else if (sport === 'tennis') {
      matches.forEach(match => {
        html += `
          <div class="sport-match-card tennis-match">
            <div class="match-teams">
              <span class="team">${match.player1}</span>
              <span class="match-score tennis-score">${match.sets} (${match.games})</span>
              <span class="team">${match.player2}</span>
            </div>
            <div class="match-info">
              <span class="match-time ${match.status === 'LIVE' ? 'live' : ''}">${match.status === 'LIVE' ? '🔴 Live' : match.status}</span>
              <span class="match-league">${match.tournament}</span>
            </div>
          </div>
        `;
      });
    } else {
      matches.forEach(match => {
        const isLive = match.status === 'LIVE';
        const timeDisplay = sport === 'basketball' 
          ? `${match.quarter} ${match.time}` 
          : `${match.minute}'`;
        
        html += `
          <div class="sport-match-card">
            <div class="match-teams">
              <span class="team home">${match.home}</span>
              <span class="match-score">${match.homeScore} - ${match.awayScore}</span>
              <span class="team away">${match.away}</span>
            </div>
            <div class="match-info">
              <span class="match-time ${isLive ? 'live' : ''}">${isLive ? '🔴 ' : ''}${timeDisplay}</span>
              <span class="match-league">${match.league}</span>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
    sportData.stats.matchesTracked = (sportData.stats.matchesTracked || 0) + matches.length;
    saveData();
  }

  function renderDemoScores(container, sport) {
    const matches = generateDemoMatches(sport);
    renderLiveScores(container, matches, sport);
    
    container.insertAdjacentHTML('beforeend', `
      <p class="hint" style="text-align: center; margin-top: 12px; color: #f59e0b;">
        ⚠️ Demo data - Connect API for live updates
      </p>
    `);
  }

  // ============================================
  // PREDICTIONS & ANALYTICS - Enhanced
  // ============================================

  function initPredictions() {
    const getPredictionsBtn = document.getElementById('sport-get-predictions');
    const viewHistoryBtn = document.getElementById('sport-view-history');
    
    if (getPredictionsBtn) {
      getPredictionsBtn.addEventListener('click', generatePredictions);
    }
    
    if (viewHistoryBtn) {
      viewHistoryBtn.addEventListener('click', showPredictionHistory);
    }
  }

  async function generatePredictions() {
    const btn = document.getElementById('sport-get-predictions');
    const container = document.getElementById('sport-predictions-grid');
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="gx-spinner" style="width:16px;height:16px;"></span> Analyzing...';
    }

    try {
      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 1500));
      
      const predictions = generateAIPredictions(sportData.selectedSport);
      
      if (container) {
        renderPredictions(container, predictions);
      }
      
      sportData.stats.predictionsMade += predictions.length;
      updateStatsDisplay();
      saveData();
      
      showToast('🎯 Predictions updated!', 'success');
      speak('I have analyzed the latest form and generated new predictions.');
      
    } catch (err) {
      console.error('[GRACEX SPORT] Prediction error:', err);
      showToast('Failed to generate predictions', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🎯 Get AI Predictions';
      }
    }
  }

  function generateAIPredictions(sport) {
    const config = getSportConfig(sport);
    
    const templates = {
      'football': [
        { match: 'Man City vs Arsenal', prediction: 'Home Win', confidence: 78, odds: 1.85, reasoning: 'City strong at home, 5 wins in last 6' },
        { match: 'Liverpool vs Chelsea', prediction: 'Over 2.5', confidence: 72, odds: 1.75, reasoning: 'Both teams averaging 3+ goals' },
        { match: 'Spurs vs Man Utd', prediction: 'BTTS Yes', confidence: 81, odds: 1.65, reasoning: 'Both scored in last 4 H2H meetings' }
      ],
      'basketball': [
        { match: 'Lakers vs Celtics', prediction: 'Away Win', confidence: 65, odds: 2.10, reasoning: 'Celtics on 4-game win streak' },
        { match: 'Warriors vs Heat', prediction: 'Over 218.5', confidence: 74, odds: 1.90, reasoning: 'High-scoring affair expected' }
      ],
      'horse-racing': [
        { race: '14:30 Cheltenham', horse: 'Galopin Des Champs', prediction: 'Win', confidence: 85, odds: 2.50, reasoning: 'Form: 1-1-1-2, proven track record' },
        { race: '15:15 Ascot', horse: 'Constitution Hill', prediction: 'Each Way', confidence: 70, odds: 5.00, reasoning: 'Strong jumper, good conditions' }
      ]
    };

    return templates[sport] || templates['football'];
  }

  function renderPredictions(container, predictions) {
    container.innerHTML = predictions.map((pred, i) => `
      <div class="prediction-card" data-confidence="${pred.confidence}">
        <div class="prediction-header">
          <span class="prediction-match">${pred.match || pred.race || 'Match'}</span>
          <span class="prediction-confidence ${pred.confidence >= 75 ? 'high' : pred.confidence >= 60 ? 'medium' : 'low'}">
            ${pred.confidence}% Confidence
          </span>
        </div>
        <div class="prediction-pick">
          <strong>${pred.horse || pred.prediction}</strong>
          ${pred.odds ? `<span class="prediction-odds">@ ${pred.odds}</span>` : ''}
        </div>
        <p class="prediction-reasoning">${pred.reasoning}</p>
        <div class="prediction-actions">
          <button class="builder-btn" onclick="GRACEX_Sport.trackPrediction(${i})">📌 Track</button>
          <button class="builder-btn" onclick="GRACEX_Sport.sharePrediction(${i})">📤 Share</button>
        </div>
      </div>
    `).join('');
  }

  function updatePredictions(sport) {
    const container = document.getElementById('sport-predictions-grid');
    if (container) {
      const predictions = generateAIPredictions(sport);
      renderPredictions(container, predictions);
    }
  }

  function showPredictionHistory() {
    const history = sportData.predictions.slice(-10).reverse();
    
    const content = history.length > 0 ? `
      <div style="max-height: 400px; overflow-y: auto;">
        ${history.map(p => `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(${p.correct ? '16, 185, 129' : '239, 68, 68'}, 0.1); 
               border-left: 3px solid ${p.correct ? '#10b981' : '#ef4444'}; border-radius: 8px;">
            <p style="margin: 0; font-weight: 600;">${p.correct ? '✓' : '✗'} ${p.match}</p>
            <p style="margin: 4px 0 0; color: #888; font-size: 0.875rem;">
              Predicted: ${p.prediction} - ${p.correct ? 'CORRECT' : 'INCORRECT'}
            </p>
          </div>
        `).join('')}
        <p style="text-align: center; margin-top: 16px; color: #10b981; font-weight: 600;">
          Overall Accuracy: ${sportData.stats.accuracy}%
        </p>
      </div>
    ` : `
      <div style="text-align: center; padding: 40px; color: #888;">
        <span style="font-size: 3rem; display: block; margin-bottom: 16px;">📊</span>
        <p>No prediction history yet</p>
        <p class="hint">Start making predictions to build your track record!</p>
      </div>
    `;

    showModal({
      title: '📊 Prediction History',
      content,
      buttons: [{ text: 'Close', primary: true }]
    });
  }

  function trackPrediction(index) {
    showToast('📌 Prediction tracked!', 'success');
  }

  function sharePrediction(index) {
    // Copy to clipboard or share
    showToast('📤 Prediction copied to clipboard!', 'success');
  }

  // ============================================
  // FAVORITES MANAGEMENT - Enhanced
  // ============================================

  function initFavorites() {
    const addTeamBtn = document.getElementById('sport-add-team');
    const addPlayerBtn = document.getElementById('sport-add-player');
    
    if (addTeamBtn) {
      addTeamBtn.addEventListener('click', addFavoriteTeam);
    }
    
    if (addPlayerBtn) {
      addPlayerBtn.addEventListener('click', addFavoritePlayer);
    }
    
    // Delegated event for remove buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-fav')) {
        const tag = e.target.closest('.favorite-tag');
        if (tag) {
          const name = tag.dataset.name;
          const type = tag.dataset.type;
          removeFavorite(name, type);
        }
      }
    });
    
    renderFavorites();
  }

  function addFavoriteTeam() {
    const name = prompt('Enter team name:');
    if (name && name.trim()) {
      const config = getSportConfig(sportData.selectedSport);
      sportData.favoriteTeams.push({
        name: name.trim(),
        sport: sportData.selectedSport,
        emoji: config.emoji,
        addedAt: new Date().toISOString()
      });
      saveData();
      renderFavorites();
      showToast(`${config.emoji} Added ${name} to favorites!`, 'success');
    }
  }

  function addFavoritePlayer() {
    const name = prompt('Enter player name:');
    if (name && name.trim()) {
      const config = getSportConfig(sportData.selectedSport);
      sportData.favoritePlayers.push({
        name: name.trim(),
        sport: sportData.selectedSport,
        emoji: config.emoji,
        addedAt: new Date().toISOString()
      });
      saveData();
      renderFavorites();
      showToast(`⭐ Added ${name} to favorites!`, 'success');
    }
  }

  function removeFavorite(name, type) {
    if (type === 'team') {
      sportData.favoriteTeams = sportData.favoriteTeams.filter(t => t.name !== name);
    } else {
      sportData.favoritePlayers = sportData.favoritePlayers.filter(p => p.name !== name);
    }
    saveData();
    renderFavorites();
    showToast('Removed from favorites', 'info');
  }

  function renderFavorites() {
    const teamsContainer = document.getElementById('sport-favorite-teams');
    const playersContainer = document.getElementById('sport-favorite-players');
    
    if (teamsContainer) {
      teamsContainer.innerHTML = sportData.favoriteTeams.map(team => `
        <span class="favorite-tag" data-name="${team.name}" data-type="team">
          ${team.emoji} ${team.name}
          <button class="remove-fav" title="Remove">×</button>
        </span>
      `).join('') + `
        <button id="sport-add-team" class="add-favorite-btn">+ Add Team</button>
      `;
      
      // Re-attach event
      document.getElementById('sport-add-team')?.addEventListener('click', addFavoriteTeam);
    }
    
    if (playersContainer) {
      playersContainer.innerHTML = sportData.favoritePlayers.map(player => `
        <span class="favorite-tag player-tag" data-name="${player.name}" data-type="player">
          ${player.emoji} ${player.name}
          <button class="remove-fav" title="Remove">×</button>
        </span>
      `).join('') + `
        <button id="sport-add-player" class="add-favorite-btn">+ Add Player</button>
      `;
      
      document.getElementById('sport-add-player')?.addEventListener('click', addFavoritePlayer);
    }
  }

  // ============================================
  // HORSE RACING - Enhanced
  // ============================================

  function initRacing() {
    const getTipsBtn = document.getElementById('sport-get-racing-tips');
    const meetBtns = document.querySelectorAll('.racing-meet-btn');
    
    if (getTipsBtn) {
      getTipsBtn.addEventListener('click', getRacingTips);
    }
    
    meetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        meetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadRaceCard(btn.dataset.meet || btn.textContent.trim());
      });
    });
  }

  async function getRacingTips() {
    const btn = document.getElementById('sport-get-racing-tips');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="gx-spinner" style="width:16px;height:16px;"></span> Analyzing form...';
    
    await new Promise(r => setTimeout(r, 2000));
    
    const tips = [
      { horse: 'Galopin Des Champs', race: '14:30 Cheltenham', tip: 'Strong NAP', confidence: 85 },
      { horse: 'Constitution Hill', race: '15:15 Ascot', tip: 'Each Way Value', confidence: 72 }
    ];
    
    showToast(`🐎 Top Pick: ${tips[0].horse} @ ${tips[0].race}`, 'success', 4000);
    speak(`My top pick today is ${tips[0].horse} in the ${tips[0].race.split(' ')[0]} at ${tips[0].race.split(' ')[1]}`);
    
    btn.disabled = false;
    btn.innerHTML = '🎯 Get AI Racing Tips';
  }

  function loadRaceCard(meet) {
    console.log('[GRACEX SPORT] Loading race card for:', meet);
    // In production, this would fetch real race data
    showToast(`Loading ${meet} race card...`, 'info');
  }

  // ============================================
  // BRAIN INTEGRATION - Enhanced
  // ============================================

  function initBrain() {
    const input = document.getElementById('sport-brain-input');
    const btn = document.getElementById('sport-brain-btn');
    const micBtn = document.getElementById('sport-brain-mic');
    const output = document.getElementById('sport-brain-output');
    const clearBtn = document.getElementById('sport-brain-clear');
    const exportBtn = document.getElementById('sport-brain-export');

    if (!input || !btn || !output) return;

    async function handleAsk() {
      const query = input.value.trim();
      if (!query) return;

      addMessage(output, query, 'user');
      input.value = '';

      const thinkingDiv = addMessage(output, '🏆 Analyzing sports data...', 'thinking');

      try {
        const context = buildContext();
        let reply = await getBrainResponse(query, context);

        thinkingDiv.remove();
        addMessage(output, reply, 'assistant');

        speak(reply);
        sportData.stats.predictionsMade++;
        updateStatsDisplay();
        saveData();

      } catch (err) {
        console.error('[GRACEX SPORT] Brain error:', err);
        thinkingDiv.remove();
        addMessage(output, 'Sorry, I had trouble analyzing that. Please try again.', 'error');
      }
    }

    btn.addEventListener('click', handleAsk);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAsk();
      }
    });

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (window.GRACEX_VoiceAssistant) {
          GRACEX_VoiceAssistant.activate();
          micBtn.classList.add('listening');
          setTimeout(() => micBtn.classList.remove('listening'), 5000);
        } else {
          showToast('Voice input not available', 'warning');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        output.innerHTML = `
          <div class="brain-message brain-message-system">
            ${getSportConfig(sportData.selectedSport).emoji} Ready to assist with sports analytics. Ask about predictions, scores, or player stats!
          </div>
        `;
        showToast('Conversation cleared', 'info');
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportChat);
    }
  }

  function buildContext() {
    const config = getSportConfig(sportData.selectedSport);
    return `Sport: ${config.name}. Favorites: ${sportData.favoriteTeams.map(t => t.name).join(', ') || 'None set'}. 
            Stats: ${sportData.stats.predictionsMade} predictions made, ${sportData.stats.accuracy}% accuracy.`;
  }

  async function getBrainResponse(query, context) {
    // Try Level 5 brain first
    if (typeof window.runModuleBrain === 'function') {
      try {
        return await window.runModuleBrain(MODULE_ID, `${query} [Context: ${context}]`);
      } catch (e) {
        console.warn('[GRACEX SPORT] Level 5 brain error:', e);
      }
    }
    
    // Try GraceX brain
    if (window.GraceX && typeof GraceX.think === 'function') {
      try {
        const res = GraceX.think({ text: query, module: MODULE_ID, mode: 'chat' });
        return res.reply;
      } catch (e) {
        console.warn('[GRACEX SPORT] GraceX brain error:', e);
      }
    }
    
    // Fallback to local responses
    return getLocalResponse(query);
  }

  function getLocalResponse(query) {
    const q = query.toLowerCase();
    const config = getSportConfig(sportData.selectedSport);
    
    if (q.includes('predict') || q.includes('win') || q.includes('who will')) {
      return `Based on current ${config.name} form analysis: I'd look at head-to-head records, recent performances, home/away stats, and injury reports. For more accurate predictions with real-time data, connect to Level 5 AI.`;
    }
    if (q.includes('score') || q.includes('live') || q.includes('result')) {
      return `Check the Live Scores panel above for current ${config.name} matches. I'm tracking ${sportData.stats.matchesTracked} matches so far.`;
    }
    if (q.includes('horse') || q.includes('racing') || q.includes('cheltenham')) {
      return "For horse racing, I analyze form figures, going preferences, trainer/jockey stats, and track records. Check the Racing section for today's tips!";
    }
    if (q.includes('bet') || q.includes('odds') || q.includes('value')) {
      return "I can help identify value bets by comparing odds to calculated probabilities. Remember to gamble responsibly. What specific match or event are you looking at?";
    }
    if (q.includes('stat') || q.includes('record') || q.includes('history')) {
      return `Your prediction stats: ${sportData.stats.predictionsMade} predictions made with ${sportData.stats.accuracy}% accuracy. Keep tracking to improve!`;
    }
    
    return `I'm your ${config.emoji} GRACE-X Sport assistant! I can help with ${config.name} predictions, live scores, player stats, and betting insights. What would you like to know?`;
  }

  function addMessage(container, text, type) {
    const div = document.createElement('div');
    div.className = `brain-message brain-message-${type}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function exportChat() {
    const output = document.getElementById('sport-brain-output');
    if (!output) return;
    
    const messages = output.querySelectorAll('.brain-message');
    let text = `GRACE-X Sport™ Chat Export\n${'='.repeat(40)}\nDate: ${new Date().toLocaleString()}\nSport: ${sportData.selectedSport}\n\n`;
    
    messages.forEach(msg => {
      text += msg.textContent + '\n\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gracex-sport-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Chat exported!', 'success');
  }

  // ============================================
  // STATS DISPLAY
  // ============================================

  function updateStatsDisplay() {
    const stats = sportData.stats;
    
    // Calculate accuracy
    if (stats.predictionsMade > 0 && stats.correctPredictions > 0) {
      stats.accuracy = Math.round((stats.correctPredictions / stats.predictionsMade) * 100);
    }
    
    const elements = {
      'sport-predictions-made': stats.predictionsMade,
      'sport-accuracy': `${stats.accuracy}%`,
      'sport-matches-tracked': stats.matchesTracked,
      'sport-alerts-set': stats.alertsSet
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  // ============================================
  // CONTROLS & ALERTS
  // ============================================

  function initControls() {
    const refreshBtn = document.getElementById('sport-refresh-scores');
    const alertsBtn = document.getElementById('sport-set-alerts');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="gx-spinner" style="width:14px;height:14px;"></span> Refreshing...';
        
        await updateLiveScores();
        
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '🔄 Refresh Scores';
        showToast('Scores refreshed!', 'success');
      });
    }
    
    if (alertsBtn) {
      alertsBtn.addEventListener('click', showAlertsModal);
    }
    
    // Auto-refresh if enabled
    if (API_CONFIG.enableAutoRefresh) {
      startAutoRefresh();
    }
  }

  function showAlertsModal() {
    showModal({
      title: '🔔 Set Match Alerts',
      content: `
        <p style="color: #888; margin-bottom: 16px;">Get notified when:</p>
        <div style="display: grid; gap: 12px;">
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>Goals scored by favorite teams</span>
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>Match starts for favorite teams</span>
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>Half-time scores</span>
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>Final results</span>
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>Red cards / Major events</span>
          </label>
        </div>
      `,
      buttons: [
        { text: 'Cancel' },
        { text: 'Save Alerts', primary: true, onClick: () => {
          sportData.stats.alertsSet++;
          saveData();
          updateStatsDisplay();
          showToast('Alerts saved!', 'success');
        }}
      ]
    });
  }

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateLiveScores();
      }
    }, API_CONFIG.refreshInterval);
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  // ============================================
  // VOICE COMMANDS
  // ============================================

  function initVoice() {
    // Register sport-specific voice commands
    if (window.GRACEX_Core && window.GRACEX_Core.registerVoiceHandler) {
      GRACEX_Core.registerVoiceHandler('sport', handleVoiceCommand);
    }
  }

  function handleVoiceCommand(command) {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('score') || cmd.includes('scores')) {
      speak(`Refreshing live scores for ${getSportConfig(sportData.selectedSport).name}`);
      updateLiveScores();
      return true;
    }
    
    if (cmd.includes('predict') || cmd.includes('prediction')) {
      speak('Generating predictions now');
      generatePredictions();
      return true;
    }
    
    if (cmd.includes('switch to')) {
      const sportMatch = Object.keys(SPORTS).find(s => cmd.includes(s) || cmd.includes(SPORTS[s].name.toLowerCase()));
      if (sportMatch) {
        selectSport(sportMatch);
        return true;
      }
    }
    
    return false;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    if (isInitializedOnce) {
      console.log('[GRACEX SPORT] Init skipped (already initialized)');
      return;
    }
    console.log(`[GRACEX SPORT] Initializing Sport module v${VERSION}`);
    console.log('[GRACEX SPORT] © Zac Crockett & Jason Treadaway');
    
    initLiveBarToggles();
    initSportSelector();
    initBrain();
    initFavorites();
    initPredictions();
    initRacing();
    initControls();
    initVoice();
    updateStatsDisplay();
    
    // Initial load
    updateLiveScores();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', stopAutoRefresh);
    
    console.log('[GRACEX SPORT] Module initialized successfully ✓');
    isInitializedOnce = true;
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // ============================================
  // PUBLIC API
  // ============================================
  
  window.GRACEX_Sport = {
    init,
    version: VERSION,
    getData: () => ({ ...sportData }),
    getSportConfig,
    selectSport,
    updateScores: updateLiveScores,
    generatePredictions,
    trackPrediction,
    sharePrediction,
    updateStats: updateStatsDisplay,
    startAutoRefresh,
    stopAutoRefresh
  };

  // ============================================
  // BRAIN WIRING - Level 5 Integration
  // ============================================
  function wireSportBrain() {
    if (typeof window.setupModuleBrain !== 'function') {
      console.warn('[SPORT] Brain system not available - running standalone');
      return;
    }

    window.setupModuleBrain('sport', {
      capabilities: {
        hasLiveData: true,
        hasPredictions: true,
        hasOddsTracking: true,
        hasMultiSport: true
      },

      onQuery: async (query) => {
        // Handle AI queries about sports data
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('predict') || lowerQuery.includes('odds')) {
          const activeSport = currentSport || 'football';
          return `Analyzing ${activeSport} data for predictions...`;
        }
        
        if (lowerQuery.includes('live') || lowerQuery.includes('score')) {
          return 'Fetching live scores...';
        }
        
        return 'How can I help with sports data?';
      },

      onSuggestion: (suggestion) => {
        // Handle brain suggestions
        if (suggestion.type === 'sport_switch') {
          selectSport(suggestion.sport);
        }
      }
    });

    console.log('[SPORT] ✅ Brain wired - Level 5 integration active');
  }

  // Wire brain on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSportBrain);
  } else {
    wireSportBrain();
  }

  // Ensure initialization when loaded via Router (dynamic module mount)
  try {
    document.addEventListener('gracex:module:loaded', function(e) {
      if (e && e.detail && e.detail.module === 'sport') {
        console.log('[GRACEX SPORT] Router event detected, initializing...');
        try {
          gxSyncSportLiveUI();
          setTimeout(() => {
            isInitializedOnce = false;
            init();
            updateLiveScores();
          }, 50);
        } catch (err) {
          console.warn('[GRACEX SPORT] Init after router event failed:', err);
        }
      }
    });
  } catch (_) {}

})();
