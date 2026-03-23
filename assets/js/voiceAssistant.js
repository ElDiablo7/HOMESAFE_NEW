// GRACE-X Voice Assistant with Wake Word
// "Ok Gracie" activates listening mode
// Extended listening duration for natural conversation
// ------------------------------

(function () {
  if (window.GRACEX_VoiceAssistant) {
    return;
  }

  // Microphone requires secure context (HTTPS or localhost)
  if (!window.isSecureContext) {
    console.warn('[GRACEX VOICE ASSISTANT] Microphone requires HTTPS or localhost');
    window.GRACEX_VoiceAssistant = { isSupported: false };
    return;
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    console.warn('[GRACEX VOICE ASSISTANT] getUserMedia not available');
    window.GRACEX_VoiceAssistant = { isSupported: false };
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('[GRACEX VOICE ASSISTANT] Speech recognition not supported');
    window.GRACEX_VoiceAssistant = { isSupported: false };
    return;
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    // Wake words - includes both "Grace" and "Gracie" variants
    wakeWords: [
      'ok grace', 'okay grace', 'hey grace', 'oi grace', 'yo grace',
      'ok gracie', 'okay gracie', 'hey gracie', 'hi gracie', 'gracie grace',
    ],
    language: 'en-GB',
    // How long to listen after wake word (milliseconds)
    activeListenDuration: 8000, // 8 seconds
    // How long to wait for speech before timing out
    silenceTimeout: 1500, // 1.5 seconds of silence (makes interactions snappier)
    // Continuous background listening for wake word
    backgroundListening: true,
    // Automated follow-up after TTS
    followUpMode: true
  };

  // ============================================
  // STATE
  // ============================================

  let isListening = false;
  let isActiveMode = false;
  let wakeWordRecognizer = null;
  let commandRecognizer = null;
  let activeTimeout = null;
  let silenceTimer = null;
  let statusIndicator = null;
  let lastWakeTime = 0;
  const WAKE_COOLDOWN_MS = 2500; // stops wake spam / repeated triggers

  // ============================================
  // UNIVERSAL VOICE ORB COMPONENT (ChatGPT Style)
  // ============================================

  function createStatusIndicator() {
    if (document.getElementById('gracex-voice-orb-container')) {
      return document.getElementById('gracex-voice-orb-container');
    }

    const container = document.createElement('div');
    container.id = 'gracex-voice-orb-container';
    
    // Inject the premium CSS exactly once
    if (!document.getElementById('gracex-orb-styles')) {
        const style = document.createElement('style');
        style.id = 'gracex-orb-styles';
        style.textContent = `
            #gracex-voice-orb-container {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: none; /* Let clicks pass through background */
            }

            .gracex-orb-wrapper {
                position: relative;
                width: 60px;
                height: 60px;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: auto;
                cursor: pointer;
                border-radius: 50%;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .gracex-orb-wrapper:hover {
                transform: scale(1.05);
            }

            .gracex-orb-main {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                transition: all 0.4s ease;
            }

            /* Inner Glow Layer */
            .gracex-orb-glow {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                opacity: 0.5;
                transition: all 0.5s ease;
            }

            /* Microphone Icon */
            .gracex-orb-icon {
                font-size: 24px;
                color: #fff;
                z-index: 2;
                transition: opacity 0.3s ease;
                text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            }

            /* Text Label */
            #gracex-orb-label {
                margin-top: 15px;
                font-family: inherit;
                font-size: 13px;
                font-weight: 500;
                color: rgba(255,255,255,0.8);
                background: rgba(0,0,0,0.4);
                padding: 4px 12px;
                border-radius: 20px;
                backdrop-filter: blur(4px);
                pointer-events: none;
                transition: opacity 0.3s;
                opacity: 0;
            }

            /* --- ORB STATES --- */
            
            /* Hidden */
            .orb-hidden { opacity: 0; transform: translateY(20px) scale(0.8); }

            /* Default / Idle (Soft white/blue breathing) */
            .gracex-orb-wrapper.state-idle .gracex-orb-main {
                background: rgba(30, 40, 60, 0.4);
                border-color: rgba(100, 150, 255, 0.3);
            }
            .gracex-orb-wrapper.state-idle .gracex-orb-glow {
                background: radial-gradient(circle, rgba(100,150,255,0.4) 0%, transparent 70%);
                animation: orb-breathe 4s infinite ease-in-out;
            }

            /* Listening (ChatGPT style liquid/expanding morphing) */
            .gracex-orb-wrapper.state-listening .gracex-orb-main {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.5);
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
                animation: orb-morph 3s infinite alternate ease-in-out;
            }
            .gracex-orb-wrapper.state-listening .gracex-orb-glow {
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(100,150,255,0.4) 50%, transparent 80%);
                animation: orb-pulse-fast 1.5s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
            }
            .gracex-orb-wrapper.state-listening .gracex-orb-icon { opacity: 0; }

            /* Processing (Yellow/Orange spinning glow) */
            .gracex-orb-wrapper.state-processing .gracex-orb-main {
                background: rgba(200, 100, 0, 0.2);
                border-color: rgba(255, 150, 0, 0.5);
            }
            .gracex-orb-wrapper.state-processing .gracex-orb-glow {
                background: conic-gradient(from 0deg, transparent, rgba(255, 150, 0, 0.8), transparent);
                animation: orb-spin 1s linear infinite;
            }
            .gracex-orb-wrapper.state-processing .gracex-orb-icon { opacity: 0; }

            /* Speaking (Cyan waveform vibe) */
            .gracex-orb-wrapper.state-speaking .gracex-orb-main {
                background: rgba(0, 200, 255, 0.15);
                border-color: rgba(0, 255, 255, 0.5);
                box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);
            }
            .gracex-orb-wrapper.state-speaking .gracex-orb-glow {
                background: radial-gradient(circle, rgba(0,255,255,0.6) 0%, transparent 70%);
                animation: orb-waveform 0.4s infinite alternate ease-in-out;
            }
            .gracex-orb-wrapper.state-speaking .gracex-orb-icon { opacity: 0; }

            /* Keyframes */
            @keyframes orb-breathe {
                0%, 100% { transform: scale(0.9); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.6; }
            }
            @keyframes orb-pulse-fast {
                0% { transform: scale(0.9); opacity: 0.6; }
                100% { transform: scale(1.3); opacity: 1; }
            }
            @keyframes orb-spin {
                0% { transform: rotate(0deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1.2); }
            }
            @keyframes orb-waveform {
                0% { transform: scale(0.8); opacity: 0.5; }
                100% { transform: scale(1.4); opacity: 0.9; }
            }
            @keyframes orb-morph {
                0% { border-radius: 50%; }
                25% { border-radius: 45% 55% 40% 60%; }
                50% { border-radius: 60% 40% 55% 45%; }
                75% { border-radius: 50% 60% 45% 55%; }
                100% { border-radius: 50%; }
            }

        `;
        document.head.appendChild(style);
    }

    container.innerHTML = `
      <div id="gracex-orb-wrapper" class="gracex-orb-wrapper orb-hidden">
        <div class="gracex-orb-main">
            <div class="gracex-orb-glow"></div>
            <div class="gracex-orb-icon">🎤</div>
        </div>
      </div>
      <div id="gracex-orb-label">Tap to Speak</div>
    `;

    // Click to interrupt / tap to speak
    const wrapper = container.querySelector('#gracex-orb-wrapper');
    wrapper.addEventListener('click', () => {
        if (isActiveMode) {
            endActiveListening(); // stop listening manually
        } else if (wrapper.classList.contains('state-processing')) {
            // Can't interrupt processing easily, ignore
        } else {
            manualActivate(); // explicit trigger
        }
    });

    document.body.appendChild(container);
    statusIndicator = container;
    return container;
  }

  function updateStatus(state, message) {
    if (!statusIndicator) {
      statusIndicator = createStatusIndicator();
    }

    const wrapper = document.getElementById('gracex-orb-wrapper');
    const label = document.getElementById('gracex-orb-label');

    // Show orb slightly transparent if wake mode, fully visible if active
    wrapper.classList.remove('orb-hidden', 'state-idle', 'state-listening', 'state-processing', 'state-speaking');

    switch (state) {
      case 'wake':
        wrapper.classList.add('state-idle');
        label.textContent = message || 'Say "Ok Gracie"';
        label.style.opacity = '1';
        break;
      case 'active':
        wrapper.classList.add('state-listening');
        label.textContent = message || 'Listening...';
        label.style.opacity = '1';
        break;
      case 'processing':
        wrapper.classList.add('state-processing');
        label.textContent = message || 'Thinking...';
        label.style.opacity = '1';
        break;
      case 'speaking':
        wrapper.classList.add('state-speaking');
        label.style.opacity = '0'; // Hide text when speaking
        break;
      case 'hidden':
      default:
        wrapper.classList.add('orb-hidden');
        label.style.opacity = '0';
        break;
    }
  }

  // ============================================
  // WAKE WORD DETECTION
  // ============================================

  function initWakeWordListener() {
    if (wakeWordRecognizer) {
      try { wakeWordRecognizer.stop(); } catch (e) { }
    }

    wakeWordRecognizer = new SpeechRecognition();
    wakeWordRecognizer.continuous = true;
    wakeWordRecognizer.interimResults = true;
    wakeWordRecognizer.lang = CONFIG.language;
    wakeWordRecognizer.maxAlternatives = 3;

    wakeWordRecognizer.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Only act on FINAL results to stop log spam + glitch loops
        if (!event.results[i].isFinal) continue;

        const transcript = (event.results[i][0].transcript || '').toLowerCase().trim();

        const wakeWordDetected = CONFIG.wakeWords.some(wake =>
          transcript.includes(wake)
        );

        // Cooldown prevents repeated triggers from one phrase
        const now = Date.now();
        if (wakeWordDetected && !isActiveMode && (now - lastWakeTime) > WAKE_COOLDOWN_MS) {
          lastWakeTime = now;
          console.log('[GRACEX VOICE] Wake word detected:', transcript);

          // Stop wake word listener before speaking/active mode
          try { wakeWordRecognizer.stop(); } catch (e) { }

          const go = () => startActiveListening();

          // Don't speak over listening — keep ack short
          if (window.GRACEX_TTS && typeof window.GRACEX_TTS.isEnabled === 'function' && window.GRACEX_TTS.isEnabled()) {
            if (typeof window.GRACEX_TTS.stop === 'function') window.GRACEX_TTS.stop();
            window.GRACEX_TTS.speak("Yes?").then(go).catch(go);
          } else {
            go();
          }
          return;
        }
      }
    };

    wakeWordRecognizer.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[GRACEX VOICE] Wake word error:', event.error);
      }
      // Restart wake word listening after error
      if (CONFIG.backgroundListening && !isActiveMode) {
        setTimeout(() => {
          try { startWakeWordListening(); } catch (e) { }
        }, 1000);
      }
    };

    wakeWordRecognizer.onend = () => {
      // Restart wake word listening if not in active mode
      if (CONFIG.backgroundListening && !isActiveMode) {
        setTimeout(() => {
          try { startWakeWordListening(); } catch (e) { }
        }, 500);
      }
    };
  }

  function startWakeWordListening() {
    if (isActiveMode) return;

    try {
      initWakeWordListener();
      wakeWordRecognizer.start();
      isListening = true;
      console.log('[GRACEX VOICE] Wake word listener active - say "Hey Grace" or "Gracie"');
    } catch (err) {
      console.warn('[GRACEX VOICE] Could not start wake word listener:', err);
    }
  }

  function stopWakeWordListening() {
    if (wakeWordRecognizer) {
      try { wakeWordRecognizer.stop(); } catch (e) { }
    }
    isListening = false;
  }

  // ============================================
  // ACTIVE LISTENING MODE
  // ============================================

  function startActiveListening() {
    // While listening, stop any speech to prevent talking-over / cutting you off
    if (window.GRACEX_TTS && typeof window.GRACEX_TTS.stop === 'function') window.GRACEX_TTS.stop();
    isActiveMode = true;
    updateStatus('active', '🎤 Listening...');

    // Stop any existing command recognizer
    if (commandRecognizer) {
      try { commandRecognizer.stop(); } catch (e) { }
    }

    commandRecognizer = new SpeechRecognition();
    commandRecognizer.continuous = true;  // Keep listening
    commandRecognizer.interimResults = true;  // Show partial results
    commandRecognizer.lang = CONFIG.language;
    commandRecognizer.maxAlternatives = 1;

    let finalTranscript = '';
    let lastSpeechTime = Date.now();
    const activeStart = Date.now();
    let hasProcessed = false;

    commandRecognizer.onresult = (event) => {
      lastSpeechTime = Date.now();

      // Reset silence timer
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        // Evaluate immediately when silence window triggers to make interactions snappier
        if (!hasProcessed && finalTranscript.trim()) {
          hasProcessed = true;
          processCommand(finalTranscript.trim());
        }
        endActiveListening();
      }, CONFIG.silenceTimeout);

      // Build transcript
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update status with what's being heard
      const displayText = (finalTranscript + interimTranscript).trim();
      if (displayText) {
        updateStatus('active', '🎤 ' + displayText.substring(0, 50) + (displayText.length > 50 ? '...' : ''));
      }
    };

    commandRecognizer.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[GRACEX VOICE] Command recognition error:', event.error);
      }

      // If we have partial transcript, process it
      if (!hasProcessed && finalTranscript.trim()) {
        hasProcessed = true;
        processCommand(finalTranscript.trim());
      }
      endActiveListening();
    };

    commandRecognizer.onend = () => {
      // If still in active mode and have transcript, process it
      if (isActiveMode && !hasProcessed && finalTranscript.trim()) {
        hasProcessed = true;
        processCommand(finalTranscript.trim());
      }
      endActiveListening();
    };

    try {
      commandRecognizer.start();
      console.log('[GRACEX VOICE] Active listening started - speak now');

      // Set maximum listen duration
      activeTimeout = setTimeout(() => {
        if (!hasProcessed && finalTranscript.trim()) {
          hasProcessed = true;
          processCommand(finalTranscript.trim());
        }
        endActiveListening();
      }, CONFIG.activeListenDuration);

    } catch (err) {
      console.warn('[GRACEX VOICE] Could not start active listening:', err);
      endActiveListening();
    }
  }

  function endActiveListening() {
    isActiveMode = false;

    // Clear timers
    if (activeTimeout) clearTimeout(activeTimeout);
    if (silenceTimer) clearTimeout(silenceTimer);

    // Stop command recognizer
    if (commandRecognizer) {
      try { commandRecognizer.stop(); } catch (e) { }
    }

    updateStatus('hidden');

    // Restart wake word listening
    if (CONFIG.backgroundListening) {
      setTimeout(() => {
        startWakeWordListening();
      }, 1000);
    }
  }

  // ============================================
  // COMMAND PROCESSING
  // ============================================

  async function processCommand(text) {
    console.log('[GRACEX VOICE] Processing command:', text);
    updateStatus('processing', 'Thinking...');

    // Remove wake word from start if present
    let cleanText = text;
    CONFIG.wakeWords.forEach(wake => {
      const regex = new RegExp('^' + wake + '\\s*', 'i');
      cleanText = cleanText.replace(regex, '');
    });
    cleanText = cleanText.trim();

    if (!cleanText) {
      if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
        window.GRACEX_TTS.speak("I didn't catch that. Try again?");
      }
      return;
    }

    // Try to get response from brain
    let result;
    try {
      // Step 1: Immediately give offline feedback so the user isn't hanging
      let offlineFeedback = null;
      if (window.GraceX && typeof window.GraceX.route === 'function') {
        const routeRes = window.GraceX.route({
          text: cleanText,
          module: 'core',
          mode: 'voice'
        });
        offlineFeedback = routeRes.reply || "Thinking...";
        if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
          window.GRACEX_TTS.speak(offlineFeedback);
        }
      }

      // Step 2: Now wait for the deep LLM response
      if (typeof window.runModuleBrain === 'function') {
        const reply = window.runModuleBrain('core', cleanText);
        if (reply && typeof reply.then === 'function') {
          result = await reply;
        } else {
          result = reply;
        }
      } else {
        // Universal Native Fallback for all modules (builder, family, etc.) without core.js overlay
        try {
            const bodyPayload = {
                module: window.location.pathname.split('/').pop().replace('.html', '') || 'core',
                message: cleanText,
                messages: [{role: 'user', content: cleanText}]
            };
            const response = await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await response.json();
            result = data.reply || data.response || "I processed your request but received an empty response.";
        } catch (e) {
            console.error('[GRACEX VOICE] Failed to contact brain directly.', e);
            result = offlineFeedback || "I heard you, but I am unable to bypass local firewalls to reach my brain servers.";
        }
      }
    } catch (err) {
      console.warn('[GRACEX VOICE] Brain error:', err);
      result = "Sorry, I had a momentary lapse. Could you say that again?";
    }

    // Update state
    if (window.GRACEX_CORE_STATE) {
      window.GRACEX_CORE_STATE.lastHeard = cleanText;
      window.GRACEX_CORE_STATE.lastReply = result;
      window.GRACEX_CORE_STATE.lastIntent = 'voice_assistant';
    }

    // Also route command if available
    if (window.GRACEX_Core && typeof window.GRACEX_Core.routeCommand === 'function') {
      window.GRACEX_Core.routeCommand(cleanText);
    }

    // Speak the response
    if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled() && result) {
      // If the LLM result is identical to the offline feedback, don't repeat it
      if (result !== offlineFeedback) {
        updateStatus('speaking'); // Trigger the cyan waveform animation!
        await window.GRACEX_TTS.speak(result).catch(err => {
          console.warn('[GRACEX VOICE] TTS error:', err);
        });
      }
    } else if (result) {
        // If TTS is offline or disabled, we still want to show it's speaking/done
        updateStatus('speaking');
        setTimeout(() => updateStatus('hidden'), 2000);
    }

    // Force hidden state AFTER speaking is definitely over
    updateStatus('hidden');
  }

  // ============================================
  // MANUAL ACTIVATION (for mic buttons)
  // ============================================

  function manualActivate() {
    // Stop wake word listener
    stopWakeWordListening();

    // Start active listening directly
    if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
      window.GRACEX_TTS.speak("I'm listening.").then(() => {
        startActiveListening();
      }).catch(() => {
        startActiveListening();
      });
    } else {
      startActiveListening();
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  function start() {
    if (!SpeechRecognition) {
      console.warn('[GRACEX VOICE] Speech recognition not supported');
      return false;
    }

    createStatusIndicator();
    startWakeWordListening();
    console.log('[GRACEX VOICE ASSISTANT] Started - say "Hey Grace" or "Gracie" to activate');
    return true;
  }

  function stop() {
    CONFIG.backgroundListening = false;
    stopWakeWordListening();
    endActiveListening();
    updateStatus('hidden');
    console.log('[GRACEX VOICE ASSISTANT] Stopped');
  }

  function toggle() {
    if (isListening || isActiveMode) {
      stop();
      return false;
    } else {
      CONFIG.backgroundListening = true;
      start();
      return true;
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  window.GRACEX_VoiceAssistant = {
    start,
    stop,
    toggle,
    activate: manualActivate,
    isListening: () => isListening,
    isActive: () => isActiveMode,
    isSupported: true,
    setListenDuration: (ms) => { CONFIG.activeListenDuration = ms; },
    setSilenceTimeout: (ms) => { CONFIG.silenceTimeout = ms; }
  };

  // "Enable voice" button - mic permission requires a user gesture (click) in browsers
  let enableVoiceBtn = null;
  function createEnableVoiceButton() {
    if (document.getElementById('gracex-enable-voice-btn')) return document.getElementById('gracex-enable-voice-btn');
    const btn = document.createElement('button');
    btn.id = 'gracex-enable-voice-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Enable microphone for voice');
    btn.innerHTML = '🎤 Tap to enable voice';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 30px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      z-index: 99992;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    btn.onmouseenter = () => { btn.style.transform = 'scale(1.05)'; btn.style.boxShadow = '0 6px 24px rgba(102, 126, 234, 0.5)'; };
    btn.onmouseleave = () => { btn.style.transform = ''; btn.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'; };
    btn.onclick = function requestMicAndStart() {
      btn.disabled = true;
      btn.textContent = 'Checking microphone...';
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('[GRACEX VOICE] Microphone access granted');
          if (enableVoiceBtn && enableVoiceBtn.parentNode) enableVoiceBtn.remove();
          enableVoiceBtn = null;
          createStatusIndicator();
          start();
          updateStatus('wake', '🎤 Say "Hey Grace" or "Hey Gracie"');
          setTimeout(() => updateStatus('hidden'), 5000);
        })
        .catch((err) => {
          console.warn('[GRACEX VOICE] Microphone access denied:', err);
          btn.disabled = false;
          btn.textContent = '❌ Mic blocked – allow in browser settings';
        });
    };
    document.body.appendChild(btn);
    enableVoiceBtn = btn;
    return btn;
  }

  // Show "Tap to enable voice" after boot; do not auto-request mic (browsers require user gesture)
  function maybeShowEnableVoice() {
    const boot = document.getElementById('boot');
    if (boot && boot.style.display !== 'none') {
      const observer = new MutationObserver(() => {
        if (boot.style.display === 'none') {
          observer.disconnect();
          createEnableVoiceButton();
        }
      });
      observer.observe(boot, { attributes: true, attributeFilter: ['style'] });
    } else {
      createEnableVoiceButton();
    }
  }
  // Automated Follow-up listener
  document.addEventListener('gracex_tts_finished', () => {
    if (CONFIG.followUpMode && !isActiveMode && !isListening) {
      console.log('[GRACEX VOICE] TTS finished. Triggering follow-up listening...');
      // Small delay to ensure no audio overlap
      setTimeout(() => {
        if (!isActiveMode) manualActivate();
      }, 400);
    }
  });

  setTimeout(maybeShowEnableVoice, 2500);

  console.info('[GRACEX VOICE ASSISTANT] Loaded - Wake words: Hey Grace, Yo Grace, Gracie Grace, Ok Grace, Hey Gracie, Ok Gracie');
})();