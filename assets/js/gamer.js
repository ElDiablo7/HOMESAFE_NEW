/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRACE-X Gamer Mode™ - Enhanced Module Logic V6
 * Screen-time balance, game tracking & healthy gaming habits
 * ═══════════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    GAMES: 'gamer_games',
    SESSIONS: 'gamer_sessions',
    SETTINGS: 'gamer_settings'
  };

  let state = {
    games: [],
    sessions: [],
    timerRunning: false,
    timerPaused: false,
    timerStartTime: null,
    timerPausedTime: 0,
    timerInterval: null,
    breakInterval: null,
    currentGame: ''
  };

  function init() {
    if (!document.getElementById("gamer-stats-card")) {
      return;
    }

    console.log('[GRACE-X Gamer] Initializing V6...');

    loadState();
    initBrain();
    initTimer();
    initBacklog();
    initMoodCheckin();
    initHistory();
    initTabs();
    initQuickActions();

    updateDashboard();
    renderBacklog();
    renderHistory();
    populateGameDropdown();
  }

  function loadState() {
    if (!window.GXStorage) return;
    state.games = GXStorage.get(STORAGE_KEYS.GAMES, []);
    state.sessions = GXStorage.get(STORAGE_KEYS.SESSIONS, []);
  }

  function saveState() {
    if (!window.GXStorage) return;
    GXStorage.set(STORAGE_KEYS.GAMES, state.games);
    GXStorage.set(STORAGE_KEYS.SESSIONS, state.sessions);
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function formatTimeShort(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }

  function updateDashboard() {
    const today = new Date().toDateString();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Calculate today's playtime
    const todaySessions = state.sessions.filter(s => 
      new Date(s.date).toDateString() === today
    );
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Calculate this week's playtime
    const weekSessions = state.sessions.filter(s => 
      new Date(s.date).getTime() > weekAgo
    );
    const weekMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Count games
    const totalGames = state.games.length;
    const completedGames = state.games.filter(g => g.status === 'completed').length;

    // Update stats
    updateElement('gamer-stat-today', formatTimeShort(todayMinutes));
    updateElement('gamer-stat-week', formatTimeShort(weekMinutes));
    updateElement('gamer-stat-games', totalGames);
    updateElement('gamer-stat-completed', completedGames);

    // Update weekly limit progress (14 hours = 840 minutes)
    const weeklyLimit = 840;
    const limitPercent = Math.min(100, (weekMinutes / weeklyLimit) * 100);
    updateElement('gamer-limit-percent', `${Math.round(limitPercent)}%`);
    
    const progressBar = document.querySelector('#gamer-limit-progress .gx-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${limitPercent}%`;
      // Change color based on usage
      const progress = document.getElementById('gamer-limit-progress');
      if (progress) {
        progress.classList.remove('gx-progress-success', 'gx-progress-warning', 'gx-progress-danger');
        if (limitPercent < 50) {
          progress.classList.add('gx-progress-success');
        } else if (limitPercent < 80) {
          progress.classList.add('gx-progress-warning');
        } else {
          progress.classList.add('gx-progress-danger');
        }
      }
    }
  }

  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Initialize brain panel
  function initBrain() {
    if (window.setupModuleBrain) {
      window.setupModuleBrain("gamer", {
        panelId: "gamer-brain-panel",
        inputId: "gamer-brain-input",
        sendId: "gamer-brain-send",
        outputId: "gamer-brain-output",
        clearId: "gamer-brain-clear",
        initialMessage: "Hey! I'm here to help with gaming recommendations, balance tips, and tracking your playtime. What are you playing?"
      });
    }
  }

  // Initialize session timer
  function initTimer() {
    const startBtn = document.getElementById('gamer-timer-start');
    const pauseBtn = document.getElementById('gamer-timer-pause');
    const stopBtn = document.getElementById('gamer-timer-stop');
    const timerDisplay = document.getElementById('gamer-timer-value');
    const timerStatus = document.getElementById('gamer-timer-status');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (state.timerRunning && !state.timerPaused) return;

        if (state.timerPaused) {
          // Resume
          state.timerStartTime = Date.now() - state.timerPausedTime;
          state.timerPaused = false;
        } else {
          // Fresh start
          state.timerStartTime = Date.now();
          state.timerPausedTime = 0;
        }

        state.timerRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        if (timerStatus) timerStatus.textContent = 'Session in progress...';

        // Start interval
        state.timerInterval = setInterval(() => {
          if (!state.timerPaused) {
            const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
            if (timerDisplay) timerDisplay.textContent = formatTime(elapsed);
          }
        }, 1000);

        // Set break reminder
        const breakInterval = parseInt(document.getElementById('gamer-break-interval')?.value) || 0;
        if (breakInterval > 0) {
          state.breakInterval = setInterval(() => {
            if (window.GXToast) {
              GXToast.warning('Break Time! 🧘', 'Time to stretch and rest your eyes');
            }
            // Try to play a sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
              audio.play().catch(() => {});
            } catch (e) {}
          }, breakInterval * 60 * 1000);
        }

        if (window.GXToast) {
          GXToast.info('Timer Started', 'Gaming session tracking...');
        }
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (!state.timerRunning) return;

        state.timerPaused = !state.timerPaused;
        
        if (state.timerPaused) {
          state.timerPausedTime = Date.now() - state.timerStartTime;
          pauseBtn.textContent = '▶️ Resume';
          if (timerStatus) timerStatus.textContent = 'Paused';
          startBtn.disabled = false;
        } else {
          state.timerStartTime = Date.now() - state.timerPausedTime;
          pauseBtn.textContent = '⏸️ Pause';
          if (timerStatus) timerStatus.textContent = 'Session in progress...';
          startBtn.disabled = true;
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (!state.timerRunning && state.timerPausedTime === 0) {
          if (window.GXToast) GXToast.info('No Session', 'Start the timer first');
          return;
        }

        // Calculate duration
        let elapsed;
        if (state.timerPaused) {
          elapsed = state.timerPausedTime;
        } else {
          elapsed = Date.now() - state.timerStartTime;
        }
        const durationMinutes = Math.round(elapsed / 60000);

        // Clear intervals
        clearInterval(state.timerInterval);
        clearInterval(state.breakInterval);

        // Log session
        const currentGame = document.getElementById('gamer-current-game')?.value || 'Unknown';
        const session = {
          id: Date.now(),
          game: currentGame,
          duration: durationMinutes,
          date: new Date().toISOString(),
          mood: null,
          quality: null
        };

        state.sessions.push(session);
        saveState();

        // Reset timer
        state.timerRunning = false;
        state.timerPaused = false;
        state.timerStartTime = null;
        state.timerPausedTime = 0;

        if (timerDisplay) timerDisplay.textContent = '00:00:00';
        if (timerStatus) timerStatus.textContent = 'Session logged!';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '⏸️ Pause';

        updateDashboard();
        renderHistory();

        if (window.GXToast) {
          GXToast.success('Session Logged', `${formatTimeShort(durationMinutes)} of gaming recorded`);
        }
      });
    }
  }

  // Initialize game backlog
  function initBacklog() {
    const addBtn = document.getElementById('gamer-game-add');
    const randomBtn = document.getElementById('gamer-random-pick');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('gamer-game-input');
        const platformSelect = document.getElementById('gamer-platform');
        const statusSelect = document.getElementById('gamer-game-status');

        const title = titleInput?.value?.trim();
        if (!title) {
          if (window.GXToast) GXToast.warning('Missing Info', 'Enter a game title');
          return;
        }

        const game = {
          id: Date.now(),
          title,
          platform: platformSelect?.value || 'PC',
          status: statusSelect?.value || 'backlog',
          addedDate: new Date().toISOString(),
          playtime: 0
        };

        state.games.push(game);
        saveState();
        renderBacklog();
        populateGameDropdown();
        updateDashboard();

        if (titleInput) titleInput.value = '';

        if (window.GXToast) {
          GXToast.success('Game Added', `${title} added to your list`);
        }
      });
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const backlogGames = state.games.filter(g => g.status === 'backlog' || g.status === 'playing');
        if (backlogGames.length === 0) {
          if (window.GXToast) GXToast.info('No Games', 'Add some games to your backlog first');
          return;
        }

        const randomGame = backlogGames[Math.floor(Math.random() * backlogGames.length)];
        
        if (window.GXModal) {
          GXModal.show({
            title: '🎲 Random Pick!',
            content: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🎮</div>
                <h3 style="margin: 0;">${randomGame.title}</h3>
                <p class="hint">${randomGame.platform}</p>
              </div>
            `,
            buttons: [
              { text: 'Pick Again', class: 'gx-btn-ghost', closeOnClick: false, onClick: () => randomBtn.click() },
              { text: 'Play This!', class: 'gx-btn-primary' }
            ]
          });
        } else {
          if (window.GXToast) {
            GXToast.info('Random Pick', `Play: ${randomGame.title}`);
          }
        }
      });
    }
  }

  function renderBacklog() {
    const listEl = document.getElementById('gamer-game-list');
    if (!listEl) return;

    // Get current filter
    const activeTab = document.querySelector('#gamer-backlog-tabs .gx-tab.active');
    const filter = activeTab?.dataset.tab || 'all';

    let filtered = state.games;
    if (filter !== 'all') {
      filtered = state.games.filter(g => g.status === filter);
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state" style="padding: 20px;">
          <div class="gx-empty-state-icon">🎮</div>
          <div class="gx-empty-state-title">No games yet</div>
          <div class="gx-empty-state-message">Add games to your backlog</div>
        </div>
      `;
      return;
    }

    const statusIcons = {
      backlog: '📋',
      playing: '🎮',
      completed: '✅',
      dropped: '❌'
    };

    const statusColors = {
      backlog: 'var(--gx-accent-blue)',
      playing: 'var(--gx-accent-violet)',
      completed: 'var(--gx-accent-emerald)',
      dropped: 'var(--gx-accent-red)'
    };

    listEl.innerHTML = filtered.map(g => `
      <li class="gx-list-item" data-id="${g.id}">
        <span style="font-size: 1.25rem;">${statusIcons[g.status] || '🎮'}</span>
        <div class="gx-list-content">
          <strong>${g.title}</strong>
          <div style="font-size: 0.8rem; opacity: 0.7;">
            ${g.platform} · <span style="color: ${statusColors[g.status]};">${g.status}</span>
          </div>
        </div>
        <div class="gx-list-actions">
          <select class="status-select" data-id="${g.id}" style="font-size: 0.8rem; padding: 4px;">
            <option value="backlog" ${g.status === 'backlog' ? 'selected' : ''}>📋 Backlog</option>
            <option value="playing" ${g.status === 'playing' ? 'selected' : ''}>🎮 Playing</option>
            <option value="completed" ${g.status === 'completed' ? 'selected' : ''}>✅ Done</option>
            <option value="dropped" ${g.status === 'dropped' ? 'selected' : ''}>❌ Dropped</option>
          </select>
          <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="delete" style="font-size: 0.8rem;">🗑️</button>
        </div>
      </li>
    `).join('');

    // Add event listeners
    listEl.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = parseInt(select.dataset.id);
        const game = state.games.find(g => g.id === id);
        if (game) {
          game.status = e.target.value;
          saveState();
          renderBacklog();
          updateDashboard();
        }
      });
    });

    listEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.closest('.gx-list-item').dataset.id);
        if (window.GXModal) {
          GXModal.confirm({
            title: 'Remove Game',
            message: 'Remove this game from your list?',
            onConfirm: () => {
              state.games = state.games.filter(g => g.id !== id);
              saveState();
              renderBacklog();
              populateGameDropdown();
              updateDashboard();
            }
          });
        }
      });
    });
  }

  function populateGameDropdown() {
    const select = document.getElementById('gamer-current-game');
    if (!select) return;

    const playingGames = state.games.filter(g => g.status === 'playing' || g.status === 'backlog');
    
    select.innerHTML = '<option value="">Select game…</option>' + 
      playingGames.map(g => `<option value="${g.title}">${g.title}</option>`).join('');
  }

  // Initialize mood check-in
  function initMoodCheckin() {
    const saveBtn = document.getElementById('gamer-mood-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      const mood = document.getElementById('gamer-mood-select')?.value;
      const quality = document.getElementById('gamer-quality-select')?.value;
      const notes = document.getElementById('gamer-mood-notes')?.value;

      if (!mood) {
        if (window.GXToast) GXToast.warning('Select Mood', 'How are you feeling?');
        return;
      }

      // Update the most recent session with mood data
      if (state.sessions.length > 0) {
        const lastSession = state.sessions[state.sessions.length - 1];
        lastSession.mood = mood;
        lastSession.quality = quality;
        lastSession.notes = notes;
        saveState();
        renderHistory();
      }

      // Clear form
      document.getElementById('gamer-mood-select').value = '';
      document.getElementById('gamer-quality-select').value = '';
      document.getElementById('gamer-mood-notes').value = '';

      if (window.GXToast) {
        GXToast.success('Check-in Logged', 'Thanks for reflecting on your session!');
      }
    });
  }

  // Initialize session history
  function initHistory() {
    const exportBtn = document.getElementById('gamer-export-history');
    const clearBtn = document.getElementById('gamer-clear-history');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (state.sessions.length === 0) {
          if (window.GXToast) GXToast.info('No Data', 'No sessions to export');
          return;
        }

        const data = state.sessions.map(s => ({
          Date: new Date(s.date).toLocaleDateString(),
          Game: s.game,
          Duration: `${s.duration} minutes`,
          Mood: s.mood || '',
          Quality: s.quality || '',
          Notes: s.notes || ''
        }));

        if (window.GXData) {
          GXData.exportCSV(data, 'gamer-history.csv');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.GXModal) {
          GXModal.confirm({
            title: 'Clear History',
            message: 'Delete all session history?',
            onConfirm: () => {
              state.sessions = [];
              saveState();
              renderHistory();
              updateDashboard();
            }
          });
        }
      });
    }
  }

  function renderHistory() {
    const listEl = document.getElementById('gamer-history-list');
    if (!listEl) return;

    const recent = state.sessions.slice(-20).reverse();

    if (recent.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state" style="padding: 20px;">
          <div class="gx-empty-state-icon">🎮</div>
          <div class="gx-empty-state-title">No sessions logged</div>
          <div class="gx-empty-state-message">Start the timer to track your gaming</div>
        </div>
      `;
      return;
    }

    const moodIcons = {
      energized: '⚡',
      relaxed: '😌',
      focused: '🎯',
      neutral: '😐',
      tired: '😴',
      stressed: '😤'
    };

    listEl.innerHTML = recent.map(s => {
      const date = new Date(s.date);
      const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="result-row" style="flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px;">
            <strong>${s.game || 'Unknown'}</strong>
            <div style="font-size: 0.8rem; opacity: 0.7;">${dateStr} at ${timeStr}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="gx-badge">${formatTimeShort(s.duration)}</span>
            ${s.mood ? `<span>${moodIcons[s.mood] || ''}</span>` : ''}
            ${s.quality ? `<span style="color: gold;">${'⭐'.repeat(parseInt(s.quality))}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Initialize tabs
  function initTabs() {
    const tabs = document.querySelectorAll('#gamer-backlog-tabs .gx-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBacklog();
      });
    });
  }

  // Initialize quick actions
  function initQuickActions() {
    const stretchBtn = document.getElementById('gamer-quick-stretch');
    const waterBtn = document.getElementById('gamer-quick-water');
    const breakBtn = document.getElementById('gamer-quick-break');
    const doneBtn = document.getElementById('gamer-quick-done');

    if (stretchBtn) {
      stretchBtn.addEventListener('click', () => {
        if (window.GXModal) {
          GXModal.show({
            title: '🧘 Quick Stretch',
            content: `
              <div style="text-align: left;">
                <p><strong>1. Wrist Circles</strong> - 10 each direction</p>
                <p><strong>2. Neck Rolls</strong> - 5 each direction</p>
                <p><strong>3. Shoulder Shrugs</strong> - Hold 5 seconds, repeat 5x</p>
                <p><strong>4. Stand & Stretch</strong> - Reach up, hold 10 seconds</p>
              </div>
            `,
            buttons: [{ text: 'Done!', class: 'gx-btn-primary' }]
          });
        }
      });
    }

    if (waterBtn) {
      waterBtn.addEventListener('click', () => {
        if (window.GXToast) {
          GXToast.success('Stay Hydrated! 💧', 'Remember to drink water regularly');
        }
      });
    }

    if (breakBtn) {
      breakBtn.addEventListener('click', () => {
        let timeLeft = 300; // 5 minutes
        
        if (window.GXModal) {
          const modal = GXModal.show({
            title: '☕ 5 Minute Break',
            content: `
              <div style="text-align: center; padding: 20px;">
                <div id="break-timer" style="font-size: 3rem; font-weight: 700;">5:00</div>
                <p class="hint">Step away from the screen!</p>
              </div>
            `,
            buttons: [{ text: 'End Break', class: 'gx-btn-ghost' }]
          });

          const timerEl = document.getElementById('break-timer');
          const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
              clearInterval(interval);
              modal.close();
              if (window.GXToast) {
                GXToast.success('Break Over!', 'Ready to get back to gaming?');
              }
              return;
            }
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            if (timerEl) {
              timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
            }
          }, 1000);
        }
      });
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        // Stop timer if running
        const stopBtn = document.getElementById('gamer-timer-stop');
        if (state.timerRunning) {
          stopBtn?.click();
        }

        if (window.GXToast) {
          GXToast.success('Good Session! 🎉', 'See you next time. Remember to rest!');
        }
      });
    }
  }

  // Initialize on DOM ready and module load
  document.addEventListener('DOMContentLoaded', init);

  document.addEventListener('gracex:module:loaded', (ev) => {
    if (ev.detail && (ev.detail.module === 'gamer' || (ev.detail.url && ev.detail.url.includes('gamer.html')))) {
      setTimeout(init, 50);
    }
  });

  if (document.getElementById('gamer-stats-card')) {
    setTimeout(init, 100);
  }

})();
