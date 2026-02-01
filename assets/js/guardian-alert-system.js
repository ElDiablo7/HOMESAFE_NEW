// GRACE-X Guardian Alert System™
// Cross-module alert communication system
// Guardian → Family dashboard notifications
// © Zac Crockett 2025

(function() {
  'use strict';

  // ============================================
  // ALERT SYSTEM CONFIGURATION
  // ============================================
  
  const ALERT_STORAGE_KEY = 'gracex_guardian_alerts';
  const MAX_ALERTS = 50;
  
  // Alert severity levels
  const SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  // Alert types
  const ALERT_TYPES = {
    CRISIS: 'crisis',
    GROOMING: 'grooming',
    HARASSMENT: 'harassment',
    INAPPROPRIATE_CONTENT: 'inappropriate_content',
    STRANGER_DANGER: 'stranger_danger',
    SCAM: 'scam',
    SAFETY_CONCERN: 'safety_concern',
    GENERAL: 'general'
  };

  // Alert system state
  let alertState = {
    alerts: [],
    unreadCount: 0,
    lastAlertTime: null,
    soundEnabled: true,
    familyDashboardActive: false
  };

  // Alert sound - base64 encoded alert tone
  const ALERT_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqFbGNjlHWRk4eRhZqQmpmNmZiUk5STkZCRkZCQkJCQkJCRkZGRkZKSkpOTk5SUlJWVlZaWl5eYmJmZmpqbm5ycnZ2enpGRkZKSk5OUlJWVlpaXl5iYmZmamxAAFBgcICQoLC';

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  function loadAlerts() {
    try {
      const saved = localStorage.getItem(ALERT_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        alertState.alerts = data.alerts || [];
        alertState.unreadCount = data.unreadCount || 0;
        alertState.lastAlertTime = data.lastAlertTime || null;
        alertState.soundEnabled = data.soundEnabled !== false;
      }
    } catch (e) {
      console.warn('[GRACEX Alert System] Failed to load alerts:', e);
    }
  }

  function saveAlerts() {
    try {
      localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify({
        alerts: alertState.alerts,
        unreadCount: alertState.unreadCount,
        lastAlertTime: alertState.lastAlertTime,
        soundEnabled: alertState.soundEnabled
      }));
    } catch (e) {
      console.warn('[GRACEX Alert System] Failed to save alerts:', e);
    }
  }

  // ============================================
  // ALERT CREATION & EMISSION
  // ============================================

  /**
   * Create and emit a new Guardian alert
   * @param {string} type - Alert type from ALERT_TYPES
   * @param {string} title - Alert title
   * @param {string} details - Alert details/description
   * @param {string} severity - Severity level from SEVERITY
   * @param {object} metadata - Additional alert data
   */
  function emitAlert(type, title, details, severity = SEVERITY.MEDIUM, metadata = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || ALERT_TYPES.GENERAL,
      title: title || 'Guardian Alert',
      details: details || '',
      severity: severity,
      sourceModule: metadata.sourceModule || 'guardian',
      targetModule: metadata.targetModule || 'family',
      timestamp: Date.now(),
      read: false,
      dismissed: false,
      metadata: metadata
    };

    // Add to alerts array
    alertState.alerts.unshift(alert);
    alertState.unreadCount++;
    alertState.lastAlertTime = Date.now();

    // Trim old alerts
    if (alertState.alerts.length > MAX_ALERTS) {
      alertState.alerts = alertState.alerts.slice(0, MAX_ALERTS);
    }

    // Save to storage
    saveAlerts();

    // Dispatch custom event for real-time updates
    const event = new CustomEvent('gracex:guardian:alert', {
      detail: alert,
      bubbles: true
    });
    window.dispatchEvent(event);

    // Play alert sound
    if (alertState.soundEnabled && (severity === SEVERITY.HIGH || severity === SEVERITY.CRITICAL)) {
      playAlertSound();
    }

    // Log to console
    console.log('[GRACEX Guardian Alert]', alert);

    // Show toast notification if available
    if (window.GRACEX_Utils && GRACEX_Utils.showToast) {
      const icon = severity === SEVERITY.CRITICAL ? '🚨' : severity === SEVERITY.HIGH ? '⚠️' : '🛡️';
      GRACEX_Utils.showToast(`${icon} ${title}`, severity === SEVERITY.CRITICAL ? 'error' : 'warn', 5000);
    }

    return alert;
  }

  // ============================================
  // ALERT SOUND
  // ============================================

  function playAlertSound() {
    try {
      // Try to use AudioContext for better compatibility
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Alert tone: high pitched beeps
        oscillator.frequency.value = 880;
        oscillator.type = 'square';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        
        // Beep pattern: on-off-on-off-on
        setTimeout(() => { gainNode.gain.value = 0; }, 150);
        setTimeout(() => { gainNode.gain.value = 0.3; }, 250);
        setTimeout(() => { gainNode.gain.value = 0; }, 400);
        setTimeout(() => { gainNode.gain.value = 0.3; }, 500);
        setTimeout(() => { gainNode.gain.value = 0; oscillator.stop(); }, 650);
      }
    } catch (e) {
      console.warn('[GRACEX Alert System] Could not play alert sound:', e);
    }
  }

  // ============================================
  // ALERT MANAGEMENT
  // ============================================

  function markAsRead(alertId) {
    const alert = alertState.alerts.find(a => a.id === alertId);
    if (alert && !alert.read) {
      alert.read = true;
      alertState.unreadCount = Math.max(0, alertState.unreadCount - 1);
      saveAlerts();
      
      window.dispatchEvent(new CustomEvent('gracex:guardian:alert:read', {
        detail: { alertId },
        bubbles: true
      }));
    }
  }

  function markAllAsRead() {
    alertState.alerts.forEach(alert => {
      alert.read = true;
    });
    alertState.unreadCount = 0;
    saveAlerts();
    
    window.dispatchEvent(new CustomEvent('gracex:guardian:alerts:allread', {
      bubbles: true
    }));
  }

  function dismissAlert(alertId) {
    const alert = alertState.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      if (!alert.read) {
        alert.read = true;
        alertState.unreadCount = Math.max(0, alertState.unreadCount - 1);
      }
      saveAlerts();
      
      window.dispatchEvent(new CustomEvent('gracex:guardian:alert:dismissed', {
        detail: { alertId },
        bubbles: true
      }));
    }
  }

  function clearAllAlerts() {
    alertState.alerts = [];
    alertState.unreadCount = 0;
    saveAlerts();
    
    window.dispatchEvent(new CustomEvent('gracex:guardian:alerts:cleared', {
      bubbles: true
    }));
  }

  function getAlerts(options = {}) {
    let filtered = [...alertState.alerts];
    
    if (options.unreadOnly) {
      filtered = filtered.filter(a => !a.read);
    }
    if (options.notDismissed) {
      filtered = filtered.filter(a => !a.dismissed);
    }
    if (options.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }
    if (options.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  }

  function getUnreadCount() {
    return alertState.unreadCount;
  }

  function toggleSound(enabled) {
    alertState.soundEnabled = enabled;
    saveAlerts();
  }

  // ============================================
  // QUICK ACTIONS
  // ============================================

  function lockSystem() {
    // Emit lock event
    window.dispatchEvent(new CustomEvent('gracex:system:lock', {
      detail: { source: 'guardian-alert' },
      bubbles: true
    }));
    
    // Show lock UI overlay
    const lockOverlay = document.createElement('div');
    lockOverlay.id = 'gracex-system-lock';
    lockOverlay.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
        <h1 style="font-size: 2rem; margin-bottom: 10px;">GRACE-X System Locked</h1>
        <p style="color: #94a3b8; margin-bottom: 30px;">Guardian safety lock activated</p>
        <button onclick="window.GRACEX_AlertSystem.unlockSystem()" style="padding: 12px 32px; background: #dc2626; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">
          Unlock System (Parent Only)
        </button>
      </div>
    `;
    document.body.appendChild(lockOverlay);
    
    console.log('[GRACEX Guardian] System locked');
  }

  function unlockSystem() {
    const lockOverlay = document.getElementById('gracex-system-lock');
    if (lockOverlay) {
      lockOverlay.remove();
    }
    
    window.dispatchEvent(new CustomEvent('gracex:system:unlock', {
      detail: { source: 'guardian-alert' },
      bubbles: true
    }));
    
    console.log('[GRACEX Guardian] System unlocked');
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    loadAlerts();
    console.log('[GRACEX Alert System] Initialized with', alertState.alerts.length, 'alerts,', alertState.unreadCount, 'unread');
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // PUBLIC API
  // ============================================

  window.GRACEX_AlertSystem = {
    // Alert emission
    emit: emitAlert,
    emitAlert: emitAlert,
    
    // Constants
    SEVERITY,
    ALERT_TYPES,
    
    // Alert management
    markAsRead,
    markAllAsRead,
    dismissAlert,
    clearAllAlerts,
    getAlerts,
    getUnreadCount,
    
    // Sound control
    toggleSound,
    playSound: playAlertSound,
    
    // System actions
    lockSystem,
    unlockSystem,
    
    // State access
    getState: () => ({ ...alertState })
  };

  console.log('[GRACEX Alert System] Guardian Alert System loaded');
})();
