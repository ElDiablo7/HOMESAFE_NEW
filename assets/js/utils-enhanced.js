/**
 * GRACE-X AI™ Enhanced Global Utilities v6.4.1
 * Professional error handling, debouncing, and helper functions
 * Engineered by Zac Crockett
 */

// ============================================
// ERROR HANDLING & LOGGING
// ============================================

const GraceXUtils = {
  // Logging with levels
  log: {
    info: (module, message, data = null) => {
      console.log(`[GRACE-X ${module}] ℹ️ ${message}`, data || '');
    },
    
    warn: (module, message, data = null) => {
      console.warn(`[GRACE-X ${module}] ⚠️ ${message}`, data || '');
    },
    
    error: (module, message, error = null) => {
      console.error(`[GRACE-X ${module}] ❌ ${message}`, error || '');
      // Could send to error tracking service here
    },
    
    success: (module, message, data = null) => {
      console.log(`[GRACE-X ${module}] ✅ ${message}`, data || '');
    }
  },

  // User-friendly error messages
  showError: (message, duration = 5000) => {
    const toast = document.createElement('div');
    toast.className = 'gx-toast gx-toast-error';
    toast.innerHTML = `
      <div class="gx-toast-icon">⚠️</div>
      <div class="gx-toast-content">
        <div class="gx-toast-title">Error</div>
        <div class="gx-toast-message">${GraceXUtils.escapeHtml(message)}</div>
      </div>
      <button class="gx-toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('gx-toast-show'), 10);
    
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('gx-toast-show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
    
    return toast;
  },

  // Success notifications
  showSuccess: (message, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'gx-toast gx-toast-success';
    toast.innerHTML = `
      <div class="gx-toast-icon">✓</div>
      <div class="gx-toast-content">
        <div class="gx-toast-message">${GraceXUtils.escapeHtml(message)}</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('gx-toast-show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('gx-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
  },

  // Loading indicator
  showLoading: (message = 'Loading...') => {
    const loading = document.createElement('div');
    loading.className = 'gx-loading-overlay';
    loading.id = 'gx-global-loading';
    loading.innerHTML = `
      <div class="gx-loading-spinner">
        <div class="gx-spinner"></div>
        <div class="gx-loading-text">${GraceXUtils.escapeHtml(message)}</div>
      </div>
    `;
    
    document.body.appendChild(loading);
    setTimeout(() => loading.classList.add('gx-loading-show'), 10);
    
    return {
      update: (newMessage) => {
        const textEl = loading.querySelector('.gx-loading-text');
        if (textEl) textEl.textContent = newMessage;
      },
      hide: () => {
        loading.classList.remove('gx-loading-show');
        setTimeout(() => loading.remove(), 300);
      }
    };
  },

  hideLoading: () => {
    const loading = document.getElementById('gx-global-loading');
    if (loading) {
      loading.classList.remove('gx-loading-show');
      setTimeout(() => loading.remove(), 300);
    }
  },

  // ============================================
  // PERFORMANCE UTILITIES
  // ============================================

  // Debounce function calls
  debounce: (func, wait = 300) => {
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
  throttle: (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // ============================================
  // VALIDATION & SANITIZATION
  // ============================================

  // Escape HTML to prevent XSS
  escapeHtml: (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  },

  // Validate email format
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  // Validate URL format
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // ============================================
  // STORAGE UTILITIES
  // ============================================

  // Safe localStorage wrapper
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        GraceXUtils.log.error('Storage', 'Failed to get item', error);
        return defaultValue;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        GraceXUtils.log.error('Storage', 'Failed to set item', error);
        return false;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        GraceXUtils.log.error('Storage', 'Failed to remove item', error);
        return false;
      }
    },

    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        GraceXUtils.log.error('Storage', 'Failed to clear storage', error);
        return false;
      }
    }
  },

  // ============================================
  // DOM UTILITIES
  // ============================================

  // Wait for element to exist
  waitForElement: (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  // Smooth scroll to element
  scrollTo: (element, offset = 0, behavior = 'smooth') => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior });
  },

  // ============================================
  // COPY TO CLIPBOARD
  // ============================================

  copyToClipboard: async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        GraceXUtils.showSuccess('Copied to clipboard');
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          GraceXUtils.showSuccess('Copied to clipboard');
          return true;
        } catch (error) {
          GraceXUtils.showError('Failed to copy');
          return false;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      GraceXUtils.log.error('Utils', 'Copy failed', error);
      GraceXUtils.showError('Failed to copy');
      return false;
    }
  },

  // ============================================
  // DATE & TIME UTILITIES
  // ============================================

  // Format date/time
  formatDate: (date, format = 'short') => {
    const d = new Date(date);
    
    const formats = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      }
    };
    
    return d.toLocaleDateString('en-GB', formats[format] || formats.short);
  },

  // Relative time (e.g., "2 hours ago")
  timeAgo: (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  },

  // ============================================
  // FILE UTILITIES
  // ============================================

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Download file
  downloadFile: (data, filename, mimeType = 'text/plain') => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    GraceXUtils.showSuccess(`Downloaded ${filename}`);
  },

  // ============================================
  // ANIMATION UTILITIES
  // ============================================

  // Animate value from start to end
  animateValue: (element, start, end, duration = 1000, suffix = '') => {
    const range = end - start;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const eased = progress * (2 - progress);
      const value = start + (range * eased);
      
      element.textContent = Math.round(value) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },

  // ============================================
  // NETWORK UTILITIES
  // ============================================

  // Check if online
  isOnline: () => navigator.onLine,

  // Retry fetch with exponential backoff
  retryFetch: async (url, options = {}, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        
        if (i === maxRetries - 1) throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

// Make globally available
window.GraceXUtils = GraceXUtils;

// ============================================
// INITIALIZE ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (event) => {
  GraceXUtils.log.error('Global', 'Uncaught error', event.error);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  GraceXUtils.log.error('Global', 'Unhandled promise rejection', event.reason);
});

// Log initialization
GraceXUtils.log.success('Utils', 'GRACE-X Enhanced Utilities loaded');
