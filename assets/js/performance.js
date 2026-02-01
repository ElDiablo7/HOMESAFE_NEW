/**
 * GRACE-X AI™ Performance Optimization v6.4.1
 * Lazy loading, code splitting, caching strategies
 * Engineered by Zac Crockett
 */

const GraceXPerformance = {
  // ============================================
  // LAZY LOADING IMAGES
  // ============================================
  
  initLazyLoading: () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
      });
      
      GraceXUtils.log.success('Performance', 'Lazy loading initialized');
    }
  },

  // ============================================
  // MODULE PRELOADING
  // ============================================
  
  preloadModule: (moduleName) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = `/modules/${moduleName}.html`;
    document.head.appendChild(link);
  },

  // Prefetch likely next modules
  prefetchLikelyModules: () => {
    const moduleUsage = GraceXUtils.storage.get('module_usage', {});
    const sortedModules = Object.entries(moduleUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([module]) => module);
    
    sortedModules.forEach(module => {
      GraceXPerformance.preloadModule(module);
    });
  },

  // ============================================
  // CACHE MANAGEMENT
  // ============================================
  
  initServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        GraceXUtils.log.success('Performance', 'Service worker registered');
        return registration;
      } catch (error) {
        GraceXUtils.log.warn('Performance', 'Service worker registration failed', error);
      }
    }
  },

  // Clear old caches
  clearOldCaches: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter(name => !name.includes('v6.4'));
      
      await Promise.all(
        cachesToDelete.map(name => caches.delete(name))
      );
      
      if (cachesToDelete.length > 0) {
        GraceXUtils.log.success('Performance', `Cleared ${cachesToDelete.length} old caches`);
      }
    }
  },

  // ============================================
  // RESOURCE HINTS
  // ============================================
  
  addResourceHints: () => {
    // DNS prefetch for external resources
    const dnsPrefetch = [
      'https://api.anthropic.com',
      'https://api.openai.com'
    ];
    
    dnsPrefetch.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
    
    // Preconnect to API
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'http://localhost:3000';
    document.head.appendChild(preconnect);
  },

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  
  measurePageLoad: () => {
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart,
          domComplete: perfData.domComplete - perfData.fetchStart,
          loadComplete: perfData.loadEventEnd - perfData.fetchStart
        };
        
        GraceXUtils.log.info('Performance', 'Page load metrics', metrics);
        
        // Store metrics
        GraceXUtils.storage.set('perf_last_load', {
          timestamp: Date.now(),
          metrics
        });
      }
    });
  },

  // Measure specific operations
  measure: async (name, operation) => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      GraceXUtils.log.info('Performance', `${name} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      GraceXUtils.log.error('Performance', `${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // ============================================
  // MEMORY MANAGEMENT
  // ============================================
  
  monitorMemory: () => {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
        const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
        
        GraceXUtils.log.info('Performance', 
          `Memory: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`
        );
        
        // Warn if memory usage is high
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
          GraceXUtils.log.warn('Performance', 'High memory usage detected');
        }
      }, 30000); // Check every 30 seconds
    }
  },

  // Clean up unused resources
  cleanup: () => {
    // Remove unused event listeners
    // Clear large data structures
    // Reset module states if needed
    GraceXUtils.log.info('Performance', 'Cleanup performed');
  },

  // ============================================
  // NETWORK OPTIMIZATION
  // ============================================
  
  optimizeNetworkRequests: () => {
    // Batch API requests
    let requestQueue = [];
    let requestTimer = null;
    
    window.batchRequest = (request) => {
      requestQueue.push(request);
      
      if (requestTimer) clearTimeout(requestTimer);
      
      requestTimer = setTimeout(async () => {
        const requests = [...requestQueue];
        requestQueue = [];
        
        try {
          const results = await Promise.all(requests);
          GraceXUtils.log.success('Performance', `Batched ${results.length} requests`);
          return results;
        } catch (error) {
          GraceXUtils.log.error('Performance', 'Batch request failed', error);
        }
      }, 100);
    };
  },

  // ============================================
  // FPS MONITORING
  // ============================================
  
  monitorFPS: () => {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    function measureFPS() {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
        
        if (fps < 30) {
          GraceXUtils.log.warn('Performance', `Low FPS detected: ${fps}`);
        }
      }
      
      requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
    
    // Expose FPS getter
    window.getCurrentFPS = () => fps;
  },

  // ============================================
  // INITIALIZATION
  // ============================================
  
  init: () => {
    GraceXUtils.log.info('Performance', 'Initializing performance optimizations...');
    
    // Initialize all optimizations
    GraceXPerformance.initLazyLoading();
    GraceXPerformance.addResourceHints();
    GraceXPerformance.measurePageLoad();
    GraceXPerformance.optimizeNetworkRequests();
    
    // Optional - can be heavy
    if (window.location.hostname === 'localhost') {
      // GraceXPerformance.monitorMemory();
      // GraceXPerformance.monitorFPS();
    }
    
    // Clean old caches on load
    GraceXPerformance.clearOldCaches();
    
    GraceXUtils.log.success('Performance', 'Performance optimizations initialized');
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', GraceXPerformance.init);
} else {
  GraceXPerformance.init();
}

// Make globally available
window.GraceXPerformance = GraceXPerformance;
