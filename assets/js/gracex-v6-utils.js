/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRACE-X V6 UTILITIES
 * Enhanced UI components, storage, and common functionality
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════════
  // STORAGE MANAGER - LocalStorage with namespace
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXStorage = {
    prefix: 'gracex_',
    
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(this.prefix + key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('GXStorage.get error:', e);
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('GXStorage.set error:', e);
        return false;
      }
    },
    
    remove(key) {
      localStorage.removeItem(this.prefix + key);
    },
    
    clear() {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.prefix))
        .forEach(k => localStorage.removeItem(k));
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // THEME MANAGER - Dark/Light toggle
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXTheme = {
    current: 'dark',
    
    init() {
      this.current = GXStorage.get('theme', 'dark');
      this.apply();
      this.createToggle();
    },
    
    apply() {
      document.documentElement.setAttribute('data-theme', this.current);
    },
    
    toggle() {
      this.current = this.current === 'dark' ? 'light' : 'dark';
      this.apply();
      GXStorage.set('theme', this.current);
      this.updateToggleIcon();
      GXToast.show({
        type: 'info',
        title: 'Theme Changed',
        message: `Switched to ${this.current} mode`
      });
    },
    
    createToggle() {
      const existing = document.querySelector('.gx-theme-toggle');
      if (existing) return;
      
      const toggle = document.createElement('button');
      toggle.className = 'gx-theme-toggle';
      toggle.setAttribute('data-tooltip', 'Toggle theme');
      toggle.innerHTML = this.current === 'dark' ? '☀️' : '🌙';
      toggle.addEventListener('click', () => this.toggle());
      document.body.appendChild(toggle);
    },
    
    updateToggleIcon() {
      const toggle = document.querySelector('.gx-theme-toggle');
      if (toggle) {
        toggle.innerHTML = this.current === 'dark' ? '☀️' : '🌙';
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXToast = {
    container: null,
    
    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'gx-toast-container';
        document.body.appendChild(this.container);
      }
    },
    
    show({ type = 'info', title = '', message = '', duration = 4000 }) {
      this.init();
      
      const icons = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
      };
      
      const toast = document.createElement('div');
      toast.className = `gx-toast ${type}`;
      toast.innerHTML = `
        <span class="gx-toast-icon">${icons[type] || icons.info}</span>
        <div class="gx-toast-content">
          ${title ? `<div class="gx-toast-title">${title}</div>` : ''}
          ${message ? `<div class="gx-toast-message">${message}</div>` : ''}
        </div>
        <span class="gx-toast-close">✕</span>
      `;
      
      toast.querySelector('.gx-toast-close').addEventListener('click', () => {
        this.dismiss(toast);
      });
      
      this.container.appendChild(toast);
      
      if (duration > 0) {
        setTimeout(() => this.dismiss(toast), duration);
      }
      
      return toast;
    },
    
    dismiss(toast) {
      toast.style.animation = 'gx-toast-out 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    },
    
    success(title, message) {
      return this.show({ type: 'success', title, message });
    },
    
    warning(title, message) {
      return this.show({ type: 'warning', title, message });
    },
    
    error(title, message) {
      return this.show({ type: 'error', title, message });
    },
    
    info(title, message) {
      return this.show({ type: 'info', title, message });
    }
  };

  // Add toast out animation
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    @keyframes gx-toast-out {
      to { opacity: 0; transform: translateX(100px); }
    }
  `;
  document.head.appendChild(toastStyle);

  // ═══════════════════════════════════════════════════════════════════════════════
  // MODAL MANAGER
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXModal = {
    show({ title = '', content = '', buttons = [], onClose = null }) {
      const overlay = document.createElement('div');
      overlay.className = 'gx-modal-overlay';
      
      let buttonsHtml = '';
      buttons.forEach((btn, i) => {
        buttonsHtml += `<button class="gx-btn ${btn.class || ''}" data-btn-index="${i}">${btn.text}</button>`;
      });
      
      overlay.innerHTML = `
        <div class="gx-modal">
          <div class="gx-modal-header">
            <span class="gx-modal-title">${title}</span>
            <span class="gx-modal-close" style="cursor: pointer; font-size: 1.5rem; opacity: 0.5;">×</span>
          </div>
          <div class="gx-modal-body">${content}</div>
          ${buttonsHtml ? `<div class="gx-modal-footer">${buttonsHtml}</div>` : ''}
        </div>
      `;
      
      const close = () => {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 300);
        if (onClose) onClose();
      };
      
      overlay.querySelector('.gx-modal-close').addEventListener('click', close);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      
      buttons.forEach((btn, i) => {
        overlay.querySelector(`[data-btn-index="${i}"]`).addEventListener('click', () => {
          if (btn.onClick) btn.onClick();
          if (btn.closeOnClick !== false) close();
        });
      });
      
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('open'));
      
      return { close, overlay };
    },
    
    confirm({ title = 'Confirm', message = '', onConfirm = null, onCancel = null }) {
      return this.show({
        title,
        content: `<p>${message}</p>`,
        buttons: [
          { text: 'Cancel', class: 'gx-btn-ghost', onClick: onCancel },
          { text: 'Confirm', class: 'gx-btn-primary', onClick: onConfirm }
        ]
      });
    },
    
    alert({ title = 'Alert', message = '' }) {
      return this.show({
        title,
        content: `<p>${message}</p>`,
        buttons: [
          { text: 'OK', class: 'gx-btn-primary' }
        ]
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // STATS DASHBOARD GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXStats = {
    create(containerId, stats) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.className = 'gx-stats-grid';
      container.innerHTML = stats.map(stat => `
        <div class="gx-stat-card">
          <div class="gx-stat-value">${stat.value}</div>
          <div class="gx-stat-label">${stat.label}</div>
          ${stat.change ? `<div class="gx-stat-change ${stat.change > 0 ? 'positive' : 'negative'}">${stat.change > 0 ? '+' : ''}${stat.change}%</div>` : ''}
        </div>
      `).join('');
    },
    
    update(containerId, index, value) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const cards = container.querySelectorAll('.gx-stat-card');
      if (cards[index]) {
        const valueEl = cards[index].querySelector('.gx-stat-value');
        if (valueEl) valueEl.textContent = value;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // PROGRESS BAR GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXProgress = {
    create(containerId, { value = 0, variant = '' } = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.className = `gx-progress ${variant ? 'gx-progress-' + variant : ''}`;
      container.innerHTML = `<div class="gx-progress-bar" style="width: ${Math.min(100, Math.max(0, value))}%"></div>`;
    },
    
    update(containerId, value) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const bar = container.querySelector('.gx-progress-bar');
      if (bar) {
        bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // LIST MANAGER (CRUD for UI lists)
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXList = {
    create(containerId, { items = [], onToggle = null, onDelete = null, storageKey = null } = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      // Load from storage if key provided
      if (storageKey) {
        const stored = GXStorage.get(storageKey);
        if (stored) items = stored;
      }
      
      container.className = 'gx-list';
      container._items = items;
      container._storageKey = storageKey;
      container._onToggle = onToggle;
      container._onDelete = onDelete;
      
      this.render(container);
    },
    
    render(container) {
      if (container._items.length === 0) {
        container.innerHTML = `
          <div class="gx-empty-state">
            <div class="gx-empty-state-icon">📋</div>
            <div class="gx-empty-state-title">No items yet</div>
            <div class="gx-empty-state-message">Add your first item to get started</div>
          </div>
        `;
        return;
      }
      
      container.innerHTML = container._items.map((item, i) => `
        <div class="gx-list-item ${item.completed ? 'completed' : ''}" data-index="${i}">
          <div class="gx-list-checkbox ${item.completed ? 'checked' : ''}" data-action="toggle"></div>
          <div class="gx-list-content">
            <div class="gx-list-title">${item.text || item.title || item}</div>
            ${item.subtitle ? `<div class="gx-list-subtitle" style="font-size: 0.8rem; opacity: 0.7;">${item.subtitle}</div>` : ''}
          </div>
          <div class="gx-list-actions">
            <button class="gx-btn gx-btn-icon gx-btn-ghost" data-action="delete" style="font-size: 0.8rem;">🗑️</button>
          </div>
        </div>
      `).join('');
      
      // Add event listeners
      container.querySelectorAll('[data-action="toggle"]').forEach(el => {
        el.addEventListener('click', () => {
          const index = parseInt(el.closest('.gx-list-item').dataset.index);
          this.toggleItem(container, index);
        });
      });
      
      container.querySelectorAll('[data-action="delete"]').forEach(el => {
        el.addEventListener('click', () => {
          const index = parseInt(el.closest('.gx-list-item').dataset.index);
          this.deleteItem(container, index);
        });
      });
    },
    
    addItem(containerId, item) {
      const container = document.getElementById(containerId);
      if (!container || !container._items) return;
      
      const newItem = typeof item === 'string' ? { text: item, completed: false } : { ...item, completed: false };
      container._items.push(newItem);
      
      if (container._storageKey) {
        GXStorage.set(container._storageKey, container._items);
      }
      
      this.render(container);
      GXToast.success('Added', 'Item added successfully');
    },
    
    toggleItem(container, index) {
      if (!container._items[index]) return;
      
      container._items[index].completed = !container._items[index].completed;
      
      if (container._storageKey) {
        GXStorage.set(container._storageKey, container._items);
      }
      
      if (container._onToggle) {
        container._onToggle(container._items[index], index);
      }
      
      this.render(container);
    },
    
    deleteItem(container, index) {
      container._items.splice(index, 1);
      
      if (container._storageKey) {
        GXStorage.set(container._storageKey, container._items);
      }
      
      if (container._onDelete) {
        container._onDelete(index);
      }
      
      this.render(container);
    },
    
    clearAll(containerId) {
      const container = document.getElementById(containerId);
      if (!container || !container._items) return;
      
      container._items = [];
      
      if (container._storageKey) {
        GXStorage.set(container._storageKey, []);
      }
      
      this.render(container);
    },
    
    getItems(containerId) {
      const container = document.getElementById(containerId);
      return container && container._items ? [...container._items] : [];
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // TABS MANAGER
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXTabs = {
    init(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const tabs = container.querySelectorAll('.gx-tab');
      const contents = container.querySelectorAll('.gx-tab-content');
      
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          contents.forEach(c => c.classList.remove('active'));
          
          tab.classList.add('active');
          if (contents[i]) contents[i].classList.add('active');
        });
      });
      
      // Activate first tab
      if (tabs[0]) tabs[0].click();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXShortcuts = {
    shortcuts: {},
    
    register(key, callback, description = '') {
      this.shortcuts[key.toLowerCase()] = { callback, description };
    },
    
    init() {
      document.addEventListener('keydown', (e) => {
        // Build key string
        let key = '';
        if (e.ctrlKey || e.metaKey) key += 'ctrl+';
        if (e.shiftKey) key += 'shift+';
        if (e.altKey) key += 'alt+';
        const baseKey = (typeof e.key === 'string') ? e.key.toLowerCase() : '';
        key += baseKey;
        
        const shortcut = this.shortcuts[key];
        if (shortcut && !e.target.matches('input, textarea, select')) {
          e.preventDefault();
          shortcut.callback(e);
        }
      });
    },
    
    showHelp() {
      const list = Object.entries(this.shortcuts)
        .map(([key, { description }]) => `<li><strong>${key}</strong>: ${description || 'No description'}</li>`)
        .join('');
      
      GXModal.show({
        title: 'Keyboard Shortcuts',
        content: `<ul style="list-style: none; padding: 0; margin: 0;">${list}</ul>`,
        buttons: [{ text: 'Close', class: 'gx-btn-primary' }]
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // DATA EXPORT/IMPORT
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXData = {
    exportJSON(data, filename = 'gracex-export.json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      GXToast.success('Exported', `Data exported to ${filename}`);
    },
    
    exportCSV(data, filename = 'gracex-export.csv') {
      if (!Array.isArray(data) || data.length === 0) {
        GXToast.error('Export Error', 'No data to export');
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      GXToast.success('Exported', `Data exported to ${filename}`);
    },
    
    importJSON(callback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            callback(data);
            GXToast.success('Imported', 'Data imported successfully');
          } catch (err) {
            GXToast.error('Import Error', 'Invalid JSON file');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORMAT HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════
  const GXFormat = {
    currency(value, currency = 'GBP') {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency
      }).format(value);
    },
    
    number(value, decimals = 2) {
      return Number(value).toFixed(decimals);
    },
    
    percent(value, decimals = 1) {
      return `${Number(value).toFixed(decimals)}%`;
    },
    
    date(value, format = 'short') {
      const d = new Date(value);
      const options = format === 'long' 
        ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
      return d.toLocaleDateString('en-GB', options);
    },
    
    time(value) {
      const d = new Date(value);
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },
    
    relative(value) {
      const d = new Date(value);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return this.date(value);
    },
    
    bytes(value) {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
      }
      return `${value.toFixed(1)} ${units[i]}`;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // INITIALIZE ON DOM READY
  // ═══════════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    GXTheme.init();
    
    // Initialize keyboard shortcuts
    GXShortcuts.init();
    
    // Register default shortcuts
    GXShortcuts.register('ctrl+k', () => {
      // Could open command palette
      GXToast.info('Shortcut', 'Command palette coming soon!');
    }, 'Open command palette');
    
    GXShortcuts.register('ctrl+/', () => {
      GXShortcuts.showHelp();
    }, 'Show keyboard shortcuts');
    
    GXShortcuts.register('ctrl+d', () => {
      GXTheme.toggle();
    }, 'Toggle dark/light theme');
    
    console.log('GRACE-X V6 Utilities loaded');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPOSE TO GLOBAL SCOPE
  // ═══════════════════════════════════════════════════════════════════════════════
  window.GXStorage = GXStorage;
  window.GXTheme = GXTheme;
  window.GXToast = GXToast;
  window.GXModal = GXModal;
  window.GXStats = GXStats;
  window.GXProgress = GXProgress;
  window.GXList = GXList;
  window.GXTabs = GXTabs;
  window.GXShortcuts = GXShortcuts;
  window.GXData = GXData;
  window.GXFormat = GXFormat;

})();

