/* CallAssist – Speech Helper for Blind & Disabled Users */
/* GRACE-X AI™ HomeSafe – Accessibility (WCAG) */
/* NO DRIFT: CallAssist only */

(function() {
  'use strict';

  var STORAGE_KEY = 'ca_a11y_mode';
  var ANNOUNCE_DELAY = 400;

  function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function setEnabled(on) {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  }

  function speak(text, options) {
    if (!text || !window.speechSynthesis) return;
    var opts = options || {};
    var maxLen = opts.maxLen !== undefined ? opts.maxLen : 300;
    var t = String(text).trim().slice(0, maxLen);
    if (!t) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = opts.lang || 'en-GB';
    u.rate = opts.rate !== undefined ? opts.rate : 0.9;
    u.volume = opts.volume !== undefined ? opts.volume : 1;
    window.speechSynthesis.speak(u);
  }

  function announceToLiveRegion(message) {
    var live = document.getElementById('ca-a11y-live');
    if (live) {
      live.setAttribute('aria-live', 'off');
      live.textContent = '';
      live.setAttribute('aria-live', 'polite');
      live.textContent = message;
    }
  }

  function initAccessibility() {
    if (!isEnabled()) return;

    var live = document.getElementById('ca-a11y-live');
    if (!live) return;

    var pageTitle = document.title || 'CallAssist';
    var h1 = document.querySelector('.ca-header h1, h1');
    var heading = h1 ? h1.textContent : 'CallAssist';
    var nav = document.querySelector('.ca-nav');
    var navText = nav ? 'Navigation: Prep, On-Call, Wrap, Home. ' : '';
    speak(pageTitle + '. ' + heading + '. ' + navText, { maxLen: 200 });
    announceToLiveRegion(heading + '. ' + navText);
  }

  function setupA11yToggle() {
    var btn = document.getElementById('ca-a11y-toggle');
    if (!btn) return;

    function updateLabel() {
      var on = isEnabled();
      btn.textContent = on ? '♿ Accessibility on' : '♿ Accessibility off';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Turn off accessibility mode' : 'Turn on accessibility mode');
    }

    updateLabel();
    btn.addEventListener('click', function() {
      var next = !isEnabled();
      setEnabled(next);
      updateLabel();
      if (next) {
        speak('Accessibility mode on. I will speak page content and GRACE replies.', { maxLen: 80 });
        initAccessibility();
      } else {
        speak('Accessibility mode off.');
      }
    });
  }

  function wireFocusAnnounce() {
    if (!isEnabled()) return;
    var focusables = document.querySelectorAll(
      '.ca-nav a, .ca-btn, .ca-brain-mic-btn, .ca-brain-input-row input, button, [role="button"], select, textarea'
    );
    focusables.forEach(function(el) {
      el.addEventListener('focus', function() {
        if (!isEnabled()) return;
        var label = el.getAttribute('aria-label') || el.title || el.textContent || '';
        if (label && label.trim().length > 0 && label.trim().length < 80) {
          setTimeout(function() { speak(label.trim(), { maxLen: 60 }); }, 100);
        }
      });
    });
  }

  function onA11yMessage(text) {
    if (isEnabled() && text && window.speechSynthesis) {
      speak(String(text).trim(), { maxLen: 500, rate: 0.9 });
    }
  }

  window.CallAssistA11y = {
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    speak: speak,
    announceToLiveRegion: announceToLiveRegion,
    onA11yMessage: onA11yMessage,
    init: function() {
      setupA11yToggle();
      if (isEnabled()) {
        setTimeout(initAccessibility, 300);
        setTimeout(wireFocusAnnounce, 500);
      }
    }
  };

  function onReady() {
    var live = document.createElement('div');
    live.id = 'ca-a11y-live';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.className = 'sr-only';
    live.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    document.body.appendChild(live);
    window.CallAssistA11y.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
