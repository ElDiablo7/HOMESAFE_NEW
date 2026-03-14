// =====================================================
// GRACE-X SiteOps™ v2.0
// Construction Project Management Brain
// Multi-trade coordination, programme control, compliance
// =====================================================

(function () {
  'use strict';

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const STORAGE_KEY = 'gracex_siteops_project';
  const SITEOPS_API_BASE = window.GRACEX_API_BASE || 'http://localhost:3000';

  const state = {
    project: {
      name: '',
      address: '',
      status: 'planning',
      startDate: '',
      constraints: {}
    },
    phases: [],
    trades: [],
    dependencies: [],
    gates: [],
    issues: [],
    dailyLogs: [],
    changes: []
  };

  // Phase ID counter
  let phaseIdCounter = 1;
  let issueIdCounter = 1;
  let changeIdCounter = 1;

  // =====================================================
  // STANDARD CONSTRUCTION DEPENDENCIES
  // =====================================================

  const STANDARD_DEPENDENCIES = [
    { from: 'demolition', to: 'structural', reason: 'Structural cannot start until demolition complete' },
    { from: 'structural', to: 'first-fix', reason: 'First fix requires structural sign-off' },
    { from: 'first-fix-mep', to: 'plaster', reason: 'No plaster before M&E first fix signed off' },
    { from: 'plaster', to: 'second-fix', reason: 'Second fix after plaster cured' },
    { from: 'wet-trades', to: 'flooring', reason: 'No flooring before wet trades cured' },
    { from: 'final-mep', to: 'kitchen', reason: 'Kitchen install after final M&E positions confirmed' },
    { from: 'second-fix', to: 'decoration', reason: 'Decoration after second fix complete' },
    { from: 'decoration', to: 'snagging', reason: 'Snagging after decoration' }
  ];

  // Gate types
  const GATE_TYPES = [
    { id: 'bc-foundation', name: 'Building Control - Foundation', phase: 'foundation' },
    { id: 'bc-dpc', name: 'Building Control - DPC', phase: 'structural' },
    { id: 'bc-structural', name: 'Building Control - Structural', phase: 'structural' },
    { id: 'part-p', name: 'Part P - Electrical', phase: 'first-fix-mep' },
    { id: 'gas-safe', name: 'Gas Safe Certification', phase: 'first-fix-mep' },
    { id: 'bc-insulation', name: 'Building Control - Insulation', phase: 'insulation' },
    { id: 'bc-completion', name: 'Building Control - Completion', phase: 'completion' },
    { id: 'fire-safety', name: 'Fire Safety Certificate', phase: 'completion' },
    { id: 'asbestos', name: 'Asbestos Survey', phase: 'demolition' }
  ];

  // Trade types
  const TRADE_TYPES = [
    'Demolition', 'Groundworks', 'Structural', 'Brickwork', 'Roofing',
    'Carpentry', 'Plumbing', 'Electrical', 'Plastering', 'Tiling',
    'Flooring', 'Painting', 'Kitchen', 'Bathroom', 'Landscaping'
  ];

  // =====================================================
  // PERSISTENCE (localStorage + optional API sync)
  // =====================================================

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('[GRACEX SITEOPS] Project saved (local)');
    } catch (e) {
      console.warn('[GRACEX SITEOPS] Failed to save local:', e);
    }
    if (typeof fetch === 'function' && SITEOPS_API_BASE) {
      const payload = {
        id: state.id,
        project: state.project,
        phases: state.phases,
        trades: state.trades,
        dependencies: state.dependencies,
        gates: state.gates,
        issues: state.issues,
        dailyLogs: state.dailyLogs,
        changes: state.changes
      };
      const method = state.id ? 'PUT' : 'POST';
      const url = state.id
        ? SITEOPS_API_BASE + '/api/siteops/projects/' + state.id
        : SITEOPS_API_BASE + '/api/siteops/projects';
      var headers = (window.GRACEX_Auth && window.GRACEX_Auth.authHeaders) ? window.GRACEX_Auth.authHeaders() : { 'Content-Type': 'application/json' };
      fetch(url, {
        method,
        headers: headers,
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.id) state.id = data.id;
        })
        .catch(() => { });
    }
  }

  function loadState() {
    loadStateFromLocal();
    if (typeof fetch === 'function' && SITEOPS_API_BASE) {
      var headers = (window.GRACEX_Auth && window.GRACEX_Auth.authHeaders) ? window.GRACEX_Auth.authHeaders() : {};
      fetch(SITEOPS_API_BASE + '/api/siteops/projects', { headers: headers })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.projects && data.projects.length > 0) {
            const firstId = data.projects[0].id;
            return fetch(SITEOPS_API_BASE + '/api/siteops/projects/' + firstId, { headers: headers }).then(r => r.json());
          }
          return null;
        })
        .then(data => {
          if (data && data.success && data.state) {
            const s = data.state;
            state.id = s.id;
            state.project = s.project || state.project;
            state.phases = s.phases || [];
            state.trades = s.trades || [];
            state.dependencies = s.dependencies || [];
            state.gates = s.gates || [];
            state.issues = s.issues || [];
            state.dailyLogs = s.dailyLogs || [];
            state.changes = s.changes || [];
            if (state.phases.length > 0) phaseIdCounter = Math.max(...state.phases.map(p => p.id)) + 1;
            if (state.issues.length > 0) issueIdCounter = Math.max(...state.issues.map(i => i.id)) + 1;
            if (state.changes.length > 0) changeIdCounter = Math.max(...state.changes.map(c => c.id)) + 1;
            console.log('[GRACEX SITEOPS] Project loaded from API');
            renderProgramme();
            renderTrades();
            renderGates();
            renderIssues();
            renderChanges();
            updateDashboard();
          }
        })
        .catch(() => { });
    }
  }

  function loadStateFromLocal() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
        if (state.phases.length > 0) phaseIdCounter = Math.max(...state.phases.map(p => p.id)) + 1;
        if (state.issues.length > 0) issueIdCounter = Math.max(...state.issues.map(i => i.id)) + 1;
        if (state.changes.length > 0) changeIdCounter = Math.max(...state.changes.map(c => c.id)) + 1;
        console.log('[GRACEX SITEOPS] Project loaded from localStorage');
      }
    } catch (e) {
      console.warn('[GRACEX SITEOPS] Failed to load:', e);
    }
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  function updateDashboard() {
    // Update project info
    const nameEl = document.getElementById('siteops-project-name');
    const addressEl = document.getElementById('siteops-project-address');
    const statusEl = document.getElementById('siteops-project-status');
    const startEl = document.getElementById('siteops-project-start');

    if (nameEl) nameEl.value = state.project.name || '';
    if (addressEl) addressEl.value = state.project.address || '';
    if (statusEl) statusEl.value = state.project.status || 'planning';
    if (startEl) startEl.value = state.project.startDate || '';

    // Update status badge
    const badge = document.getElementById('siteops-status-badge');
    if (badge) {
      badge.textContent = state.project.status ? state.project.status.charAt(0).toUpperCase() + state.project.status.slice(1) : 'Planning';
      badge.className = 'siteops-status-badge siteops-status-' + (state.project.status || 'planning');
    }

    // Update health indicator
    const health = document.getElementById('siteops-health');
    const blockers = state.issues.filter(i => i.category === 'blocker' && i.status !== 'closed');
    if (health) {
      if (blockers.length > 0) {
        health.textContent = '🔴 ' + blockers.length + ' Blocker(s)';
      } else if (state.issues.filter(i => i.severity === 'high' && i.status !== 'closed').length > 0) {
        health.textContent = '🟡 Issues pending';
      } else {
        health.textContent = '🟢 Healthy';
      }
    }

    // Update dashboard cards
    updateTodayFocus();
    updateBlockingIssues();
    updateGatesDue();
    updateConstraintsSummary();
  }

  function updateTodayFocus() {
    const el = document.getElementById('siteops-today-focus');
    if (!el) return;

    const criticalPhases = state.phases.filter(p => p.critical && p.status === 'in-progress');
    if (criticalPhases.length > 0) {
      el.innerHTML = criticalPhases.map(p => `<strong>${p.name}</strong> (${p.trade})`).join('<br>');
    } else {
      const inProgress = state.phases.filter(p => p.status === 'in-progress');
      if (inProgress.length > 0) {
        el.innerHTML = inProgress.slice(0, 2).map(p => `${p.name}`).join('<br>');
      } else {
        el.textContent = 'No phases in progress';
      }
    }
  }

  function updateBlockingIssues() {
    const el = document.getElementById('siteops-blocking-issues');
    if (!el) return;

    const blockers = state.issues.filter(i => i.category === 'blocker' && i.status !== 'closed');
    if (blockers.length > 0) {
      el.innerHTML = blockers.slice(0, 3).map(b => `⚠️ ${b.description}`).join('<br>');
    } else {
      el.textContent = '✅ No blockers';
    }
  }

  function updateGatesDue() {
    const el = document.getElementById('siteops-gates-due');
    if (!el) return;

    const pendingGates = state.gates.filter(g => g.status === 'not-booked' || g.status === 'booked');
    if (pendingGates.length > 0) {
      el.innerHTML = pendingGates.slice(0, 3).map(g => `🔒 ${g.type}`).join('<br>');
    } else {
      el.textContent = 'No gates pending';
    }
  }

  function updateConstraintsSummary() {
    const el = document.getElementById('siteops-constraints-summary');
    if (!el) return;

    const constraints = [];
    if (document.getElementById('siteops-constraint-occupied')?.checked) constraints.push('Occupied');
    if (document.getElementById('siteops-constraint-kids')?.checked) constraints.push('Kids');
    if (document.getElementById('siteops-constraint-neighbours')?.checked) constraints.push('Neighbours');

    el.textContent = constraints.length > 0 ? constraints.join(', ') : 'No special constraints';
  }

  // =====================================================
  // PROGRAMME MANAGEMENT
  // =====================================================

  function addPhase(phaseData = null) {
    const phase = phaseData || {
      id: phaseIdCounter++,
      name: prompt('Phase name:') || 'New Phase',
      trade: prompt('Trade owner:') || 'TBC',
      startDay: 1,
      duration: 5,
      dependsOn: [],
      gateRequired: false,
      status: 'not-started',
      critical: false,
      notes: ''
    };

    if (!phase.name) return;

    state.phases.push(phase);
    saveState();
    renderProgramme();
    updateDashboard();

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast(`Phase "${phase.name}" added`, 'success');
    }
  }

  function renderProgramme() {
    const tbody = document.getElementById('siteops-programme-body');
    const empty = document.getElementById('siteops-programme-empty');
    const table = document.getElementById('siteops-programme-table');

    if (!tbody) return;

    if (state.phases.length === 0) {
      if (table) table.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = state.phases.map(phase => `
      <tr class="siteops-phase-row ${phase.critical ? 'critical-path' : ''}" data-id="${phase.id}">
        <td><strong>${phase.name}</strong></td>
        <td>${phase.trade}</td>
        <td>Day ${phase.startDay}</td>
        <td>${phase.duration} days</td>
        <td>${phase.dependsOn?.length > 0 ? phase.dependsOn.map(d => getPhaseNameById(d)).join(', ') : '—'}</td>
        <td>${phase.gateRequired ? '🔒 Yes' : '—'}</td>
        <td>
          <select class="phase-status-select" data-id="${phase.id}">
            <option value="not-started" ${phase.status === 'not-started' ? 'selected' : ''}>Not Started</option>
            <option value="in-progress" ${phase.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="waiting" ${phase.status === 'waiting' ? 'selected' : ''}>Waiting</option>
            <option value="blocked" ${phase.status === 'blocked' ? 'selected' : ''}>Blocked</option>
            <option value="done" ${phase.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </td>
        <td>
          <button class="builder-btn phase-edit-btn" data-id="${phase.id}" style="padding: 4px 8px; font-size: 0.8em;">✏️</button>
          <button class="builder-btn phase-delete-btn" data-id="${phase.id}" style="padding: 4px 8px; font-size: 0.8em;">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Wire event listeners
    tbody.querySelectorAll('.phase-status-select').forEach(select => {
      select.addEventListener('change', function () {
        const id = parseInt(this.dataset.id);
        const phase = state.phases.find(p => p.id === id);
        if (phase) {
          phase.status = this.value;
          saveState();
          updateDashboard();
        }
      });
    });

    tbody.querySelectorAll('.phase-delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        if (confirm('Delete this phase?')) {
          state.phases = state.phases.filter(p => p.id !== id);
          saveState();
          renderProgramme();
          updateDashboard();
        }
      });
    });
  }

  function getPhaseNameById(id) {
    const phase = state.phases.find(p => p.id === id);
    return phase ? phase.name : 'Unknown';
  }

  function recalculateProgramme() {
    // Simple forward pass calculation
    state.phases.forEach(phase => {
      if (phase.dependsOn && phase.dependsOn.length > 0) {
        let maxEnd = 0;
        phase.dependsOn.forEach(depId => {
          const dep = state.phases.find(p => p.id === depId);
          if (dep) {
            const depEnd = dep.startDay + dep.duration;
            if (depEnd > maxEnd) maxEnd = depEnd;
          }
        });
        phase.startDay = maxEnd;
      }
    });

    saveState();
    renderProgramme();

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('Programme recalculated', 'success');
    }
  }

  function validateSequence() {
    const warnings = [];

    // Check each dependency
    state.dependencies.forEach(dep => {
      const fromPhase = state.phases.find(p => p.name.toLowerCase().includes(dep.from) || p.trade?.toLowerCase().includes(dep.from));
      const toPhase = state.phases.find(p => p.name.toLowerCase().includes(dep.to) || p.trade?.toLowerCase().includes(dep.to));

      if (fromPhase && toPhase) {
        const fromEnd = fromPhase.startDay + fromPhase.duration;
        if (toPhase.startDay < fromEnd) {
          warnings.push(`⚠️ ${toPhase.name} starts before ${fromPhase.name} ends`);
        }
      }
    });

    // Check gates
    state.gates.filter(g => g.status !== 'passed' && g.blocks).forEach(gate => {
      const blockedPhase = state.phases.find(p => p.status === 'in-progress' && gate.blocks.includes(p.id));
      if (blockedPhase) {
        warnings.push(`🔒 Gate "${gate.type}" blocking ${blockedPhase.name}`);
      }
    });

    const warningEl = document.getElementById('siteops-sequence-warning');
    if (warningEl) {
      if (warnings.length > 0) {
        warningEl.innerHTML = warnings.join('<br>');
        warningEl.style.display = 'block';
      } else {
        warningEl.style.display = 'none';
      }
    }

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast(warnings.length > 0 ? `${warnings.length} sequence issue(s) found` : 'Sequence valid ✅', warnings.length > 0 ? 'warning' : 'success');
    }

    return warnings;
  }

  // =====================================================
  // TRADES MANAGEMENT
  // =====================================================

  function addTrade() {
    const trade = {
      id: Date.now(),
      type: prompt('Trade type:', TRADE_TYPES[0]) || 'General',
      scope: prompt('Scope summary:') || '',
      accessNeeds: '',
      certRequired: false,
      status: 'not-started'
    };

    state.trades.push(trade);
    saveState();
    renderTrades();
  }

  function renderTrades() {
    const container = document.getElementById('siteops-trades-list');
    const empty = document.getElementById('siteops-trades-empty');

    if (!container) return;

    if (state.trades.length === 0) {
      container.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    container.innerHTML = state.trades.map(trade => `
      <div class="siteops-trade-card" data-id="${trade.id}">
        <div class="trade-header">
          <strong>${trade.type}</strong>
          <span class="trade-status trade-status-${trade.status}">${trade.status.replace('-', ' ')}</span>
        </div>
        <div class="trade-scope">${trade.scope || 'No scope defined'}</div>
        <div class="trade-actions">
          <button class="builder-btn trade-delete-btn" data-id="${trade.id}" style="padding: 4px 8px; font-size: 0.8em;">🗑️</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.trade-delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        state.trades = state.trades.filter(t => t.id !== id);
        saveState();
        renderTrades();
      });
    });
  }

  // =====================================================
  // GATES & INSPECTIONS
  // =====================================================

  function addGate() {
    const type = prompt('Gate type (e.g. Building Control, Part P, Gas Safe):');
    if (!type) return;

    const gate = {
      id: Date.now(),
      type: type,
      relatedPhase: prompt('Related phase:') || '',
      required: 'before',
      status: 'not-booked',
      blocks: []
    };

    state.gates.push(gate);
    saveState();
    renderGates();
    updateDashboard();
  }

  function renderGates() {
    const tbody = document.getElementById('siteops-gates-body');
    const empty = document.getElementById('siteops-gates-empty');
    const table = document.getElementById('siteops-gates-table');

    if (!tbody) return;

    if (state.gates.length === 0) {
      if (table) table.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = state.gates.map(gate => `
      <tr data-id="${gate.id}">
        <td><strong>${gate.type}</strong></td>
        <td>${gate.relatedPhase || '—'}</td>
        <td>${gate.required}</td>
        <td>
          <select class="gate-status-select" data-id="${gate.id}">
            <option value="not-booked" ${gate.status === 'not-booked' ? 'selected' : ''}>Not Booked</option>
            <option value="booked" ${gate.status === 'booked' ? 'selected' : ''}>Booked</option>
            <option value="passed" ${gate.status === 'passed' ? 'selected' : ''}>Passed ✓</option>
            <option value="failed" ${gate.status === 'failed' ? 'selected' : ''}>Failed ✗</option>
            <option value="not-needed" ${gate.status === 'not-needed' ? 'selected' : ''}>Not Needed</option>
          </select>
        </td>
        <td>
          <button class="builder-btn gate-delete-btn" data-id="${gate.id}" style="padding: 4px 8px; font-size: 0.8em;">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.gate-status-select').forEach(select => {
      select.addEventListener('change', function () {
        const id = parseInt(this.dataset.id);
        const gate = state.gates.find(g => g.id === id);
        if (gate) {
          gate.status = this.value;
          saveState();
          updateDashboard();
        }
      });
    });

    tbody.querySelectorAll('.gate-delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        state.gates = state.gates.filter(g => g.id !== id);
        saveState();
        renderGates();
      });
    });
  }

  // =====================================================
  // ISSUES MANAGEMENT
  // =====================================================

  function toggleIssueForm() {
    const form = document.getElementById('siteops-issue-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'grid' : 'none';
    }
  }

  function saveIssue() {
    const category = document.getElementById('siteops-issue-category')?.value;
    const severity = document.getElementById('siteops-issue-severity')?.value;
    const desc = document.getElementById('siteops-issue-desc')?.value;
    const owner = document.getElementById('siteops-issue-owner')?.value;

    if (!desc) {
      if (window.GRACEX_Utils) GRACEX_Utils.showToast('Description required', 'error');
      return;
    }

    const issue = {
      id: issueIdCounter++,
      category: category,
      severity: severity,
      description: desc,
      owner: owner,
      status: 'open',
      created: new Date().toISOString()
    };

    state.issues.push(issue);
    saveState();
    renderIssues();
    updateDashboard();
    toggleIssueForm();

    // Clear form
    document.getElementById('siteops-issue-desc').value = '';
    document.getElementById('siteops-issue-owner').value = '';

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast(`Issue #${issue.id} logged`, 'success');
    }
  }

  function renderIssues() {
    const tbody = document.getElementById('siteops-issues-body');
    if (!tbody) return;

    tbody.innerHTML = state.issues.map(issue => `
      <tr class="issue-${issue.severity} ${issue.status === 'closed' ? 'issue-closed' : ''}">
        <td>#${issue.id}</td>
        <td><span class="issue-category issue-cat-${issue.category}">${issue.category}</span></td>
        <td>${issue.description}</td>
        <td><span class="issue-severity issue-sev-${issue.severity}">${issue.severity}</span></td>
        <td>${issue.owner || '—'}</td>
        <td>
          <select class="issue-status-select" data-id="${issue.id}">
            <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <button class="builder-btn issue-delete-btn" data-id="${issue.id}" style="padding: 4px 8px; font-size: 0.8em;">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.issue-status-select').forEach(select => {
      select.addEventListener('change', function () {
        const id = parseInt(this.dataset.id);
        const issue = state.issues.find(i => i.id === id);
        if (issue) {
          issue.status = this.value;
          saveState();
          updateDashboard();
        }
      });
    });

    tbody.querySelectorAll('.issue-delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        state.issues = state.issues.filter(i => i.id !== id);
        saveState();
        renderIssues();
        updateDashboard();
      });
    });
  }

  // =====================================================
  // SITE DIARY (Enhanced)
  // =====================================================

  function getApiBase() {
    return (window.GRACEX_CONFIG && GRACEX_CONFIG.apiBase) || '';
  }

  function saveDiaryEntry() {
    const date = document.getElementById('siteops-diary-date')?.value;
    const weather = document.getElementById('siteops-diary-weather')?.value;
    const temp = document.getElementById('siteops-diary-temp')?.value;
    const workforce = document.getElementById('siteops-diary-workforce')?.value;
    const activities = document.getElementById('siteops-diary-activities')?.value;
    const delays = document.getElementById('siteops-diary-delays')?.value;
    const visitors = document.getElementById('siteops-diary-visitors')?.value;
    const hs = document.getElementById('siteops-diary-hs')?.value;
    const notes = document.getElementById('siteops-diary-notes')?.value;

    // Collect checked trades
    const tradeCheckboxes = document.querySelectorAll('#siteops-diary-trades input[type=checkbox]:checked');
    const tradesOnSite = Array.from(tradeCheckboxes).map(cb => cb.value);

    if (!date) {
      if (window.GRACEX_Utils) GRACEX_Utils.showToast('Date required', 'error');
      return;
    }

    const projectId = state.project?.id || state.id || 'default';
    const entry = {
      projectId,
      date,
      weather: weather || '',
      temperature: temp || '',
      workforceCount: parseInt(workforce) || 0,
      tradesOnSite,
      activitiesCompleted: activities || '',
      delays: delays || '',
      visitors: visitors || '',
      healthSafety: hs || '',
      notes: notes || ''
    };

    // Save to local state
    const existing = state.dailyLogs.findIndex(l => l.date === date);
    if (existing >= 0) {
      state.dailyLogs[existing] = { ...state.dailyLogs[existing], ...entry, timestamp: new Date().toISOString() };
    } else {
      state.dailyLogs.push({ ...entry, timestamp: new Date().toISOString() });
    }
    saveState();

    // Also save to API
    fetch(getApiBase() + '/api/siteops/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => console.warn('[SITEOPS] Diary API save failed (offline?):', err));

    // Clear text fields
    ['siteops-diary-activities', 'siteops-diary-delays', 'siteops-diary-visitors', 'siteops-diary-hs', 'siteops-diary-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Diary entry saved ✅', 'success');
  }

  function viewDiaryHistory() {
    const output = document.getElementById('siteops-diary-output');
    if (!output) return;

    if (state.dailyLogs.length === 0) {
      output.textContent = 'No diary entries recorded yet.';
      output.style.display = 'block';
      return;
    }

    const lines = [];
    lines.push('═══════════════════════════════════════');
    lines.push('📓 SITE DIARY HISTORY');
    lines.push('═══════════════════════════════════════');

    state.dailyLogs.slice().reverse().forEach(log => {
      lines.push('');
      lines.push(`📅 ${log.date}`);
      lines.push(`Weather: ${log.weather || '—'}  |  Temp: ${log.temperature || log.temp || '—'}°C`);
      lines.push(`Workforce: ${log.workforceCount || log.workforce || '—'}`);
      if (log.tradesOnSite && log.tradesOnSite.length) lines.push(`Trades: ${log.tradesOnSite.join(', ')}`);
      if (log.activitiesCompleted || log.what) lines.push(`Activities: ${log.activitiesCompleted || log.what}`);
      if (log.delays) lines.push(`Delays: ${log.delays}`);
      if (log.visitors) lines.push(`Visitors: ${log.visitors}`);
      if (log.healthSafety) lines.push(`H&S: ${log.healthSafety}`);
      if (log.notes) lines.push(`Notes: ${log.notes}`);
      lines.push('───────────────────────────────────────');
    });

    output.textContent = lines.join('\n');
    output.style.display = 'block';
  }

  // =====================================================
  // SNAGGING LIST
  // =====================================================

  function toggleSnagForm() {
    const form = document.getElementById('siteops-snag-form');
    if (form) form.style.display = form.style.display === 'none' ? 'grid' : 'none';
  }

  function saveSnag() {
    const location = document.getElementById('siteops-snag-location')?.value;
    const desc = document.getElementById('siteops-snag-desc')?.value;
    const severity = document.getElementById('siteops-snag-severity')?.value;
    const trade = document.getElementById('siteops-snag-trade')?.value;

    if (!desc) {
      if (window.GRACEX_Utils) GRACEX_Utils.showToast('Description required', 'error');
      return;
    }

    const projectId = state.project?.id || state.id || 'default';
    const snag = {
      id: 'snag-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      projectId,
      location: location || '',
      description: desc,
      severity: severity || 'minor',
      responsibleTrade: trade || '',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    if (!state.snags) state.snags = [];
    state.snags.push(snag);
    saveState();

    // Also save to API
    fetch(getApiBase() + '/api/siteops/snags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snag)
    }).catch(err => console.warn('[SITEOPS] Snag API save failed (offline?):', err));

    // Clear form and hide
    ['siteops-snag-location', 'siteops-snag-desc', 'siteops-snag-trade'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    toggleSnagForm();
    renderSnags();

    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Snag recorded ✅', 'success');
  }

  function renderSnags() {
    const tbody = document.getElementById('siteops-snags-body');
    const empty = document.getElementById('siteops-snags-empty');
    if (!tbody) return;

    const snags = state.snags || [];
    tbody.innerHTML = '';

    if (snags.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    snags.forEach((snag, idx) => {
      const tr = document.createElement('tr');
      const severityColors = { minor: '#4caf50', moderate: '#ff9800', major: '#f44336' };
      const statusColors = { open: '#f44336', 'in-progress': '#ff9800', resolved: '#4caf50' };

      tr.innerHTML = `
        <td>${snag.location || '—'}</td>
        <td>${snag.description}</td>
        <td><span style="color:${severityColors[snag.severity] || '#ccc'}">${snag.severity}</span></td>
        <td>${snag.responsibleTrade || '—'}</td>
        <td><span style="color:${statusColors[snag.status] || '#ccc'}">${snag.status}</span></td>
        <td>
          ${snag.status === 'open' ? `<button class="builder-btn" onclick="window._siteopsResolveSnag(${idx})" style="font-size:0.8em;padding:2px 6px;">✅ Resolve</button>` : ''}
          ${snag.status === 'resolved' ? `<button class="builder-btn" onclick="window._siteopsReopenSnag(${idx})" style="font-size:0.8em;padding:2px 6px;">🔄 Reopen</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window._siteopsResolveSnag = function (idx) {
    if (state.snags && state.snags[idx]) {
      state.snags[idx].status = 'resolved';
      state.snags[idx].resolvedAt = new Date().toISOString();
      saveState();
      renderSnags();
    }
  };

  window._siteopsReopenSnag = function (idx) {
    if (state.snags && state.snags[idx]) {
      state.snags[idx].status = 'open';
      delete state.snags[idx].resolvedAt;
      saveState();
      renderSnags();
    }
  };

  // =====================================================
  // CHANGE CONTROL
  // =====================================================

  function toggleChangeForm() {
    const form = document.getElementById('siteops-change-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  }

  function saveChange() {
    const desc = document.getElementById('siteops-change-desc')?.value;
    const reason = document.getElementById('siteops-change-reason')?.value;
    const time = document.getElementById('siteops-change-time')?.value;
    const cost = document.getElementById('siteops-change-cost')?.value;
    const phases = document.getElementById('siteops-change-phases')?.value;

    if (!desc) {
      if (window.GRACEX_Utils) GRACEX_Utils.showToast('Description required', 'error');
      return;
    }

    const change = {
      id: changeIdCounter++,
      description: desc,
      reason: reason,
      timeImpact: parseInt(time) || 0,
      costImpact: parseInt(cost) || 0,
      affectedPhases: phases,
      status: 'pending',
      created: new Date().toISOString()
    };

    state.changes.push(change);
    saveState();
    renderChanges();
    toggleChangeForm();

    // Clear form
    document.getElementById('siteops-change-desc').value = '';
    document.getElementById('siteops-change-reason').value = '';
    document.getElementById('siteops-change-time').value = '';
    document.getElementById('siteops-change-cost').value = '';
    document.getElementById('siteops-change-phases').value = '';

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast(`Change #${change.id} logged`, 'success');
    }
  }

  function renderChanges() {
    const tbody = document.getElementById('siteops-changes-body');
    if (!tbody) return;

    tbody.innerHTML = state.changes.map(change => `
      <tr>
        <td>#${change.id}</td>
        <td>${change.description}</td>
        <td>${change.timeImpact > 0 ? '+' + change.timeImpact + ' days' : '—'}</td>
        <td>${change.costImpact > 0 ? '£' + change.costImpact : '—'}</td>
        <td>
          <select class="change-status-select" data-id="${change.id}">
            <option value="pending" ${change.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="approved" ${change.status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="rejected" ${change.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <button class="builder-btn change-delete-btn" data-id="${change.id}" style="padding: 4px 8px; font-size: 0.8em;">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.change-status-select').forEach(select => {
      select.addEventListener('change', function () {
        const id = parseInt(this.dataset.id);
        const change = state.changes.find(c => c.id === id);
        if (change) {
          change.status = this.value;
          saveState();
          if (change.status === 'approved' && change.timeImpact > 0) {
            if (window.GRACEX_Utils) {
              GRACEX_Utils.showToast('Change approved - recalculate programme', 'warning');
            }
          }
        }
      });
    });

    tbody.querySelectorAll('.change-delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.dataset.id);
        state.changes = state.changes.filter(c => c.id !== id);
        saveState();
        renderChanges();
      });
    });
  }

  // =====================================================
  // RAMS GENERATION
  // =====================================================

  function generateProjectRAMS() {
    const output = document.getElementById('siteops-rams-output');
    if (!output) return;

    const lines = [];
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('GRACE-X SITEOPS™ PROJECT RISK ASSESSMENT');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Project: ${state.project.name || 'Unnamed'}`);
    lines.push(`Site: ${state.project.address || '—'}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('');

    lines.push('SITE CONSTRAINTS');
    lines.push('────────────────');
    if (document.getElementById('siteops-constraint-occupied')?.checked) {
      lines.push('⚠️ OCCUPIED PROPERTY - additional safety measures required');
    }
    if (document.getElementById('siteops-constraint-kids')?.checked) {
      lines.push('⚠️ CHILDREN MAY BE PRESENT - secure all hazards');
    }
    if (document.getElementById('siteops-constraint-neighbours')?.checked) {
      lines.push('⚠️ NEIGHBOUR SENSITIVITY - observe noise windows');
    }
    lines.push('');

    lines.push('PHASE-BY-PHASE HAZARDS');
    lines.push('──────────────────────');

    state.phases.forEach(phase => {
      lines.push('');
      lines.push(`▶ ${phase.name} (${phase.trade})`);

      // Generic hazards by trade
      const hazards = getHazardsForTrade(phase.trade);
      hazards.forEach(h => lines.push(`  • ${h}`));
    });

    lines.push('');
    lines.push('GENERAL CONTROLS');
    lines.push('────────────────');
    lines.push('✓ Daily briefings before work starts');
    lines.push('✓ PPE requirements enforced');
    lines.push('✓ First aid kit on site');
    lines.push('✓ Emergency contacts displayed');
    lines.push('✓ Fire extinguisher available');
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');

    output.textContent = lines.join('\n');

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('Project RAMS generated', 'success');
    }
  }

  function getHazardsForTrade(trade) {
    const t = (trade || '').toLowerCase();

    if (t.includes('demolition') || t.includes('strip')) {
      return ['Flying debris', 'Dust inhalation', 'Structural collapse', 'Hidden services'];
    }
    if (t.includes('electric')) {
      return ['Electric shock', 'Burns', 'Fire risk', 'Part P compliance required'];
    }
    if (t.includes('plumb')) {
      return ['Scalding', 'Flooding', 'Legionella', 'Manual handling'];
    }
    if (t.includes('plaster')) {
      return ['Dermatitis', 'Manual handling', 'Dust', 'Working at height (ceilings)'];
    }
    if (t.includes('roof')) {
      return ['Falls from height', 'Fragile surfaces', 'Weather conditions', 'Manual handling'];
    }
    return ['Manual handling', 'Slips/trips', 'Tool use', 'Site traffic'];
  }

  // =====================================================
  // REPORTS
  // =====================================================

  function generateWeeklyReport() {
    const output = document.getElementById('siteops-report-output');
    if (!output) return;

    const lines = [];
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('WEEKLY SITE REPORT');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`Project: ${state.project.name || 'Unnamed'}`);
    lines.push(`Week ending: ${new Date().toLocaleDateString()}`);
    lines.push(`Status: ${state.project.status}`);
    lines.push('');

    lines.push('PROGRAMME STATUS');
    lines.push('────────────────');
    const done = state.phases.filter(p => p.status === 'done').length;
    const inProgress = state.phases.filter(p => p.status === 'in-progress').length;
    const blocked = state.phases.filter(p => p.status === 'blocked').length;
    lines.push(`Completed: ${done}/${state.phases.length} phases`);
    lines.push(`In Progress: ${inProgress}`);
    lines.push(`Blocked: ${blocked}`);
    lines.push('');

    lines.push('ISSUES SUMMARY');
    lines.push('──────────────');
    const openIssues = state.issues.filter(i => i.status !== 'closed');
    lines.push(`Open issues: ${openIssues.length}`);
    lines.push(`Blockers: ${state.issues.filter(i => i.category === 'blocker' && i.status !== 'closed').length}`);
    lines.push('');

    lines.push('GATES STATUS');
    lines.push('────────────');
    state.gates.forEach(g => {
      lines.push(`${g.type}: ${g.status}`);
    });
    lines.push('');

    lines.push('CHANGES THIS WEEK');
    lines.push('─────────────────');
    const recentChanges = state.changes.filter(c => {
      const created = new Date(c.created);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    });
    if (recentChanges.length > 0) {
      recentChanges.forEach(c => lines.push(`#${c.id}: ${c.description} (${c.status})`));
    } else {
      lines.push('No changes this week');
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');

    output.textContent = lines.join('\n');
    output.style.display = 'block';

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('Weekly report generated', 'success');
    }
  }

  function showReportInOutput(lines) {
    const output = document.getElementById('siteops-report-output');
    if (!output) return;
    output.textContent = Array.isArray(lines) ? lines.join('\n') : lines;
    output.style.display = 'block';
  }

  function generateClientReport() {
    const lines = [];
    const proj = state.project || {};
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('CLIENT UPDATE');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`Project: ${proj.name || 'Unnamed'}`);
    lines.push(`Address: ${proj.address || '—'}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('');
    lines.push('PROGRESS SUMMARY');
    lines.push('────────────────');
    const completed = state.phases.filter(p => p.status === 'done');
    lines.push(`Phases completed this period: ${completed.length}`);
    completed.forEach(p => lines.push(`  • ${p.name} (${p.trade})`));
    lines.push('');
    lines.push('NEXT STEPS');
    lines.push('──────────');
    const inProgress = state.phases.filter(p => p.status === 'in-progress');
    inProgress.forEach(p => lines.push(`  • ${p.name}`));
    if (inProgress.length === 0) lines.push('  No phases currently in progress.');
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    showReportInOutput(lines);
    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Client report generated', 'success');
  }

  function generateTradeReport() {
    const lines = [];
    const proj = state.project || {};
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('TRADE BRIEF');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`Project: ${proj.name || 'Unnamed'}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('');
    lines.push('TRADES ON SITE');
    lines.push('──────────────');
    state.trades.forEach(t => {
      lines.push(`  ${t.name || t.trade || t}: ${t.contact || '—'}`);
    });
    lines.push('');
    lines.push('PHASES BY TRADE');
    lines.push('────────────────');
    state.phases.forEach(p => {
      lines.push(`  ${p.name} | ${p.trade} | Start: Day ${p.startDay} | Duration: ${p.duration}d`);
    });
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    showReportInOutput(lines);
    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Trade brief generated', 'success');
  }

  function generateComplianceReport() {
    const lines = [];
    const proj = state.project || {};
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('COMPLIANCE STATUS');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`Project: ${proj.name || 'Unnamed'}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('');
    lines.push('GATES & SIGN-OFFS');
    lines.push('──────────────────');
    state.gates.forEach(g => {
      lines.push(`  ${g.type || g.name || g.id}: ${g.status || 'pending'}`);
    });
    lines.push('');
    lines.push('OPEN ISSUES (COMPLIANCE-RELATED)');
    lines.push('────────────────────────────────');
    const issues = state.issues.filter(i => i.status !== 'closed');
    issues.forEach(i => lines.push(`  [${i.severity || '—'}] ${i.description || ''}`));
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    showReportInOutput(lines);
    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Compliance report generated', 'success');
  }

  function exportRAMS() {
    const output = document.getElementById('siteops-rams-output');
    if (!output || !output.textContent) {
      if (window.GRACEX_Utils) GRACEX_Utils.showToast('Generate RAMS first', 'info');
      return;
    }
    const blob = new Blob([output.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GRACEX_RAMS_' + (state.project.name || 'Project').replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (window.GRACEX_Utils) GRACEX_Utils.showToast('RAMS exported', 'success');
  }

  function exportAll() {
    exportProgramme();
    if (document.getElementById('siteops-rams-output')?.textContent) {
      setTimeout(exportRAMS, 300);
    }
    if (window.GRACEX_Exports && window.GRACEX_Exports.downloadSiteOpsPdf) {
      setTimeout(function () {
        const payload = {
          project: state.project,
          phases: state.phases,
          trades: state.trades,
          gates: state.gates,
          issues: state.issues,
          dailyLogs: state.dailyLogs,
          changes: state.changes
        };
        window.GRACEX_Exports.downloadSiteOpsPdf(payload);
      }, 600);
    }
    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Export all started (programme, RAMS, PDF)', 'success');
  }

  // =====================================================
  // EXPORT
  // =====================================================

  function exportProgramme() {
    const lines = [];
    lines.push('GRACE-X SITEOPS PROGRAMME EXPORT');
    lines.push('Generated: ' + new Date().toISOString());
    lines.push('Project: ' + (state.project.name || 'Unnamed'));
    lines.push('');
    lines.push('PHASES');
    lines.push('──────');

    state.phases.forEach((p, idx) => {
      lines.push(`${idx + 1}. ${p.name}`);
      lines.push(`   Trade: ${p.trade}`);
      lines.push(`   Start: Day ${p.startDay}`);
      lines.push(`   Duration: ${p.duration} days`);
      lines.push(`   Status: ${p.status}`);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GRACEX_Programme_' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    URL.revokeObjectURL(url);

    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('Programme exported', 'success');
    }
  }

  // =====================================================
  // BUILDER INTEGRATION
  // =====================================================

  function importFromBuilder() {
    function getBuilderDataFromStorage() {
      try {
        const raw = localStorage.getItem('gracex_builder_projects');
        if (!raw) return null;
        const projects = JSON.parse(raw);
        const withScope = projects.find(p => p.scopePack && p.scopePack.items && p.scopePack.items.length > 0);
        return withScope || projects[0] || null;
      } catch (e) {
        return null;
      }
    }

    function applyImportedState(imported) {
      if (!imported || !imported.project) return;
      state.project = imported.project;
      state.phases = imported.phases || [];
      state.trades = imported.trades || [];
      state.dependencies = imported.dependencies || [];
      state.gates = imported.gates || [];
      state.issues = imported.issues || [];
      state.dailyLogs = imported.dailyLogs || [];
      state.changes = imported.changes || [];
      if (state.phases.length > 0) {
        phaseIdCounter = Math.max(...state.phases.map(p => p.id)) + 1;
      }
      if (state.issues.length > 0) {
        issueIdCounter = Math.max(...state.issues.map(i => i.id)) + 1;
      }
      if (state.changes.length > 0) {
        changeIdCounter = Math.max(...state.changes.map(c => c.id)) + 1;
      }
      saveState();
      renderProgramme();
      renderTrades();
      renderGates();
      renderIssues();
      renderChanges();
      updateDashboard();
    }

    const builderProject = getBuilderDataFromStorage();
    if (!builderProject) {
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('No Builder data found - create a scope pack in Builder first', 'info');
      }
      return;
    }

    const scopePack = builderProject.scopePack || { items: [] };
    const items = scopePack.items || [];
    if (items.length === 0) {
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Builder project has no scope items - add tasks in Builder first', 'info');
      }
      return;
    }

    const payload = {
      scopePack: { items: items },
      name: builderProject.name || 'Imported from Builder',
      address: builderProject.address || ''
    };

    var importHeaders = (window.GRACEX_Auth && window.GRACEX_Auth.authHeaders) ? window.GRACEX_Auth.authHeaders() : { 'Content-Type': 'application/json' };
    fetch(SITEOPS_API_BASE + '/api/siteops/import-builder', {
      method: 'POST',
      headers: importHeaders,
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.state) {
          applyImportedState(data.state);
          if (window.GRACEX_Utils) {
            GRACEX_Utils.showToast('Imported ' + items.length + ' items from Builder', 'success');
          }
        } else {
          throw new Error(data.error || 'Import failed');
        }
      })
      .catch(err => {
        console.warn('[GRACEX SITEOPS] Builder import failed:', err);
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Import failed: ' + (err.message || 'check backend'), 'error');
        }
      });
  }

  // =====================================================
  // WIRE BRAIN
  // =====================================================

  function wireSiteOpsBrain() {
    if (window.setupModuleBrain) {
      window.setupModuleBrain('siteops', {
        panelId: 'siteops-brain-panel',
        inputId: 'siteops-brain-input',
        sendId: 'siteops-brain-send',
        outputId: 'siteops-brain-output',
        clearId: 'siteops-brain-clear',
        initialMessage: "I'm GRACE-X SiteOps. I coordinate multi-trade projects and keep your programme on track. What's the project?"
      });
    }
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  function init() {
    console.log('[GRACEX SITEOPS] Initializing v2.0...');

    // Load saved state
    loadState();

    // Set today's date for diary
    const dateInput = document.getElementById('siteops-diary-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Ensure snags array exists in state
    if (!state.snags) state.snags = [];

    // Wire up all buttons
    document.getElementById('siteops-btn-add-phase')?.addEventListener('click', addPhase);
    document.getElementById('siteops-btn-programme-recalc')?.addEventListener('click', recalculateProgramme);
    document.getElementById('siteops-btn-sequence-check')?.addEventListener('click', validateSequence);
    document.getElementById('siteops-btn-trade-add')?.addEventListener('click', addTrade);
    document.getElementById('siteops-btn-gate-add')?.addEventListener('click', addGate);
    document.getElementById('siteops-btn-issue-add')?.addEventListener('click', toggleIssueForm);
    document.getElementById('siteops-issue-save')?.addEventListener('click', saveIssue);
    document.getElementById('siteops-diary-save')?.addEventListener('click', saveDiaryEntry);
    document.getElementById('siteops-diary-history')?.addEventListener('click', viewDiaryHistory);
    document.getElementById('siteops-btn-snag-add')?.addEventListener('click', toggleSnagForm);
    document.getElementById('siteops-snag-save')?.addEventListener('click', saveSnag);
    document.getElementById('siteops-btn-change-new')?.addEventListener('click', toggleChangeForm);
    document.getElementById('siteops-change-save')?.addEventListener('click', saveChange);
    document.getElementById('siteops-change-cancel')?.addEventListener('click', toggleChangeForm);
    document.getElementById('siteops-btn-rams-generate')?.addEventListener('click', generateProjectRAMS);
    document.getElementById('siteops-btn-report-weekly')?.addEventListener('click', generateWeeklyReport);
    document.getElementById('siteops-btn-report-client')?.addEventListener('click', generateClientReport);
    document.getElementById('siteops-btn-report-trade')?.addEventListener('click', generateTradeReport);
    document.getElementById('siteops-btn-report-compliance')?.addEventListener('click', generateComplianceReport);
    document.getElementById('siteops-btn-export-programme')?.addEventListener('click', exportProgramme);
    document.getElementById('siteops-btn-export-rams')?.addEventListener('click', exportRAMS);
    document.getElementById('siteops-btn-export-all')?.addEventListener('click', exportAll);
    document.getElementById('siteops-btn-import-from-builder')?.addEventListener('click', importFromBuilder);

    // Project info save on change
    ['siteops-project-name', 'siteops-project-address', 'siteops-project-status', 'siteops-project-start'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', function () {
        state.project[this.id.replace('siteops-project-', '')] = this.value;
        saveState();
        updateDashboard();
      });
    });

    // Constraints save on change
    ['occupied', 'kids', 'pets', 'elderly', 'neighbours', 'parking'].forEach(c => {
      document.getElementById('siteops-constraint-' + c)?.addEventListener('change', function () {
        state.project.constraints[c] = this.checked;
        saveState();
        updateConstraintsSummary();
      });
    });

    // Render all
    renderProgramme();
    renderTrades();
    renderGates();
    renderIssues();
    renderChanges();
    renderSnags();
    updateDashboard();

    // Wire brain
    wireSiteOpsBrain();

    console.log('[GRACEX SITEOPS] Initialized successfully');
  }

  // =====================================================
  // MODULE HOOKS
  // =====================================================

  document.addEventListener('gracex:module:loaded', function (ev) {
    try {
      const detail = ev.detail || {};
      const mod = detail.module || '';
      const url = detail.url || '';

      if (mod === 'siteops' || (url && url.indexOf('siteops.html') !== -1)) {
        setTimeout(init, 100);
      }
    } catch (err) {
      console.warn('[GRACEX SITEOPS] Init via event failed:', err);
    }
  });

  // Direct open
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

})();
