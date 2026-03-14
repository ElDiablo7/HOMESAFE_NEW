/* =========================================
   GRACE-X FIREWALL v1.1 (non-blocking)
   - Waits for GRACEX_TTS to exist before enforcing
   - Keeps TTS ON unless user explicitly disabled it
========================================= */
(function () {
  if (window.GRACEX_FIREWALL) return;

  const FIREWALL = {
    enabled: true,
    enforced: false,
    maxWaitMs: 8000,
    pollMs: 100,

    enforceOnce() {
      if (!this.enabled || this.enforced) return true;

      const tts = window.GRACEX_TTS;
      if (!tts) return false;

      // If user hasn't explicitly disabled, keep it enabled
      try {
        const savedEnabled = localStorage.getItem('gracex_tts_enabled');
        if (savedEnabled === null || savedEnabled === 'true') {
          tts.enable?.();
        }
      } catch (e) {}

      // If available, lock settings to prevent mid-session overrides
      try { tts.lockSettings?.(); } catch (e) {}

      this.enforced = true;
      console.info('[GRACEX FIREWALL] ✓ Enforced (TTS protected)');
      return true;
    },

    start() {
      const start = Date.now();
      const timer = setInterval(() => {
        const ok = this.enforceOnce();
        if (ok) return clearInterval(timer);
        if (Date.now() - start > this.maxWaitMs) {
          clearInterval(timer);
          console.warn('[GRACEX FIREWALL] Timed out waiting for GRACEX_TTS (non-fatal)');
        }
      }, this.pollMs);
    }
  };

  window.GRACEX_FIREWALL = FIREWALL;
  FIREWALL.start();
})();
