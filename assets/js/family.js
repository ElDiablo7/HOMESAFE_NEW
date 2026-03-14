// GRACE-X Family™ – module logic
// Includes Guardian Alert Dashboard
// © Zac Crockett 2025

(function () {
  // Only run when Family module is actually on screen
  if (!document.getElementById("family-plan-card")) {
    return;
  }

  // ============================================
  // GUARDIAN ALERT DASHBOARD
  // ============================================
  
  function initGuardianAlertDashboard() {
    // Create alert banner container if it doesn't exist
    let alertContainer = document.getElementById('family-guardian-alerts');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'family-guardian-alerts';
      alertContainer.className = 'guardian-alert-container';
      
      // Insert at the top of the family module
      const familySection = document.querySelector('.family-container');
      const moduleHeader = document.querySelector('.module-header');
      if (familySection && moduleHeader) {
        moduleHeader.insertAdjacentElement('afterend', alertContainer);
      }
    }
    
    // Initial render
    renderAlerts();
    
    // Listen for new alerts
    window.addEventListener('gracex:guardian:alert', (e) => {
      console.log('[GRACEX Family] Received Guardian alert:', e.detail);
      renderAlerts();
      showAlertBanner(e.detail);
    });
    
    // Listen for alert updates
    window.addEventListener('gracex:guardian:alert:read', renderAlerts);
    window.addEventListener('gracex:guardian:alert:dismissed', renderAlerts);
    window.addEventListener('gracex:guardian:alerts:cleared', renderAlerts);
    window.addEventListener('gracex:guardian:alerts:allread', renderAlerts);
  }
  
  function renderAlerts() {
    const alertContainer = document.getElementById('family-guardian-alerts');
    if (!alertContainer || !window.GRACEX_AlertSystem) return;
    
    const alerts = window.GRACEX_AlertSystem.getAlerts({ notDismissed: true, limit: 10 });
    const unreadCount = window.GRACEX_AlertSystem.getUnreadCount();
    
    if (alerts.length === 0) {
      alertContainer.innerHTML = `
        <div class="guardian-alert-status guardian-alert-safe">
          <span class="alert-icon">✅</span>
          <span class="alert-text">No active Guardian alerts</span>
        </div>
      `;
      return;
    }
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
    const hasCritical = criticalAlerts.length > 0;
    
    alertContainer.innerHTML = `
      <div class="guardian-alert-banner ${hasCritical ? 'guardian-alert-critical' : 'guardian-alert-warning'}">
        <div class="alert-banner-header">
          <span class="alert-banner-icon">${hasCritical ? '🚨' : '⚠️'}</span>
          <span class="alert-banner-title">
            Guardian Alert${alerts.length > 1 ? 's' : ''} (${unreadCount} unread)
          </span>
          <div class="alert-banner-actions">
            <button class="alert-action-btn" onclick="window.GRACEX_AlertSystem.playSound()" title="Test Alert Sound">
              🔔
            </button>
            <button class="alert-action-btn" onclick="window.GRACEX_AlertSystem.markAllAsRead()" title="Mark All Read">
              ✓
            </button>
            <button class="alert-action-btn alert-action-danger" onclick="window.GRACEX_AlertSystem.lockSystem()" title="Lock System">
              🔒
            </button>
          </div>
        </div>
        
        <div class="alert-list">
          ${alerts.map(alert => `
            <div class="alert-item ${alert.read ? 'alert-read' : 'alert-unread'} alert-${alert.severity}" data-alert-id="${alert.id}">
              <div class="alert-item-header">
                <span class="alert-severity-badge alert-severity-${alert.severity}">
                  ${getSeverityIcon(alert.severity)} ${alert.severity.toUpperCase()}
                </span>
                <span class="alert-time">${formatAlertTime(alert.timestamp)}</span>
              </div>
              <div class="alert-item-title">${alert.title}</div>
              <div class="alert-item-details">${alert.details}</div>
              <div class="alert-item-source">Source: ${alert.sourceModule || 'Guardian'}</div>
              <div class="alert-item-actions">
                <button class="alert-btn alert-btn-view" onclick="viewAlertDetails('${alert.id}')">
                  View Details
                </button>
                <button class="alert-btn alert-btn-dismiss" onclick="window.GRACEX_AlertSystem.dismissAlert('${alert.id}')">
                  Dismiss
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="alert-history-link">
          <button class="alert-btn-link" onclick="showAlertHistory()">
            📋 View Full Alert History
          </button>
        </div>
      </div>
    `;
  }
  
  function showAlertBanner(alert) {
    // Create floating alert banner for immediate attention
    const banner = document.createElement('div');
    banner.className = 'guardian-floating-alert';
    banner.innerHTML = `
      <div class="floating-alert-content">
        <span class="floating-alert-icon">${alert.severity === 'critical' ? '🚨' : '⚠️'}</span>
        <div class="floating-alert-text">
          <strong>${alert.title}</strong>
          <span>${alert.details.substring(0, 100)}...</span>
        </div>
        <button class="floating-alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Auto-remove after 10 seconds for non-critical
    if (alert.severity !== 'critical') {
      setTimeout(() => {
        if (banner.parentElement) {
          banner.classList.add('alert-fade-out');
          setTimeout(() => banner.remove(), 300);
        }
      }, 10000);
    }
  }
  
  function getSeverityIcon(severity) {
    switch(severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '🛡️';
    }
  }
  
  function formatAlertTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  
  // Global functions for onclick handlers
  window.viewAlertDetails = function(alertId) {
    if (!window.GRACEX_AlertSystem) return;
    
    const alerts = window.GRACEX_AlertSystem.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) return;
    
    // Mark as read
    window.GRACEX_AlertSystem.markAsRead(alertId);
    
    // Show modal with full details
    const modal = document.createElement('div');
    modal.className = 'guardian-alert-modal';
    modal.innerHTML = `
      <div class="alert-modal-content">
        <div class="alert-modal-header">
          <h2>${getSeverityIcon(alert.severity)} ${alert.title}</h2>
          <button class="alert-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="alert-modal-body">
          <p><strong>Type:</strong> ${alert.type}</p>
          <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
          <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString('en-GB')}</p>
          <p><strong>Source Module:</strong> ${alert.sourceModule || 'Guardian'}</p>
          <p><strong>Details:</strong></p>
          <div class="alert-details-box">${alert.details}</div>
        </div>
        <div class="alert-modal-actions">
          <button class="alert-btn alert-btn-view" onclick="window.GRACEX_Router && GRACEX_Router.loadModule('guardian')">
            Go to Guardian
          </button>
          <button class="alert-btn alert-btn-dismiss" onclick="window.GRACEX_AlertSystem.dismissAlert('${alertId}'); this.parentElement.parentElement.parentElement.remove();">
            Dismiss Alert
          </button>
          <button class="alert-btn alert-btn-danger" onclick="window.GRACEX_AlertSystem.lockSystem()">
            🔒 Lock System
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };
  
  window.showAlertHistory = function() {
    if (!window.GRACEX_AlertSystem) return;
    
    const allAlerts = window.GRACEX_AlertSystem.getAlerts();
    
    const modal = document.createElement('div');
    modal.className = 'guardian-alert-modal';
    modal.innerHTML = `
      <div class="alert-modal-content alert-modal-wide">
        <div class="alert-modal-header">
          <h2>📋 Guardian Alert History</h2>
          <button class="alert-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="alert-modal-body">
          ${allAlerts.length === 0 ? '<p>No alerts in history.</p>' : `
            <table class="alert-history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${allAlerts.map(a => `
                  <tr class="${a.dismissed ? 'dismissed' : ''} ${a.read ? '' : 'unread'}">
                    <td>${new Date(a.timestamp).toLocaleString('en-GB')}</td>
                    <td>${a.type}</td>
                    <td><span class="alert-severity-badge alert-severity-${a.severity}">${a.severity}</span></td>
                    <td>${a.title}</td>
                    <td>${a.dismissed ? 'Dismissed' : a.read ? 'Read' : 'Unread'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
        <div class="alert-modal-actions">
          <button class="alert-btn" onclick="window.GRACEX_AlertSystem.clearAllAlerts(); this.parentElement.parentElement.parentElement.remove();">
            Clear All History
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // ============================================
  // ORIGINAL FAMILY FUNCTIONALITY
  // ============================================

  // --- Today's family plan ---
  const planTimeInput     = document.getElementById("family-plan-time");
  const planActivityInput = document.getElementById("family-plan-activity");
  const planAddBtn        = document.getElementById("family-plan-add");
  const planList          = document.getElementById("family-plan-list");

  if (planAddBtn && planList && planTimeInput && planActivityInput) {
    planAddBtn.addEventListener("click", function () {
      const timeVal     = (planTimeInput.value || "").trim();
      const activityVal = (planActivityInput.value || "").trim();

      if (!timeVal && !activityVal) {
        return;
      }

      const li = document.createElement("li");
      li.className = "family-list-item";

      const label = document.createElement("label");
      label.className = "family-item-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "family-item-check";

      const text = document.createElement("span");
      if (timeVal && activityVal) {
        text.textContent = timeVal + " – " + activityVal;
      } else if (activityVal) {
        text.textContent = activityVal;
      } else {
        text.textContent = timeVal;
      }

      label.appendChild(checkbox);
      label.appendChild(text);
      li.appendChild(label);
      planList.appendChild(li);

      planTimeInput.value = "";
      planActivityInput.value = "";
      
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast("Activity added to plan", "success");
      }
    });
  }
  
  // --- Family tasks / chores ---
  const taskInput = document.getElementById("family-task-input");
  const taskAddBtn = document.getElementById("family-task-add");
  const taskList = document.getElementById("family-task-list");

  if (taskAddBtn && taskList && taskInput) {
    taskAddBtn.addEventListener("click", function () {
      const taskText = (taskInput.value || "").trim();
      if (!taskText) return;

      const li = document.createElement("li");
      li.className = "family-list-item";

      const label = document.createElement("label");
      label.className = "family-item-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "family-item-check";

      const text = document.createElement("span");
      text.textContent = taskText;

      label.appendChild(checkbox);
      label.appendChild(text);
      li.appendChild(label);
      taskList.appendChild(li);

      taskInput.value = "";
      
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast("Task added", "success");
      }
    });
  }

  // Keyboard shortcuts for Family
  if (window.GRACEX_Utils) {
    if (planTimeInput) {
      GRACEX_Utils.addKeyboardShortcut("Enter", function() {
        if (planAddBtn) planAddBtn.click();
      }, planTimeInput);
    }
    if (planActivityInput) {
      GRACEX_Utils.addKeyboardShortcut("Enter", function() {
        if (planAddBtn) planAddBtn.click();
      }, planActivityInput);
    }
    if (taskInput) {
      GRACEX_Utils.addKeyboardShortcut("Enter", function() {
        if (taskAddBtn) taskAddBtn.click();
      }, taskInput);
    }
  }

  // --- Shout-outs & thank you notes ---
  const rewardNotes = document.getElementById("family-reward-notes");
  const rewardClearBtn = document.getElementById("family-reward-clear");

  if (rewardNotes && rewardClearBtn) {
    rewardClearBtn.addEventListener("click", function () {
      rewardNotes.value = "";
    });
  }
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  // Initialize Guardian Alert Dashboard
  initGuardianAlertDashboard();
  
  console.log('[GRACEX Family] Module initialized with Guardian Alert Dashboard');
})();

// GRACEX Family V5 Brain Wiring
(function () {
  function initFamilyBrain() {
    // Use the centralized brainV5Helper if available
    if (window.setupModuleBrain) {
      window.setupModuleBrain("family", {
        panelId: "family-brain-panel",
        inputId: "family-brain-input",
        sendId: "family-brain-send",
        outputId: "family-brain-output",
        clearId: "family-brain-clear",
        initialMessage: "I'm the Family brain. Ask about homework, chores, screen time, or family routines.",
      });
    }
  }

  // Initialize when module loads
  document.addEventListener("gracex:module:loaded", function(ev) {
    if (ev.detail && (ev.detail.module === "family" || (ev.detail.url && ev.detail.url.includes("family.html")))) {
      setTimeout(initFamilyBrain, 50);
    }
  });

  // Also try to initialize immediately if elements exist
  if (document.getElementById("family-brain-panel")) {
    setTimeout(initFamilyBrain, 100);
  }
})();
