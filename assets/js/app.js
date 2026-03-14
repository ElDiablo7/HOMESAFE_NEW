// assets/js/app.js
// GRACE-X AI™ Main Application Entry Point v2.1
// BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP
// PATCHED: Initialization guard, enhanced error handling

import Router from './router.js';

// Initialization flag to prevent double-init
let appInitialized = false;

const AudioManager = window.GRACEX_AudioManager; // global (audioManager.js is loaded as normal script)

function modal(id) {
  return document.getElementById(id);
}

function initApp() {
  // PATCHED: Guard against double initialization
  if (appInitialized) {
    console.warn('[GRACEX APP] Already initialized, skipping');
    return;
  }
  appInitialized = true;
  
  console.log('[GRACEX APP] Initializing... (BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP)');
  
  // Wire up module buttons
  document.querySelectorAll('.module-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.module;
      if (id) {
        location.hash = `#/${id}`;
      }
    });
  });
  
  // Audio panel modal (if present)
  const audioBtn = document.getElementById('audioPanelBtn');
  const audioModal = modal('audioModal');
  const closeAudio = document.getElementById('closeAudio');
  
  if (audioBtn && audioModal) {
    audioBtn.addEventListener('click', () => audioModal.classList.add('open'));
  }
  if (closeAudio && audioModal) {
    closeAudio.addEventListener('click', () => audioModal.classList.remove('open'));
  }
  
  // Initialize Router
  try {
    Router.init();
    console.log('[GRACEX APP] Router initialized');
  } catch (e) {
    console.error('[GRACEX APP] Router init failed:', e);
  }
  
  // Initialize AudioManager
  try {
    if (AudioManager && typeof AudioManager.init === 'function') {
      AudioManager.init();
      console.log('[GRACEX APP] AudioManager initialized');
    } else {
      console.warn('[GRACEX APP] AudioManager not available');
    }
  } catch (e) {
    console.error('[GRACEX APP] AudioManager init failed:', e);
  }
  
  // Log successful initialization
  console.log('[GRACEX APP] ✓ Application initialized successfully');
  console.log('[GRACEX APP] Build: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP');
  
  // Dispatch app ready event
  try {
    document.dispatchEvent(new CustomEvent('gracex:app:ready', {
      detail: {
        timestamp: Date.now(),
        version: '2.1.0',
        build: 'ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP'
      }
    }));
  } catch (e) {
    console.warn('[GRACEX APP] Could not dispatch ready event:', e);
  }
}

// Initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', initApp);

// Fallback: If DOM already loaded
if (document.readyState !== 'loading') {
  // Use setTimeout to ensure other scripts have loaded
  setTimeout(initApp, 0);
}

// Export for external access
window.GRACEX_APP = {
  version: '2.1.0',
  build: 'ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP',
  isInitialized: () => appInitialized,
  reinit: () => {
    appInitialized = false;
    initApp();
  }
};
