// assets/js/router.js
// GRACE-X SPA Router v2.1
// BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP
// PATCHED: ES module consistency, cache busting, module preloading

const Router = (() => {
  const VERSION = '2.1.0';
  const SCRIPT_VERSION = '6.3';
  
  const getView = () => document.getElementById('view');
  const loadedScripts = {};
  const moduleCache = {}; // Cache for preloaded modules
  let isInitialized = false;

  // Show loading animation
  function showLoading(view) {
    view.innerHTML = `
      <div class="module-loading" style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:16px;">
        <div class="loading-spinner" style="width:48px;height:48px;border:4px solid rgba(102,126,234,0.2);border-top-color:#667eea;border-radius:50%;animation:spin 1s linear infinite;"></div>
        <p style="color:#a0aec0;font-size:14px;">Loading module...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
    `;
  }

  // Preload modules in background for faster switching
  async function preloadModule(moduleId) {
    if (moduleCache[moduleId]) return;
    try {
      const res = await fetch('modules/' + moduleId + '.html');
      if (res.ok) {
        moduleCache[moduleId] = await res.text();
        console.log('[Router] Preloaded module:', moduleId);
      }
    } catch (e) {
      // Silent fail for preload
    }
  }

  // Preload common modules after initial load
  function preloadCommonModules() {
    const common = ['builder', 'uplift', 'chef', 'fit', 'sport', 'forge'];
    common.forEach((m, i) => setTimeout(() => preloadModule(m), 1000 + (i * 500)));
  }

  async function load(id) {
    const view = getView();
    if (!view) {
      console.warn('[Router] View container not found');
      return;
    }
    const moduleId = id || 'core';

    // Show loading animation
    showLoading(view);

    try {
      // Use cached HTML if available
      let html = moduleCache[moduleId];
      if (!html) {
        const res = await fetch('modules/' + moduleId + '.html?v=' + SCRIPT_VERSION);
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        html = await res.text();
        moduleCache[moduleId] = html; // Cache for future use
      }
      view.innerHTML = html;

      // Dynamically load module script on first use so its logic & buttons wire up
      // PATCHED: Added version cache-busting
      const scriptName = 'assets/js/' + moduleId + '.js?v=' + SCRIPT_VERSION;
      
      // Core JS is already loaded via index.html, so skip dynamic load for core.
      // Also skip if already loaded
      if (moduleId === 'sport' && window.GRACEX_Sport) {
        loadedScripts[moduleId] = true;
      }
      if (moduleId !== 'core' && !loadedScripts[moduleId]) {
        const s = document.createElement('script');
        s.src = scriptName;
        s.async = false;
        s.onload = () => {
          console.info('[Router] Loaded script for module:', moduleId);
          loadedScripts[moduleId] = true;
        };
        s.onerror = (e) => {
          console.warn('[Router] Failed to load script:', scriptName, e);
        };
        document.body.appendChild(s);
      }

      // Dispatch event so modules can self-initialise (Builder, Fit, etc.)
      try {
        const event = new CustomEvent('gracex:module:loaded', {
          detail: {
            module: moduleId,
            url: 'modules/' + moduleId + '.html',
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(event);
        console.log('[Router] Dispatched module:loaded event for:', moduleId);
      } catch (e) {
        console.warn('[Router] Failed to dispatch module load event:', e);
      }

      // Highlight active module button
      document.querySelectorAll('.module-btn').forEach(btn => {
        const btnId = btn.dataset.module;
        if (!btnId) return;
        btn.classList.toggle('active', btnId === moduleId);
      });

      // Track module visit in brain state if available
      if (window.GraceX && window.GraceX.trackModuleVisit) {
        GraceX.trackModuleVisit(moduleId);
      }

    } catch (err) {
      console.error('[Router] Failed to load module:', moduleId, err);
      view.innerHTML = `
        <div class="module-section" style="padding:40px;text-align:center;">
          <h1 style="color:#ef4444;">Module Failed to Load</h1>
          <p style="color:#888;margin:16px 0;">Could not load module <code style="background:#1a1a2e;padding:4px 8px;border-radius:4px;">${moduleId}</code></p>
          <button onclick="location.hash='#/core'" style="margin-top:16px;padding:12px 24px;background:#667eea;border:none;border-radius:8px;color:white;cursor:pointer;">Return to Core</button>
        </div>`;
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const moduleId = hash || 'core';
    console.log('[Router] Hash changed to:', moduleId);
    load(moduleId);
  }

  function init() {
    // PATCHED: Guard against double initialization
    if (isInitialized) {
      console.warn('[Router] Already initialized, skipping');
      return;
    }
    isInitialized = true;
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    // Preload common modules after initial load
    setTimeout(preloadCommonModules, 2000);
    
    // Back/forward navigation support
    window.addEventListener('popstate', handleHashChange);
    
    console.info('[Router] v' + VERSION + ' initialized (BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP)');
  }

  // Navigate to module (updates URL)
  function navigate(moduleId) {
    window.location.hash = '#/' + moduleId;
  }

  // Get currently loaded module
  function getCurrentModule() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'core';
  }

  // Check if a module is loaded
  function isModuleLoaded(moduleId) {
    return !!loadedScripts[moduleId] || moduleId === 'core';
  }

  // Clear module cache (useful for development)
  function clearCache() {
    Object.keys(moduleCache).forEach(k => delete moduleCache[k]);
    console.log('[Router] Cache cleared');
  }

  return { 
    init, 
    load, 
    navigate, 
    preloadModule,
    getCurrentModule,
    isModuleLoaded,
    clearCache,
    version: VERSION
  };
})();

// PATCHED: Also assign to window for non-ES-module access
window.GRACEX_Router = Router;

export default Router;
