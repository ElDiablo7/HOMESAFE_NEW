// GRACE-X Utilities
// Shared utilities for all modules
// ------------------------------

(function() {
  'use strict';

  window.GRACEX_Utils = {
    
    // Debounce function calls
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function calls
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Safe JSON parse
    safeJSONParse: function(str, fallback = null) {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.warn('[GRACEX Utils] JSON parse error:', e);
        return fallback;
      }
    },

    // Safe localStorage get
    getStorage: function(key, fallback = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? this.safeJSONParse(item, fallback) : fallback;
      } catch (e) {
        console.warn('[GRACEX Utils] Storage get error:', e);
        return fallback;
      }
    },

    // Safe localStorage set
    setStorage: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('[GRACEX Utils] Storage set error:', e);
        return false;
      }
    },

    // Format date/time
    formatTime: function(date = new Date()) {
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    formatDate: function(date = new Date()) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    formatDateTime: function(date = new Date()) {
      return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    // Escape HTML
    escapeHTML: function(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    // Show toast notification
    showToast: function(message, type = 'info', duration = 3000) {
      const toast = document.createElement('div');
      toast.className = `gracex-toast gracex-toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    // Show loading indicator
    showLoading: function(element, message = 'Loading...') {
      if (!element) return null;
      
      const loader = document.createElement('div');
      loader.className = 'gracex-loader';
      loader.innerHTML = `
        <div class="gracex-spinner"></div>
        <div class="gracex-loader-text">${this.escapeHTML(message)}</div>
      `;
      loader.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
      `;
      
      element.style.position = 'relative';
      element.appendChild(loader);
      
      return loader;
    },

    hideLoading: function(loader) {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    },

    // Copy to clipboard
    copyToClipboard: function(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => this.showToast('Copied to clipboard!', 'success', 2000))
          .catch(err => this.showToast('Failed to copy', 'error', 2000));
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          this.showToast('Copied to clipboard!', 'success', 2000);
        } catch (err) {
          this.showToast('Failed to copy', 'error', 2000);
        }
        document.body.removeChild(textarea);
      }
    },

    // Keyboard shortcut helper
    addKeyboardShortcut: function(key, callback, element = document) {
      element.addEventListener('keydown', (e) => {
        // Check if modifier keys match
        const modifiers = {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          alt: e.altKey,
          meta: e.metaKey
        };
        
        if (typeof key === 'string') {
          if (e.key.toLowerCase() === key.toLowerCase()) {
            e.preventDefault();
            callback(e);
          }
        } else if (typeof key === 'object') {
          // Complex shortcut like { key: 's', ctrl: true }
          let match = e.key.toLowerCase() === key.key.toLowerCase();
          if (key.ctrl !== undefined) match = match && modifiers.ctrl === key.ctrl;
          if (key.shift !== undefined) match = match && modifiers.shift === key.shift;
          if (key.alt !== undefined) match = match && modifiers.alt === key.alt;
          if (key.meta !== undefined) match = match && modifiers.meta === key.meta;
          
          if (match) {
            e.preventDefault();
            callback(e);
          }
        }
      });
    },

    // Validate input
    validateInput: function(value, rules) {
      const errors = [];
      
      if (rules.required && !value) {
        errors.push('This field is required');
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimum ${rules.minLength} characters required`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximum ${rules.maxLength} characters allowed`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || 'Invalid format');
      }
      
      if (rules.min && parseFloat(value) < rules.min) {
        errors.push(`Minimum value is ${rules.min}`);
      }
      
      if (rules.max && parseFloat(value) > rules.max) {
        errors.push(`Maximum value is ${rules.max}`);
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    },

    // Format number with commas
    formatNumber: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Format currency (GBP)
    formatCurrency: function(amount) {
      return `£${this.formatNumber(amount.toFixed(2))}`;
    },

    // Calculate percentage
    percentage: function(value, total) {
      return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    },

    // Generate unique ID
    generateId: function(prefix = 'gracex') {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Smooth scroll to element
    scrollToElement: function(element, offset = 0) {
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    },

    // Check if element is in viewport
    isInViewport: function(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // Download file
    downloadFile: function(data, filename, type = 'text/plain') {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast(`Downloaded ${filename}`, 'success', 2000);
    },

    // Parse CSV
    parseCSV: function(csv) {
      const lines = csv.split('\n');
      const result = [];
      const headers = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const obj = {};
        const currentline = lines[i].split(',');
        
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j].trim()] = currentline[j]?.trim() || '';
        }
        result.push(obj);
      }
      
      return result;
    },

    // Export to CSV
    exportToCSV: function(data, filename = 'export.csv') {
      if (!data || !data.length) {
        this.showToast('No data to export', 'error', 2000);
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');
      
      this.downloadFile(csv, filename, 'text/csv');
    },

    // Retry async function
    retry: async function(fn, retries = 3, delay = 1000) {
      try {
        return await fn();
      } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay);
      }
    },

    // Wait for condition
    waitFor: function(condition, timeout = 5000, interval = 100) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = () => {
          if (condition()) {
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, interval);
          }
        };
        check();
      });
    }
  };

  // Add CSS for animations and components
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .gracex-spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .gracex-loader-text {
      color: white;
      margin-top: 12px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  console.log('[GRACEX Utils] Utilities loaded');
})();
