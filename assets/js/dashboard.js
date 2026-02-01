/**
 * GRACE-X Dashboard - Module Discovery Interface
 */

(function() {
  'use strict';

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  function init() {
    console.log('[DASHBOARD] Initializing module discovery...');
    
    // Fetch live metrics
    fetchLiveMetrics();
    
    // Set up search
    setupSearch();
    
    // Set up filters
    setupFilters();
    
    // Set up module click handlers
    setupModuleHandlers();
    
    // Auto-refresh metrics every 30 seconds
    setInterval(fetchLiveMetrics, 30000);
    
    console.log('[DASHBOARD] ✅ Ready');
  }

  // ============================================================================
  // LIVE METRICS
  // ============================================================================
  
  async function fetchLiveMetrics() {
    try {
      const response = await fetch('http://localhost:3000/api/system/status');
      
      if (!response.ok) {
        throw new Error('Backend offline');
      }
      
      const data = await response.json();
      
      // Update stats
      document.getElementById('stat-modules').textContent = data.modules.total;
      document.getElementById('stat-wired').textContent = `${data.modules.wired}/${data.modules.total}`;
      document.getElementById('stat-commercial').textContent = data.modules.commercial;
      
      // Format uptime
      const hours = Math.floor(data.uptime / 3600);
      const minutes = Math.floor((data.uptime % 3600) / 60);
      document.getElementById('stat-uptime').textContent = `${hours}h ${minutes}m`;
      
    } catch (error) {
      console.error('[DASHBOARD] Failed to fetch metrics:', error);
      document.getElementById('stat-uptime').textContent = 'Offline';
    }
  }

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================
  
  function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('.module-card');
      
      cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.module-description').textContent.toLowerCase();
        const capabilities = Array.from(card.querySelectorAll('.capability-tag'))
          .map(tag => tag.textContent.toLowerCase())
          .join(' ');
        
        const matches = name.includes(query) || 
                       description.includes(query) || 
                       capabilities.includes(query);
        
        card.style.display = matches ? 'block' : 'none';
      });
    });
  }

  // ============================================================================
  // FILTER FUNCTIONALITY
  // ============================================================================
  
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.module-card');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        
        // Get filter type
        const filter = btn.dataset.filter;
        
        // Apply filter
        cards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'block';
          } else if (filter === 'commercial') {
            card.style.display = card.classList.contains('commercial') ? 'block' : 'none';
          } else if (filter === 'lifestyle') {
            card.style.display = card.classList.contains('lifestyle') ? 'block' : 'none';
          } else if (filter === 'production') {
            const isProduction = card.querySelector('.status-indicator.production');
            card.style.display = isProduction ? 'block' : 'none';
          } else if (filter === 'core') {
            card.style.display = card.classList.contains('core') ? 'block' : 'none';
          }
        });
      });
    });
  }

  // ============================================================================
  // MODULE CLICK HANDLERS
  // ============================================================================
  
  function setupModuleHandlers() {
    const cards = document.querySelectorAll('.module-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const moduleName = card.dataset.module;
        
        // Open module in parent window if available
        if (window.opener) {
          window.opener.postMessage({
            type: 'navigate',
            module: moduleName
          }, '*');
          console.log(`[DASHBOARD] Navigate to ${moduleName} module`);
        } else {
          // Fallback: redirect this window
          window.location.href = `http://localhost:8080/?module=${moduleName}`;
        }
      });
    });
  }

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================
  
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
    
    // ESC = Clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('search-input');
      if (searchInput === document.activeElement) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  });

  // ============================================================================
  // AUTO-INIT
  // ============================================================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[DASHBOARD] Module discovery loaded');

})();
