/**
 * GRACE-X System Help Overlay v2.0
 * Full-screen guided help with voice narration
 * Voice: Google UK English Female, rate 1.10, pitch 1.15
 * © 2026 Zachary Charles Anthony Crockett
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'gracex_help_seen';
  const STORAGE_DONT_SHOW = 'gracex_help_dont_show_again';

  let overlayEl = null;
  let currentStep = 0;
  let isNarrating = false;

  // ============================================
  // HELP SECTIONS — content + voice narration
  // ============================================
  const HELP_SECTIONS = [
    {
      id: 'welcome',
      icon: '🦁',
      title: 'Welcome to GRACE-X AI',
      content: [
        'GRACE-X AI is a modular AI ecosystem engineered by Zac Crockett.',
        'It contains 18 operational modules covering construction, wellbeing, security, sport, finance, and more.',
        'This guide will walk you through everything you need to know.'
      ],
      narration: 'Welcome to GRACE-X AI. I am Grace, your system guide. This is a modular AI ecosystem with eighteen operational modules. Let me walk you through the essentials.'
    },
    {
      id: 'navigation',
      icon: '📋',
      title: 'Navigation',
      content: [
        'The <strong>left sidebar</strong> lists every module. Click any button to switch.',
        'Click the <strong>☰ menu icon</strong> (top-left) to collapse or expand the sidebar.',
        'Modules include: Core, Builder, SiteOps, Sport, Guardian, Forge, Gallery, and more.',
        'Your current module is highlighted. Each module has its own AI assistant and tools.'
      ],
      narration: 'Use the left sidebar to navigate between modules. Click any module button to switch. The menu icon at the top left collapses the sidebar. Each module has its own assistant and tools.'
    },
    {
      id: 'voice',
      icon: '🎤',
      title: 'Voice Control',
      content: [
        'Tap <strong>"Tap to enable voice"</strong> in the bottom-right corner to activate the microphone.',
        'Say <strong>"Hey Grace"</strong>, <strong>"Yo Grace"</strong>, or <strong>"Gracie Grace"</strong> to start a conversation.',
        'In any module, use the <strong>🎙️ microphone button</strong> next to the chat box for voice input.',
        'Grace speaks back using a UK English female voice. Use the <strong>🔊 speaker button</strong> to toggle voice output.',
        'Right-click the speaker button to access voice settings and presets.'
      ],
      narration: 'You can control Grace with your voice. Tap the voice button in the bottom right to enable the microphone. Then say Hey Grace to start talking. I will respond using this voice. Use the speaker button to toggle my voice output on or off.'
    },
    {
      id: 'chat',
      icon: '💬',
      title: 'Chat and AI',
      content: [
        'Every module has a <strong>chat box</strong>. Type your message and press Enter or click Ask.',
        'Grace responds with context-aware answers based on the active module.',
        'The AI uses a 5-layer brain system: local keyword matching, routing, memory, analytics, and Level 5 cloud API.',
        'If the backend server is running with an API key configured, responses come from the full AI. Otherwise, Grace uses the local brain.'
      ],
      narration: 'Each module has a chat box. Type your message and press Enter. I respond with context based on which module you are in. When the backend server is running with an API key, I use the full cloud AI. Otherwise, I fall back to the local brain.'
    },
    {
      id: 'modules-core',
      icon: '🧠',
      title: 'Core Modules',
      content: [
        '<strong>Core</strong> — The main command centre. Voice assistant, connectivity hub, system diagnostics.',
        '<strong>Core 2.0</strong> — Advanced AI command centre with weather, news, and real-time system stats.',
        '<strong>Dashboard</strong> — Module status overview, system health, and quick navigation.'
      ],
      narration: 'The core modules are your command centre. Core gives you voice control and diagnostics. Core 2 point 0 adds weather, news, and real-time stats. The dashboard shows system health at a glance.'
    },
    {
      id: 'modules-work',
      icon: '🔨',
      title: 'Work Modules',
      content: [
        '<strong>Builder</strong> — Construction planning, measurements, RAMS, scope packs, PDF and Excel exports.',
        '<strong>SiteOps</strong> — Multi-trade project control, programme management, compliance tracking, reporting.',
        '<strong>TradeLink</strong> — Job briefing, trade coordination, quoting support.',
        '<strong>Accounting</strong> — Financial management, invoicing, expense tracking.',
        '<strong>Forge</strong> — Desktop file operations, project export, Android packaging.'
      ],
      narration: 'The work modules cover construction and business. Builder handles planning and measurements. Site Ops manages multi-trade projects. Trade Link coordinates jobs. Accounting tracks finances. Forge handles file operations and exports.'
    },
    {
      id: 'modules-life',
      icon: '💚',
      title: 'Wellbeing and Lifestyle',
      content: [
        '<strong>Uplift</strong> — Mental health support, crisis de-escalation, emotional wellbeing. Safety-critical module.',
        '<strong>Fit</strong> — Fitness tracking, workout plans, exercise guidance.',
        '<strong>Yoga</strong> — Guided yoga sessions, breathing exercises, mindfulness.',
        '<strong>Chef</strong> — Recipe suggestions, meal planning, cooking guidance.',
        '<strong>Beauty</strong> — Skincare routines, beauty tips, product recommendations.',
        '<strong>Family</strong> — Family management, scheduling, activities.'
      ],
      narration: 'The wellbeing modules support your daily life. Uplift provides mental health support and crisis de-escalation. Fit and Yoga handle fitness and mindfulness. Chef helps with cooking. Beauty and Family round out the lifestyle tools.'
    },
    {
      id: 'modules-pro',
      icon: '🛡️',
      title: 'Professional Modules',
      content: [
        '<strong>Guardian</strong> — Security monitoring, threat detection, family safety alerts.',
        '<strong>OSINT</strong> — Open source intelligence gathering, research methodology.',
        '<strong>Sport</strong> — Betting analysis, live scores, fixture tracking, multi-sport coverage.',
        '<strong>Gamer</strong> — Gaming mode with performance tools.',
        '<strong>Artist</strong> — Creative tools and artistic guidance.',
        '<strong>Gallery</strong> — Media browser for images and videos.'
      ],
      narration: 'The professional modules include Guardian for security, OSINT for intelligence research, Sport for betting analysis and live scores, and Gallery for browsing your media files.'
    },
    {
      id: 'themes',
      icon: '🎨',
      title: 'Themes and Appearance',
      content: [
        'Click the <strong>🎨 palette button</strong> in the bottom-right toolbar to change themes.',
        'Available themes include: <strong>Titan</strong> (default dark), <strong>Forge</strong> (blue industrial), <strong>Venus</strong> (glassmorphism), and more.',
        'Themes change the entire look and feel instantly. Your choice is saved.'
      ],
      narration: 'You can change the appearance using the palette button in the bottom right. Themes include Titan, Forge, and Venus. Your choice is saved automatically.'
    },
    {
      id: 'setup',
      icon: '⚙️',
      title: 'Setup and Configuration',
      content: [
        '<strong>Local:</strong> Run START.bat on Windows or START.sh on Mac and Linux. The backend starts on port 3000, frontend on port 8080.',
        '<strong>API Keys:</strong> Copy server/env.example.txt to server/.env and add your LLM provider key (OpenAI, Anthropic, or OpenRouter).',
        '<strong>Account:</strong> Click Login in the sidebar to create an account. This enables cloud persistence for Builder and SiteOps data.',
        '<strong>Deployment:</strong> Push to GitHub and connect to Render.com. Build command: npm run build. Start command: npm start.'
      ],
      narration: 'To set up locally, run the start script. The backend starts on port 3000. Copy the environment example file to dot env and add your API key. You can create an account for cloud persistence. For deployment, push to GitHub and connect to Render.'
    },
    {
      id: 'shortcuts',
      icon: '⌨️',
      title: 'Tips and Shortcuts',
      content: [
        'Press <strong>Enter</strong> in any chat box to send your message.',
        'Use the <strong>Export</strong> button in modules to download data as PDF or Excel.',
        'In the Gallery, use <strong>arrow keys</strong> to navigate and <strong>Escape</strong> to close the viewer.',
        'The system auto-saves your work. Builder and SiteOps sync to the backend when logged in.',
        'If something goes wrong, check the <strong>browser console</strong> (F12) for diagnostics.'
      ],
      narration: 'A few tips. Press Enter to send messages. Use export buttons for PDF and Excel downloads. Arrow keys navigate the gallery. The system auto-saves your work. If something goes wrong, check the browser console for diagnostics.'
    }
  ];

  // ============================================
  // VOICE NARRATION
  // ============================================
  function narrate(text) {
    if (!text) return Promise.resolve();
    if (!window.speechSynthesis) return Promise.resolve();

    return new Promise(function(resolve) {
      // Cancel any ongoing narration
      window.speechSynthesis.cancel();

      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 1.10;
      utterance.pitch = 1.15;
      utterance.volume = 0.92;

      // Find Google UK English Female voice
      var voices = window.speechSynthesis.getVoices();
      var preferred = null;
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === 'Google UK English Female') {
          preferred = voices[i];
          break;
        }
      }
      if (!preferred) {
        for (var j = 0; j < voices.length; j++) {
          if (voices[j].lang === 'en-GB' && voices[j].name.toLowerCase().indexOf('female') !== -1) {
            preferred = voices[j];
            break;
          }
        }
      }
      if (!preferred) {
        for (var k = 0; k < voices.length; k++) {
          if (voices[k].lang.indexOf('en-GB') === 0) {
            preferred = voices[k];
            break;
          }
        }
      }
      if (preferred) utterance.voice = preferred;

      isNarrating = true;
      utterance.onend = function() { isNarrating = false; resolve(); };
      utterance.onerror = function() { isNarrating = false; resolve(); };

      window.speechSynthesis.speak(utterance);
    });
  }

  function stopNarration() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isNarrating = false;
  }

  // ============================================
  // BUILD OVERLAY
  // ============================================
  function createOverlay() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.id = 'gracex-help-overlay';
    overlayEl.setAttribute('aria-label', 'Help');
    overlayEl.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(14px);' +
      'z-index:99996;display:none;align-items:center;justify-content:center;padding:24px;' +
      'box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
      'color:#f1f5f9;overflow-y:auto;';

    var cardStyle =
      'background:linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.95));' +
      'border:1px solid rgba(148,163,184,0.2);border-radius:20px;max-width:640px;width:100%;' +
      'max-height:90vh;overflow-y:auto;padding:32px;box-shadow:0 25px 80px rgba(0,0,0,0.5);';

    overlayEl.innerHTML =
      '<div class="gracex-help-card" style="' + cardStyle + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">' +
          '<h1 style="margin:0;font-size:1.75rem;background:linear-gradient(135deg,#06b6d4,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">' +
            '🦁 GRACE-X Help' +
          '</h1>' +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" id="gracex-help-voice-toggle" title="Toggle voice narration" style="' +
              'background:rgba(6,182,212,0.2);border:1px solid rgba(6,182,212,0.4);color:#06b6d4;' +
              'font-size:1.1rem;width:40px;height:40px;border-radius:10px;cursor:pointer;padding:0;">🔊</button>' +
            '<button type="button" id="gracex-help-close" title="Close" style="' +
              'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#94a3b8;' +
              'font-size:1.5rem;width:40px;height:40px;border-radius:10px;cursor:pointer;line-height:1;padding:0;">×</button>' +
          '</div>' +
        '</div>' +
        '<div id="gracex-help-progress" style="display:flex;gap:4px;margin-bottom:20px;"></div>' +
        '<div id="gracex-help-body"></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:28px;">' +
          '<button type="button" id="gracex-help-prev" style="' +
            'padding:12px 20px;font-size:0.95rem;font-weight:600;cursor:pointer;' +
            'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;' +
            'color:#94a3b8;">← Back</button>' +
          '<button type="button" id="gracex-help-next" style="' +
            'padding:12px 24px;font-size:1rem;font-weight:600;cursor:pointer;' +
            'background:linear-gradient(135deg,#06b6d4,#8b5cf6);border:none;border-radius:12px;' +
            'color:white;box-shadow:0 4px 20px rgba(6,182,212,0.4);">Next →</button>' +
          '<button type="button" id="gracex-help-readall" title="Read entire guide aloud" style="' +
            'padding:12px 20px;font-size:0.95rem;font-weight:600;cursor:pointer;' +
            'background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.3);border-radius:12px;' +
            'color:#06b6d4;">🔊 Read All</button>' +
          '<div style="flex:1;"></div>' +
          '<label style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:0.85rem;cursor:pointer;">' +
            '<input type="checkbox" id="gracex-help-dont-show" style="accent-color:#06b6d4;">' +
            "Don't show again" +
          '</label>' +
        '</div>' +
      '</div>';

    // Wire events
    overlayEl.addEventListener('click', function(e) { if (e.target === overlayEl) hide(); });
    overlayEl.querySelector('#gracex-help-close').addEventListener('click', hide);
    overlayEl.querySelector('#gracex-help-prev').addEventListener('click', prevStep);
    overlayEl.querySelector('#gracex-help-next').addEventListener('click', nextStep);
    overlayEl.querySelector('#gracex-help-readall').addEventListener('click', readAll);

    var voiceToggle = overlayEl.querySelector('#gracex-help-voice-toggle');
    var voiceEnabled = true;
    voiceToggle.addEventListener('click', function() {
      voiceEnabled = !voiceEnabled;
      voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
      voiceToggle.style.borderColor = voiceEnabled ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.2)';
      if (!voiceEnabled) stopNarration();
    });

    // Store voiceEnabled getter on overlay
    overlayEl._isVoiceEnabled = function() { return voiceEnabled; };

    document.body.appendChild(overlayEl);
    return overlayEl;
  }

  // ============================================
  // RENDER STEP
  // ============================================
  function renderStep(stepIndex) {
    var section = HELP_SECTIONS[stepIndex];
    if (!section) return;
    currentStep = stepIndex;

    // Progress dots
    var progressEl = overlayEl.querySelector('#gracex-help-progress');
    var dots = '';
    for (var i = 0; i < HELP_SECTIONS.length; i++) {
      var active = i === stepIndex;
      dots += '<div style="width:' + (active ? '24px' : '8px') + ';height:8px;border-radius:4px;' +
        'background:' + (active ? '#06b6d4' : 'rgba(255,255,255,0.15)') + ';' +
        'transition:all 0.3s;cursor:pointer;" data-step="' + i + '"></div>';
    }
    progressEl.innerHTML = dots;
    progressEl.querySelectorAll('[data-step]').forEach(function(dot) {
      dot.addEventListener('click', function() {
        stopNarration();
        renderStep(parseInt(this.getAttribute('data-step')));
      });
    });

    // Body
    var bodyEl = overlayEl.querySelector('#gracex-help-body');
    var html = '<section style="animation:fadeIn 0.3s ease;">';
    html += '<h2 style="font-size:1.2rem;color:#06b6d4;margin:0 0 16px;">' + section.icon + ' ' + section.title + '</h2>';
    html += '<ul style="margin:0;padding-left:20px;color:#cbd5e1;line-height:1.8;">';
    for (var j = 0; j < section.content.length; j++) {
      html += '<li>' + section.content[j] + '</li>';
    }
    html += '</ul></section>';
    html += '<style>@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}</style>';
    bodyEl.innerHTML = html;

    // Update buttons
    var prevBtn = overlayEl.querySelector('#gracex-help-prev');
    var nextBtn = overlayEl.querySelector('#gracex-help-next');
    prevBtn.style.display = stepIndex === 0 ? 'none' : '';
    if (stepIndex === HELP_SECTIONS.length - 1) {
      nextBtn.textContent = 'Got it ✓';
      nextBtn.onclick = function() {
        var dontShow = overlayEl.querySelector('#gracex-help-dont-show').checked;
        if (dontShow) try { localStorage.setItem(STORAGE_DONT_SHOW, 'true'); } catch (e) {}
        hide();
      };
    } else {
      nextBtn.textContent = 'Next →';
      nextBtn.onclick = nextStep;
    }

    // Auto-narrate if voice enabled
    if (overlayEl._isVoiceEnabled()) {
      narrate(section.narration);
    }
  }

  function nextStep() {
    stopNarration();
    if (currentStep < HELP_SECTIONS.length - 1) {
      renderStep(currentStep + 1);
    } else {
      hide();
    }
  }

  function prevStep() {
    stopNarration();
    if (currentStep > 0) {
      renderStep(currentStep - 1);
    }
  }

  // Read all sections aloud sequentially
  async function readAll() {
    stopNarration();
    for (var i = 0; i < HELP_SECTIONS.length; i++) {
      renderStep(i);
      await narrate(HELP_SECTIONS[i].narration);
      // Brief pause between sections
      await new Promise(function(r) { setTimeout(r, 600); });
    }
  }

  // ============================================
  // SHOW / HIDE
  // ============================================
  function show() {
    createOverlay();
    currentStep = 0;
    overlayEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderStep(0);
  }

  function hide() {
    stopNarration();
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

  // ============================================
  // PUBLIC API
  // ============================================
  window.GRACEX_HelpOverlay = {
    show: show,
    hide: hide,
    showOnceIfFirstVisit: showOnceIfFirstVisit
  };

  document.addEventListener('DOMContentLoaded', function() {
    var helpBtn = document.getElementById('gracex-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', show);

    // Preload voices for narration
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', function() {
        window.speechSynthesis.getVoices();
      });
    }
  });

  window.addEventListener('gracex:boot-complete', function() {
    showOnceIfFirstVisit();
  });
})();
