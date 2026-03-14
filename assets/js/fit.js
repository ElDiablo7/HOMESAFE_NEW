/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRACE-X Fit™ - Enhanced Module Logic V6
 * Movement, strength and fitness plans
 * ═══════════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // Storage keys
  const STORAGE_KEYS = {
    CHECKINS: 'fit_checkins',
    WATER: 'fit_water_today',
    GOALS: 'fit_goals',
    STREAK: 'fit_streak',
    LAST_CHECKIN: 'fit_last_checkin'
  };

  // State
  let state = {
    todaySteps: 0,
    todayMinutes: 0,
    todayWater: 0,
    streak: 0,
    goals: []
  };

  // Only run when Fit module is actually on screen
  function init() {
    if (!document.getElementById("fit-stats-card")) {
      return;
    }

    console.log('[GRACE-X Fit] Initializing V6...');
    
    loadState();
    initBrain();
    initStats();
    initCheckin();
    initHydration();
    initWorkouts();
    initStretches();
    initGoals();
    initHistory();
    
    updateUI();
  }

  // Load state from storage
  function loadState() {
    if (!window.GXStorage) return;

    const today = new Date().toDateString();
    const lastCheckin = GXStorage.get(STORAGE_KEYS.LAST_CHECKIN, '');
    
    // Check if it's a new day
    if (lastCheckin !== today) {
      // Reset daily values
      state.todaySteps = 0;
      state.todayMinutes = 0;
      state.todayWater = 0;
      GXStorage.set(STORAGE_KEYS.WATER, 0);
    } else {
      state.todayWater = GXStorage.get(STORAGE_KEYS.WATER, 0);
    }
    
    state.streak = GXStorage.get(STORAGE_KEYS.STREAK, 0);
    state.goals = GXStorage.get(STORAGE_KEYS.GOALS, []);
    
    // Calculate today's totals from checkins
    const checkins = GXStorage.get(STORAGE_KEYS.CHECKINS, []);
    const todayCheckins = checkins.filter(c => new Date(c.timestamp).toDateString() === today);
    
    todayCheckins.forEach(c => {
      state.todaySteps += parseInt(c.steps) || 0;
      state.todayMinutes += parseInt(c.minutes) || 0;
    });
  }

  // Save state to storage
  function saveState() {
    if (!window.GXStorage) return;
    
    const today = new Date().toDateString();
    GXStorage.set(STORAGE_KEYS.LAST_CHECKIN, today);
    GXStorage.set(STORAGE_KEYS.WATER, state.todayWater);
    GXStorage.set(STORAGE_KEYS.STREAK, state.streak);
    GXStorage.set(STORAGE_KEYS.GOALS, state.goals);
  }

  // Update all UI elements
  function updateUI() {
    // Update stats
    updateElement('fit-stat-steps', state.todaySteps.toLocaleString());
    updateElement('fit-stat-minutes', state.todayMinutes);
    updateElement('fit-stat-water', state.todayWater.toFixed(1));
    updateElement('fit-stat-streak', state.streak);

    // Update progress bars
    const stepsPercent = Math.min(100, (state.todaySteps / 10000) * 100);
    const minutesPercent = Math.min(100, (state.todayMinutes / 30) * 100);
    const waterPercent = Math.min(100, (state.todayWater / 2.5) * 100);

    updateElement('fit-steps-percent', `${Math.round(stepsPercent)}%`);
    updateElement('fit-minutes-percent', `${Math.round(minutesPercent)}%`);
    updateElement('fit-water-percent', `${Math.round(waterPercent)}%`);

    updateProgressBar('fit-steps-progress', stepsPercent);
    updateProgressBar('fit-minutes-progress', minutesPercent);
    updateProgressBar('fit-water-progress', waterPercent);

    updateElement('fit-water-display', `Today: ${state.todayWater.toFixed(1)}L / 2.5L`);
  }

  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateProgressBar(id, percent) {
    const container = document.getElementById(id);
    if (container) {
      const bar = container.querySelector('.gx-progress-bar');
      if (bar) bar.style.width = `${percent}%`;
    }
  }

  // Initialize brain panel
  function initBrain() {
    if (window.setupModuleBrain) {
      window.setupModuleBrain("fit", {
        panelId: "fit-brain-panel",
        inputId: "fit-brain-input",
        sendId: "fit-brain-btn",
        outputId: "fit-brain-output",
        clearId: "fit-brain-clear",
        initialMessage: "Ready to help with your fitness journey. Ask me anything about workouts, nutrition, or wellness!"
      });
    }

    // Export chat button
    const exportBtn = document.getElementById('fit-brain-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const output = document.getElementById('fit-brain-output');
        if (!output) return;
        
        const messages = output.querySelectorAll('.brain-message');
        const chatHistory = Array.from(messages).map(m => m.textContent).join('\n\n');
        
        if (window.GXData) {
          const blob = new Blob([chatHistory], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'fit-chat-history.txt';
          a.click();
          URL.revokeObjectURL(url);
          
          if (window.GXToast) GXToast.success('Exported', 'Chat history exported');
        }
      });
    }
  }

  // Initialize stats dashboard
  function initStats() {
    // Stats are rendered in HTML, just ensure they update
  }

  // Initialize check-in functionality
  function initCheckin() {
    const submitBtn = document.getElementById('fit-submit-checkin');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const stepsInput = document.getElementById('fit-steps');
      const minutesInput = document.getElementById('fit-minutes');
      const moodSelect = document.getElementById('fit-mood');

      const steps = parseInt(stepsInput?.value) || 0;
      const minutes = parseInt(minutesInput?.value) || 0;
      const mood = moodSelect?.value || '';

      if (steps === 0 && minutes === 0) {
        if (window.GXToast) GXToast.warning('Input Required', 'Please enter steps or active minutes');
        return;
      }

      // Update state
      state.todaySteps += steps;
      state.todayMinutes += minutes;

      // Check for streak
      const today = new Date().toDateString();
      const lastCheckin = window.GXStorage?.get(STORAGE_KEYS.LAST_CHECKIN, '');
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastCheckin === yesterday) {
        state.streak++;
      } else if (lastCheckin !== today) {
        state.streak = 1;
      }

      // Save to checkins array
      if (window.GXStorage) {
        const checkin = {
          steps,
          minutes,
          mood,
          timestamp: new Date().toISOString()
        };
        const checkins = GXStorage.get(STORAGE_KEYS.CHECKINS, []);
        checkins.push(checkin);
        if (checkins.length > 100) checkins.shift();
        GXStorage.set(STORAGE_KEYS.CHECKINS, checkins);
      }

      saveState();
      updateUI();
      updateHistory();

      // Clear inputs
      if (stepsInput) stepsInput.value = '';
      if (minutesInput) minutesInput.value = '';
      if (moodSelect) moodSelect.value = '';

      if (window.GXToast) {
        GXToast.success('Activity Logged', `${steps.toLocaleString()} steps, ${minutes} mins recorded`);
      }
    });

    // View history button
    const historyBtn = document.getElementById('fit-view-history');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        const historyCard = document.getElementById('fit-history-card');
        if (historyCard) {
          historyCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // Initialize hydration tracking
  function initHydration() {
    // Quick water buttons
    document.querySelectorAll('[data-water]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseFloat(btn.dataset.water);
        state.todayWater += amount;
        saveState();
        updateUI();

        if (window.GXToast) {
          GXToast.success('Hydrated!', `+${amount * 1000}ml logged`);
        }

        // Check if goal reached
        if (state.todayWater >= 2.5) {
          if (window.GXToast) {
            GXToast.success('🎉 Goal Reached!', 'You\'ve hit your daily water goal!');
          }
        }
      });
    });

    // Reset button
    const resetBtn = document.getElementById('fit-water-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.GXModal) {
          GXModal.confirm({
            title: 'Reset Water',
            message: 'Are you sure you want to reset today\'s water intake?',
            onConfirm: () => {
              state.todayWater = 0;
              saveState();
              updateUI();
              if (window.GXToast) GXToast.info('Reset', 'Water intake reset');
            }
          });
        } else {
          state.todayWater = 0;
          saveState();
          updateUI();
        }
      });
    }
  }

  // Initialize workout generator
  function initWorkouts() {
    const generateBtn = document.getElementById('fit-generate-workout');
    const outputDiv = document.getElementById('fit-workout-output');
    
    if (!generateBtn || !outputDiv) return;

    const workouts = {
      full: {
        none: [
          { name: 'Jumping Jacks', reps: '30 secs' },
          { name: 'Push-ups', reps: '10-15' },
          { name: 'Squats', reps: '15' },
          { name: 'Plank', reps: '30 secs' },
          { name: 'Lunges', reps: '10 each leg' },
          { name: 'Mountain Climbers', reps: '20' },
          { name: 'Burpees', reps: '8-10' }
        ]
      },
      upper: {
        none: [
          { name: 'Push-ups', reps: '15' },
          { name: 'Diamond Push-ups', reps: '10' },
          { name: 'Pike Push-ups', reps: '10' },
          { name: 'Arm Circles', reps: '30 secs' },
          { name: 'Tricep Dips (chair)', reps: '12' }
        ]
      },
      lower: {
        none: [
          { name: 'Squats', reps: '20' },
          { name: 'Lunges', reps: '12 each' },
          { name: 'Glute Bridges', reps: '15' },
          { name: 'Calf Raises', reps: '20' },
          { name: 'Wall Sit', reps: '30 secs' }
        ]
      },
      core: {
        none: [
          { name: 'Plank', reps: '45 secs' },
          { name: 'Bicycle Crunches', reps: '20' },
          { name: 'Leg Raises', reps: '12' },
          { name: 'Russian Twists', reps: '20' },
          { name: 'Dead Bug', reps: '10 each side' }
        ]
      },
      cardio: {
        none: [
          { name: 'High Knees', reps: '30 secs' },
          { name: 'Butt Kicks', reps: '30 secs' },
          { name: 'Jump Squats', reps: '15' },
          { name: 'Burpees', reps: '10' },
          { name: 'Star Jumps', reps: '15' }
        ]
      }
    };

    generateBtn.addEventListener('click', () => {
      const time = parseInt(document.getElementById('fit-workout-time')?.value) || 15;
      const focus = document.getElementById('fit-workout-focus')?.value || 'full';
      const equipment = document.getElementById('fit-workout-equipment')?.value || 'none';

      const exercises = workouts[focus]?.[equipment] || workouts[focus]?.none || workouts.full.none;
      
      // Select exercises based on time
      const numExercises = Math.ceil(time / 3);
      const selectedExercises = exercises.slice(0, numExercises);

      outputDiv.style.display = 'block';
      outputDiv.innerHTML = `
        <h4 style="margin: 0 0 12px; color: var(--gx-accent-emerald);">🏋️ Your ${time}-Minute Workout</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${selectedExercises.map((ex, i) => `
            <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gx-border);">
              <span><strong>${i + 1}.</strong> ${ex.name}</span>
              <span class="gx-badge">${ex.reps}</span>
            </li>
          `).join('')}
        </ul>
        <p class="hint" style="margin-top: 12px;">
          Rest 30-60 seconds between exercises. Adjust reps to your fitness level.
        </p>
      `;

      if (window.GXToast) {
        GXToast.success('Workout Generated', `${numExercises} exercises ready to go!`);
      }
    });
  }

  // Initialize stretch tabs
  function initStretches() {
    const tabs = document.querySelectorAll('#fit-stretch-tabs .gx-tab');
    const contents = document.querySelectorAll('#fit-stretch-content .gx-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  }

  // Initialize goals tracking
  function initGoals() {
    const addBtn = document.getElementById('fit-goal-add');
    const clearBtn = document.getElementById('fit-goals-clear');
    const listEl = document.getElementById('fit-goals-list');

    if (!addBtn || !listEl) return;

    function renderGoals() {
      if (state.goals.length === 0) {
        listEl.innerHTML = `
          <div class="gx-empty-state" style="padding: 20px;">
            <div class="gx-empty-state-icon">🎯</div>
            <div class="gx-empty-state-title">No goals set</div>
            <div class="gx-empty-state-message">Add your first fitness goal!</div>
          </div>
        `;
        return;
      }

      listEl.innerHTML = state.goals.map((goal, i) => `
        <li class="gx-list-item ${goal.completed ? 'completed' : ''}">
          <div class="gx-list-checkbox ${goal.completed ? 'checked' : ''}" data-action="toggle" data-index="${i}"></div>
          <div class="gx-list-content">
            <strong>${goal.text}</strong>
            <div style="font-size: 0.8rem; opacity: 0.7;">
              Progress: ${goal.current || 0} / ${goal.target}
              <div class="gx-progress" style="height: 4px; margin-top: 4px;">
                <div class="gx-progress-bar" style="width: ${Math.min(100, ((goal.current || 0) / goal.target) * 100)}%"></div>
              </div>
            </div>
          </div>
          <div class="gx-list-actions">
            <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="increment" data-index="${i}" style="font-size: 0.8rem;">+1</button>
            <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="delete" data-index="${i}" style="font-size: 0.8rem;">🗑️</button>
          </div>
        </li>
      `).join('');

      // Add event listeners
      listEl.querySelectorAll('[data-action="toggle"]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          state.goals[idx].completed = !state.goals[idx].completed;
          saveState();
          renderGoals();
        });
      });

      listEl.querySelectorAll('[data-action="increment"]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          state.goals[idx].current = (state.goals[idx].current || 0) + 1;
          if (state.goals[idx].current >= state.goals[idx].target) {
            state.goals[idx].completed = true;
            if (window.GXToast) GXToast.success('🎉 Goal Complete!', state.goals[idx].text);
          }
          saveState();
          renderGoals();
        });
      });

      listEl.querySelectorAll('[data-action="delete"]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          state.goals.splice(idx, 1);
          saveState();
          renderGoals();
        });
      });
    }

    addBtn.addEventListener('click', () => {
      const textInput = document.getElementById('fit-goal-input');
      const targetInput = document.getElementById('fit-goal-target');
      
      const text = textInput?.value?.trim();
      const target = parseInt(targetInput?.value) || 1;

      if (!text) {
        if (window.GXToast) GXToast.warning('Input Required', 'Please enter a goal');
        return;
      }

      state.goals.push({ text, target, current: 0, completed: false });
      saveState();
      renderGoals();

      if (textInput) textInput.value = '';
      if (targetInput) targetInput.value = '';

      if (window.GXToast) GXToast.success('Goal Added', text);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.GXModal) {
          GXModal.confirm({
            title: 'Clear Goals',
            message: 'Are you sure you want to remove all goals?',
            onConfirm: () => {
              state.goals = [];
              saveState();
              renderGoals();
            }
          });
        }
      });
    }

    renderGoals();
  }

  // Initialize history display
  function initHistory() {
    updateHistory();

    const exportBtn = document.getElementById('fit-export-history');
    const clearBtn = document.getElementById('fit-clear-history');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (!window.GXStorage || !window.GXData) return;
        
        const checkins = GXStorage.get(STORAGE_KEYS.CHECKINS, []);
        if (checkins.length === 0) {
          if (window.GXToast) GXToast.info('No Data', 'No activity history to export');
          return;
        }

        GXData.exportJSON(checkins, 'fit-activity-history.json');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.GXModal) {
          GXModal.confirm({
            title: 'Clear History',
            message: 'This will permanently delete all your activity history. Continue?',
            onConfirm: () => {
              if (window.GXStorage) {
                GXStorage.set(STORAGE_KEYS.CHECKINS, []);
              }
              updateHistory();
              if (window.GXToast) GXToast.info('Cleared', 'Activity history deleted');
            }
          });
        }
      });
    }
  }

  function updateHistory() {
    const listEl = document.getElementById('fit-history-list');
    if (!listEl || !window.GXStorage) return;

    const checkins = GXStorage.get(STORAGE_KEYS.CHECKINS, []);
    const last7Days = checkins.filter(c => {
      const date = new Date(c.timestamp);
      const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).reverse();

    if (last7Days.length === 0) {
      listEl.innerHTML = `
        <div class="gx-empty-state">
          <div class="gx-empty-state-icon">📊</div>
          <div class="gx-empty-state-title">No activity logged yet</div>
          <div class="gx-empty-state-message">Use the Daily Check-In to start tracking</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = last7Days.map(c => {
      const date = new Date(c.timestamp);
      const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="result-row">
          <div>
            <strong>${dateStr}</strong>
            <span style="opacity: 0.6; font-size: 0.8rem;"> at ${timeStr}</span>
            ${c.mood ? `<span class="gx-badge" style="margin-left: 8px;">${c.mood}</span>` : ''}
          </div>
          <div style="text-align: right;">
            ${c.steps ? `<span style="color: var(--gx-accent-blue);">🚶 ${parseInt(c.steps).toLocaleString()} steps</span>` : ''}
            ${c.minutes ? `<span style="color: var(--gx-accent-emerald); margin-left: 12px;">⏱️ ${c.minutes} mins</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Initialize on DOM ready and module load
  document.addEventListener('DOMContentLoaded', init);
  
  document.addEventListener('gracex:module:loaded', (ev) => {
    if (ev.detail && (ev.detail.module === 'fit' || (ev.detail.url && ev.detail.url.includes('fit.html')))) {
      setTimeout(init, 50);
    }
  });

  // Also try immediate init
  if (document.getElementById('fit-stats-card')) {
    setTimeout(init, 100);
  }

})();
