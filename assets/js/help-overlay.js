/**
 * GRACE-X System Help Overlay
 * Full-screen help for new users – sidebar, voice, modules, theme
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'gracex_help_seen';
  const STORAGE_DONT_SHOW = 'gracex_help_dont_show_again';

  let overlayEl = null;

  function createOverlay() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.id = 'gracex-help-overlay';
    overlayEl.setAttribute('aria-label', 'Help');
    overlayEl.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      backdrop-filter: blur(12px);
      z-index: 99996;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #f1f5f9;
      overflow-y: auto;
    `;

    overlayEl.innerHTML = `
      <div class="gracex-help-card" style="
        background: linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95));
        border: 1px solid rgba(148,163,184,0.2);
        border-radius: 20px;
        max-width: 560px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 32px;
        box-shadow: 0 25px 80px rgba(0,0,0,0.5);
      ">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 1.75rem; background: linear-gradient(135deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            🦁 GRACE-X Help
          </h1>
          <button type="button" id="gracex-help-close" style="
            background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
            color: #94a3b8; font-size: 1.5rem; width: 40px; height: 40px; border-radius: 10px;
            cursor: pointer; line-height: 1; padding: 0;
          " title="Close">×</button>
        </div>

        <p style="color: #94a3b8; margin: 0 0 24px; line-height: 1.6;">
          GRACE-X AI™ is your AI film production suite. Here’s how to get started.
        </p>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 1.1rem; color: #06b6d4; margin: 0 0 12px;">📋 Left menu</h2>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; line-height: 1.7;">
            <li>Use the <strong>buttons</strong> to switch modules (Core, Sport, Forge, etc.).</li>
            <li>Click the <strong>☰</strong> icon (top-left) to hide or show the menu.</li>
            <li>Each module has its own screen and AI assistant.</li>
          </ul>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 1.1rem; color: #06b6d4; margin: 0 0 12px;">🎤 Voice</h2>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; line-height: 1.7;">
            <li>Tap <strong>“Tap to enable voice”</strong> (bottom-right) once to allow the microphone.</li>
            <li>Then say <strong>“Hey Grace”</strong>, <strong>“Yo Grace”</strong>, or <strong>“Gracie Grace”</strong> to talk.</li>
            <li>In any module, use the <strong>🎙️</strong> button next to the chat box for voice input.</li>
          </ul>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 1.1rem; color: #06b6d4; margin: 0 0 12px;">💬 Chat & AI</h2>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; line-height: 1.7;">
            <li>Type in the <strong>text box</strong> and press Enter or click <strong>Ask</strong> to talk to GRACE.</li>
            <li>Each module has a different focus (Sport, Builder, Guardian, etc.).</li>
          </ul>
        </section>

        <section style="margin-bottom: 24px;">
          <h2 style="font-size: 1.1rem; color: #06b6d4; margin: 0 0 12px;">🎨 Theme & settings</h2>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; line-height: 1.7;">
            <li>Click the <strong>🎨</strong> button (bottom-right) to change the look (Titan, Forge, etc.).</li>
            <li>Use the <strong>🔊</strong> button for voice on/off; right-click for voice settings.</li>
          </ul>
        </section>

        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 28px;">
          <button type="button" id="gracex-help-gotit" style="
            padding: 12px 24px; font-size: 1rem; font-weight: 600; cursor: pointer;
            background: linear-gradient(135deg, #06b6d4, #8b5cf6); border: none; border-radius: 12px;
            color: white; box-shadow: 0 4px 20px rgba(6,182,212,0.4);
          ">Got it</button>
          <label style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" id="gracex-help-dont-show" style="accent-color: #06b6d4;">
            Don’t show this again
          </label>
        </div>
      </div>
    `;

    overlayEl.addEventListener('click', function(e) {
      if (e.target === overlayEl) hide();
    });

    overlayEl.querySelector('#gracex-help-close').addEventListener('click', hide);
    overlayEl.querySelector('#gracex-help-gotit').addEventListener('click', function() {
      const dontShow = overlayEl.querySelector('#gracex-help-dont-show').checked;
      if (dontShow) try { localStorage.setItem(STORAGE_DONT_SHOW, 'true'); } catch (e) {}
      hide();
    });

    document.body.appendChild(overlayEl);
    return overlayEl;
  }

  function show() {
    createOverlay();
    overlayEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hide() {
    if (overlayEl) {
      overlayEl.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function showOnceIfFirstVisit() {
    try {
      if (localStorage.getItem(STORAGE_DONT_SHOW) === 'true') return;
      if (localStorage.getItem(STORAGE_KEY) === 'true') return;
      localStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(show, 800);
    } catch (e) {}
  }

  window.GRACEX_HelpOverlay = {
    show,
    hide,
    showOnceIfFirstVisit
  };

  document.addEventListener('DOMContentLoaded', function() {
    var helpBtn = document.getElementById('gracex-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', show);
  });

  window.addEventListener('gracex:boot-complete', function() {
    showOnceIfFirstVisit();
  });
})();
