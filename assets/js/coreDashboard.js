// assets/js/coreDashboard.js
// GRACE-X Core Status Dashboard Controller
// Real-time system monitoring, module status, and analytics
// © Zac Crockett

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  
  const STORAGE_KEY = 'gracex_dashboard_data';
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
  const MAX_LOGS = 50;
  const MAX_ACTIVITY_POINTS = 60; // Last 60 data points (1 hour at 1 min intervals)

  // Module definitions (16 modules total including Guardian)
  const MODULES = [
    { id: 'core', name: 'Core', emoji: '🏠', color: '#06b6d4' },
    { id: 'builder', name: 'Builder', emoji: '🏗️', color: '#f59e0b' },
    { id: 'siteops', name: 'SiteOps', emoji: '🎬', color: '#ef4444' },
    { id: 'tradelink', name: 'TradeLink', emoji: '🔗', color: '#3b82f6' },
    { id: 'beauty', name: 'Beauty', emoji: '💄', color: '#ec4899' },
    { id: 'fit', name: 'Fit', emoji: '💪', color: '#10b981' },
    { id: 'yoga', name: 'Yoga', emoji: '🧘', color: '#8b5cf6' },
    { id: 'uplift', name: 'Uplift', emoji: '🌟', color: '#f97316' },
    { id: 'chef', name: 'Chef', emoji: '👨‍🍳', color: '#84cc16' },
    { id: 'artist', name: 'Artist', emoji: '🎨', color: '#06b6d4' },
    { id: 'family', name: 'Family', emoji: '👨‍👩‍👧', color: '#a855f7' },
    { id: 'gamer', name: 'Gamer', emoji: '🎮', color: '#6366f1' },
    { id: 'accounting', name: 'Accounting', emoji: '📊', color: '#14b8a6' },
    { id: 'osint', name: 'OSINT', emoji: '🔍', color: '#64748b' },
    { id: 'sport', name: 'Sport', emoji: '⚽', color: '#22c55e' },
    { id: 'guardian', name: 'Guardian', emoji: '🛡️', color: '#dc2626' }
  ];

  // ============================================
  // STATE
  // ============================================
  
  let dashboardData = {
    bootTime: Date.now(),
    currentMode: 'Standard',
    activeModule: 'core',
    lastVoiceCommand: null,
    moduleStats: {},
    activityLog: [],
    systemLogs: [],
    feedStatuses: {
      brain: 'connected',
      sport: 'ready',
      racing: 'standby',
      tts: 'active',
      speech: 'ready',
      storage: 'available'
    }
  };

  let autoRefreshTimer = null;
  let chartInstances = {};

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults, keeping bootTime fresh
        dashboardData = {
          ...dashboardData,
          ...parsed,
          bootTime: dashboardData.bootTime // Don't restore boot time
        };
      }
    } catch (e) {
      console.warn('[GRACEX Dashboard] Failed to load data:', e);
    }
    
    // Initialize module stats if empty
    MODULES.forEach(mod => {
      if (!dashboardData.moduleStats[mod.id]) {
        dashboardData.moduleStats[mod.id] = {
          status: mod.id === 'core' ? 'active' : 'idle',
          lastAccessed: null,
          accessCount: 0,
          timeSpent: 0
        };
      }
    });
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardData));
    } catch (e) {
      console.warn('[GRACEX Dashboard] Failed to save data:', e);
    }
  }

  // ============================================
  // SYSTEM OVERVIEW
  // ============================================

  function updateSystemOverview() {
    // Uptime
    const uptimeEl = document.getElementById('sys-uptime');
    if (uptimeEl) {
      const uptime = Date.now() - dashboardData.bootTime;
      uptimeEl.textContent = formatDuration(uptime);
    }

    // Current Mode
    const modeEl = document.getElementById('sys-mode');
    if (modeEl) {
      modeEl.textContent = dashboardData.currentMode;
    }

    // Active Module
    const activeEl = document.getElementById('sys-active-module');
    if (activeEl) {
      const mod = MODULES.find(m => m.id === dashboardData.activeModule);
      activeEl.textContent = mod ? `${mod.emoji} ${mod.name}` : 'Core';
    }

    // Last Voice Command
    const voiceEl = document.getElementById('sys-last-voice');
    if (voiceEl) {
      voiceEl.textContent = dashboardData.lastVoiceCommand || '—';
      voiceEl.title = dashboardData.lastVoiceCommand || 'No recent command';
    }

    // Brain Status
    const brainEl = document.getElementById('sys-brain-status');
    if (brainEl) {
      const isLevel5 = window.GRACEX_BRAIN_API && typeof window.runModuleBrain === 'function';
      brainEl.textContent = isLevel5 ? 'Level 5 API' : 'Level 1 Local';
      brainEl.className = 'stat-value ' + (isLevel5 ? 'stat-status-good' : 'stat-status-warn');
    }

    // TTS Status
    const ttsEl = document.getElementById('sys-tts-status');
    if (ttsEl) {
      const ttsEnabled = window.GRACEX_TTS && GRACEX_TTS.isEnabled();
      ttsEl.textContent = ttsEnabled ? 'Enabled' : 'Disabled';
      ttsEl.className = 'stat-value ' + (ttsEnabled ? 'stat-status-good' : 'stat-status-warn');
    }

    // Last update timestamp
    const lastUpdateEl = document.getElementById('dashboard-last-update');
    if (lastUpdateEl) {
      lastUpdateEl.textContent = 'Updated: ' + formatTime(new Date());
    }
  }

  // ============================================
  // MODULE STATUS GRID
  // ============================================

  function renderModuleGrid() {
    const grid = document.getElementById('module-status-grid');
    if (!grid) return;

    grid.innerHTML = MODULES.map(mod => {
      const stats = dashboardData.moduleStats[mod.id] || {};
      const status = stats.status || 'idle';
      const lastAccess = stats.lastAccessed ? formatTimeAgo(stats.lastAccessed) : 'Never';
      
      return `
        <div class="module-status-item" data-module="${mod.id}" style="--mod-color: ${mod.color}">
          <span class="module-status-indicator status-${status}"></span>
          <span class="module-status-name">${mod.emoji} ${mod.name}™</span>
          <span class="module-status-time">${lastAccess}</span>
          <button class="module-status-btn" data-goto="${mod.id}">Go</button>
        </div>
      `;
    }).join('');

    // Wire up go buttons
    grid.querySelectorAll('.module-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const moduleId = btn.dataset.goto;
        if (moduleId) {
          window.location.hash = '#/' + moduleId;
        }
      });
    });

    // Wire up item clicks
    grid.querySelectorAll('.module-status-item').forEach(item => {
      item.addEventListener('click', () => {
        const moduleId = item.dataset.module;
        if (moduleId) {
          window.location.hash = '#/' + moduleId;
        }
      });
    });
  }

  // ============================================
  // CHARTS
  // ============================================

  function initCharts() {
    renderActivityChart();
    renderModuleUsageChart();
    renderActivityByModuleChart();
  }

  function renderActivityChart() {
    const canvas = document.getElementById('chart-activity');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Generate sample data (in production, this would come from actual logs)
    const dataPoints = dashboardData.activityLog.length > 0 
      ? dashboardData.activityLog.slice(-MAX_ACTIVITY_POINTS)
      : generateSampleActivityData();

    // Clear canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw lines
    if (dataPoints.length > 1) {
      const maxVal = Math.max(...dataPoints.map(p => Math.max(p.messages || 0, p.voice || 0)), 10);
      const xStep = width / (dataPoints.length - 1);
      
      // Messages line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataPoints.forEach((point, i) => {
        const x = i * xStep;
        const y = height - (((point.messages || 0) / maxVal) * (height - 20)) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Voice commands line
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      dataPoints.forEach((point, i) => {
        const x = i * xStep;
        const y = height - (((point.voice || 0) / maxVal) * (height - 20)) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  function renderModuleUsageChart() {
    const canvas = document.getElementById('chart-modules');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Calculate usage data
    const usageData = MODULES.map(mod => {
      const stats = dashboardData.moduleStats[mod.id] || {};
      return {
        ...mod,
        count: stats.accessCount || 0
      };
    }).filter(m => m.count > 0);

    // If no data, show placeholder
    if (usageData.length === 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No usage data yet', centerX, centerY);
      return;
    }

    const total = usageData.reduce((sum, m) => sum + m.count, 0);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw pie slices
    let startAngle = -Math.PI / 2;
    usageData.forEach(mod => {
      const sliceAngle = (mod.count / total) * 2 * Math.PI;
      
      ctx.fillStyle = mod.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      startAngle += sliceAngle;
    });

    // Draw center circle (donut style)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw total in center
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.fillText('interactions', centerX, centerY + 12);

    // Render legend
    const listEl = document.getElementById('module-usage-list');
    if (listEl) {
      listEl.innerHTML = usageData.slice(0, 6).map(mod => `
        <span class="module-usage-item">
          <span class="module-usage-color" style="background: ${mod.color}"></span>
          ${mod.emoji} ${Math.round((mod.count / total) * 100)}%
        </span>
      `).join('');
    }
  }

  function renderActivityByModuleChart() {
    const canvas = document.getElementById('chart-safeguard');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Get modules with activity
    const activeModules = MODULES.filter(mod => {
      const stats = dashboardData.moduleStats[mod.id];
      return stats && stats.accessCount > 0;
    });

    // Clear canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.fillRect(0, 0, width, height);

    if (activeModules.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No activity data yet', width / 2, height / 2);
      return;
    }

    const maxCount = Math.max(...activeModules.map(m => dashboardData.moduleStats[m.id].accessCount || 0));
    const barWidth = Math.min(40, (width - 40) / activeModules.length - 10);
    const startX = (width - (activeModules.length * (barWidth + 10))) / 2;

    activeModules.forEach((mod, i) => {
      const stats = dashboardData.moduleStats[mod.id];
      const count = stats.accessCount || 0;
      const barHeight = (count / maxCount) * (height - 40);
      const x = startX + i * (barWidth + 10);
      const y = height - barHeight - 20;

      // Draw bar
      ctx.fillStyle = mod.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(mod.emoji, x + barWidth / 2, height - 5);

      // Draw count
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
    });
  }

  function generateSampleActivityData() {
    // Generate sample data for visualization
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        messages: Math.floor(Math.random() * 5),
        voice: Math.floor(Math.random() * 3),
        timestamp: Date.now() - (30 - i) * 60000
      });
    }
    return data;
  }

  // ============================================
  // FEED STATUS
  // ============================================

  function updateFeedStatuses() {
    // Brain API
    updateFeedIndicator('brain', checkBrainStatus());
    
    // TTS
    const ttsOk = window.GRACEX_TTS && GRACEX_TTS.isSupported && GRACEX_TTS.isSupported();
    updateFeedIndicator('tts', ttsOk ? 'green' : 'red', ttsOk ? 'Active' : 'Unavailable');
    
    // Speech Recognition
    const speechOk = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    updateFeedIndicator('speech', speechOk ? 'green' : 'red', speechOk ? 'Ready' : 'Unavailable');
    
    // Storage
    const storageOk = typeof localStorage !== 'undefined';
    updateFeedIndicator('storage', storageOk ? 'green' : 'red', storageOk ? 'Available' : 'Unavailable');

    // Last sync time
    const syncEl = document.getElementById('feed-last-sync');
    if (syncEl) {
      syncEl.textContent = formatTime(new Date());
    }
  }

  function checkBrainStatus() {
    // Quick, synchronous signal only:
    // - Red if offline
    // - Yellow if online but no API configured
    // - Green if online and API configured
    const online = typeof navigator !== 'undefined' ? navigator.onLine : false;
    if (!online) return 'red';
    if (!window.GRACEX_BRAIN_API) return 'yellow';
    return 'green';
  }

  function updateFeedIndicator(feedId, color, statusText) {
    const indicator = document.getElementById('feed-' + feedId);
    const status = document.getElementById('feed-' + feedId + '-status');
    
    if (indicator) {
      indicator.className = 'feed-indicator feed-' + color;
    }
    if (status && statusText) {
      status.textContent = statusText;
    }
  }

  // ============================================
  // LOGS
  // ============================================

  function addLog(type, message) {
    const log = {
      type: type, // info, warn, error, success
      message: message,
      timestamp: Date.now()
    };
    
    dashboardData.systemLogs.unshift(log);
    if (dashboardData.systemLogs.length > MAX_LOGS) {
      dashboardData.systemLogs.pop();
    }
    
    renderLogs();
    saveData();
  }

  function renderLogs() {
    const panel = document.getElementById('logs-panel');
    if (!panel) return;

    if (dashboardData.systemLogs.length === 0) {
      panel.innerHTML = `
        <div class="log-entry log-info">
          <span class="log-time">${formatTime(new Date())}</span>
          <span class="log-type">INFO</span>
          <span class="log-msg">Dashboard initialized. System ready.</span>
        </div>
      `;
      return;
    }

    panel.innerHTML = dashboardData.systemLogs.slice(0, 10).map(log => `
      <div class="log-entry log-${log.type}">
        <span class="log-time">${formatTime(new Date(log.timestamp))}</span>
        <span class="log-type">${log.type.toUpperCase()}</span>
        <span class="log-msg">${escapeHtml(log.message)}</span>
      </div>
    `).join('');
  }

  function clearLogs() {
    dashboardData.systemLogs = [];
    renderLogs();
    saveData();
    addLog('info', 'Logs cleared');
  }

  function exportLogs() {
    const text = dashboardData.systemLogs.map(log => 
      `[${formatTime(new Date(log.timestamp))}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gracex-logs-${formatDate(new Date())}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('Logs exported!', 'success', 2000);
    }
  }

  function runDiagnostics() {
    addLog('info', 'Running system diagnostics...');
    
    setTimeout(() => {
      // Check brain
      const brainOk = typeof window.runModuleBrain === 'function';
      addLog(brainOk ? 'success' : 'warn', `Brain system: ${brainOk ? 'Level 5 API ready' : 'Level 1 fallback mode'}`);
      
      // Check TTS
      const ttsOk = window.GRACEX_TTS && GRACEX_TTS.isEnabled && GRACEX_TTS.isEnabled();
      addLog(ttsOk ? 'success' : 'warn', `TTS Engine: ${ttsOk ? 'Enabled' : 'Disabled'}`);
      
      // Check speech recognition
      const speechOk = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      addLog(speechOk ? 'success' : 'error', `Speech Recognition: ${speechOk ? 'Available' : 'Not supported'}`);
      
      // Check storage
      try {
        localStorage.setItem('_test', '1');
        localStorage.removeItem('_test');
        addLog('success', 'LocalStorage: Available');
      } catch (e) {
        addLog('error', 'LocalStorage: Unavailable');
      }
      
      // Check audio manager
      const audioOk = !!window.GRACEX_AudioManager;
      addLog(audioOk ? 'success' : 'warn', `Audio Manager: ${audioOk ? 'Loaded' : 'Not loaded'}`);
      
      // Summary
      addLog('info', 'Diagnostics complete');
      
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Diagnostics complete! Check logs.', 'success', 3000);
      }
    }, 500);
  }

  // ============================================
  // EVENT TRACKING
  // ============================================

  function trackModuleSwitch(moduleId) {
    const prevModule = dashboardData.activeModule;
    
    // Update previous module status
    if (dashboardData.moduleStats[prevModule]) {
      dashboardData.moduleStats[prevModule].status = 'idle';
    }
    
    // Update new module
    dashboardData.activeModule = moduleId;
    if (!dashboardData.moduleStats[moduleId]) {
      dashboardData.moduleStats[moduleId] = {
        status: 'active',
        lastAccessed: Date.now(),
        accessCount: 1,
        timeSpent: 0
      };
    } else {
      dashboardData.moduleStats[moduleId].status = 'active';
      dashboardData.moduleStats[moduleId].lastAccessed = Date.now();
      dashboardData.moduleStats[moduleId].accessCount++;
    }
    
    // Log activity
    dashboardData.activityLog.push({
      messages: 1,
      voice: 0,
      timestamp: Date.now()
    });
    
    if (dashboardData.activityLog.length > MAX_ACTIVITY_POINTS) {
      dashboardData.activityLog.shift();
    }
    
    saveData();
    addLog('info', `Switched to ${moduleId} module`);
  }

  function trackVoiceCommand(text) {
    dashboardData.lastVoiceCommand = text;
    
    const lastActivity = dashboardData.activityLog[dashboardData.activityLog.length - 1];
    if (lastActivity && Date.now() - lastActivity.timestamp < 60000) {
      lastActivity.voice++;
    } else {
      dashboardData.activityLog.push({
        messages: 0,
        voice: 1,
        timestamp: Date.now()
      });
    }
    
    saveData();
  }

  function trackMessage() {
    const lastActivity = dashboardData.activityLog[dashboardData.activityLog.length - 1];
    if (lastActivity && Date.now() - lastActivity.timestamp < 60000) {
      lastActivity.messages++;
    } else {
      dashboardData.activityLog.push({
        messages: 1,
        voice: 0,
        timestamp: Date.now()
      });
    }
    
    saveData();
  }

  // ============================================
  // UI CONTROLS
  // ============================================

  function initControls() {
    // Refresh button
    const refreshBtn = document.getElementById('dashboard-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshDashboard();
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Dashboard refreshed', 'success', 1500);
        }
      });
    }

    // Auto-refresh toggle
    const autoRefreshCb = document.getElementById('dashboard-auto-refresh');
    if (autoRefreshCb) {
      autoRefreshCb.addEventListener('change', (e) => {
        if (e.target.checked) {
          startAutoRefresh();
        } else {
          stopAutoRefresh();
        }
      });
    }

    // Section toggles
    document.querySelectorAll('.section-header[data-toggle]').forEach(header => {
      header.addEventListener('click', () => {
        const contentId = header.dataset.toggle;
        const content = document.getElementById(contentId);
        if (content) {
          content.classList.toggle('collapsed');
          header.classList.toggle('collapsed');
        }
      });
    });

    // Log controls
    const clearLogsBtn = document.getElementById('logs-clear');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', clearLogs);
    }

    const exportLogsBtn = document.getElementById('logs-export');
    if (exportLogsBtn) {
      exportLogsBtn.addEventListener('click', exportLogs);
    }

    const diagnosticsBtn = document.getElementById('logs-diagnostics');
    if (diagnosticsBtn) {
      diagnosticsBtn.addEventListener('click', runDiagnostics);
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(refreshDashboard, AUTO_REFRESH_INTERVAL);
    console.log('[GRACEX Dashboard] Auto-refresh enabled');
  }

  function stopAutoRefresh() {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
      console.log('[GRACEX Dashboard] Auto-refresh disabled');
    }
  }

  function refreshDashboard() {
    updateSystemOverview();
    renderModuleGrid();
    initCharts();
    updateFeedStatuses();
    renderLogs();
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  function formatTime(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function formatDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    console.log('[GRACEX Dashboard] Initializing Core Status Dashboard...');
    
    loadData();
    initControls();
    refreshDashboard();
    
    // Start auto-refresh if checkbox is checked
    const autoRefreshCb = document.getElementById('dashboard-auto-refresh');
    if (autoRefreshCb && autoRefreshCb.checked) {
      startAutoRefresh();
    }

    // Listen for module changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      const moduleMatch = hash.match(/#\/(\w+)/);
      if (moduleMatch) {
        trackModuleSwitch(moduleMatch[1]);
      }
    });

    // Initial log
    addLog('success', 'GRACE-X Core Dashboard initialized');
    
    console.log('[GRACEX Dashboard] Ready');
  }

  // Auto-init when DOM ready or on module load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure dashboard HTML is loaded
    setTimeout(init, 200);
  }

  // Re-init when Core module is loaded via SPA
  document.addEventListener('gracex:module:loaded', (event) => {
    if (event.detail && event.detail.module === 'core') {
      setTimeout(init, 100);
    }
  });

  // Expose API
  window.GRACEX_Dashboard = {
    refresh: refreshDashboard,
    trackModuleSwitch,
    trackVoiceCommand,
    trackMessage,
    addLog,
    runDiagnostics,
    getData: () => ({ ...dashboardData }),
    setMode: (mode) => {
      dashboardData.currentMode = mode;
      saveData();
      updateSystemOverview();
    }
  };

})();

