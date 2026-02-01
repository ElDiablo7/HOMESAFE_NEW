// GRACE-X Core™
// Shell + Boot + Core Chat + Debug Panel
// ------------------------------

// Simple shared state for Core
window.GRACEX_CORE_STATE = window.GRACEX_CORE_STATE || {
  lastHeard: "",
  lastReply: "",
  lastModulePath: "modules/core.html",
  lastIntent: ""
};

// ------------------------------
// Audit + Guard (Infrastructure Hard-Wire)
// ------------------------------
// Purpose:
// - Allow voice actions inside modules (fast)
// - Log every voice-triggered action (traceable)
// - Gate risky actions behind a guard (safe)
// NOTE: Lightweight and RAM-friendly.

window.GRACEX_AUDIT = window.GRACEX_AUDIT || (function () {
  const events = [];
  const MAX = 500;

  function nowISO() {
    try { return new Date().toISOString(); } catch (e) { return ""; }
  }

  function push(evt) {
    events.push(evt);
    if (events.length > MAX) events.shift();
    // Optional UI sinks (if present)
    try {
      if (window.GRACEX_pushLogLine && typeof window.GRACEX_pushLogLine === "function") {
        window.GRACEX_pushLogLine(`[AUDIT] ${evt.type} :: ${evt.module || "core"} :: ${evt.action || ""}`);
      }
    } catch (e) {}
  }

  return {
    events,
    log(type, data) {
      const evt = {
        ts: nowISO(),
        type,
        module: data && data.module ? String(data.module) : "",
        action: data && data.action ? String(data.action) : "",
        data: data || {}
      };
      push(evt);
      try { console.log("[GRACEX AUDIT]", evt); } catch (e) {}
      return evt;
    }
  };
})();

window.GRACEX_GUARD = window.GRACEX_GUARD || (function () {
  // Risky actions are blocked from voice-triggered execution by default.
  // You can override by setting window.GRACEX_GUARD.allowRisky = true (manual, deliberate).
  const risky = new Set([
    "online.enable",
    "online.disable",
    "settings.write",
    "settings.reset",
    "file.export",
    "file.delete",
    "laser.enable",
    "laser.disable",
    "module.open",
    "module.close"
  ]);

  function isRisky(action) {
    if (!action) return false;
    return risky.has(String(action).toLowerCase());
  }

  function allowed(action, source) {
    // source: "voice" | "ui" | "code"
    if (source === "voice" && isRisky(action) && !window.GRACEX_GUARD.allowRisky) return false;
    return true;
  }

  return {
    allowRisky: false,
    isRisky,
    allowed,
    // Central action executor (optional). Modules can use this for unified logging.
    exec(moduleId, action, payload, source) {
      const ok = allowed(action, source || "code");
      window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("action_request", {
        module: moduleId,
        action,
        payload,
        source: source || "code",
        allowed: ok
      });
      if (!ok) {
        return { ok: false, blocked: true, reason: "blocked_by_guard" };
      }
      try {
        if (window.moduleActions && window.moduleActions[moduleId] && typeof window.moduleActions[moduleId][action] === "function") {
          const res = window.moduleActions[moduleId][action](payload);
          window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("action_execute", { module: moduleId, action, payload, source: source || "code", ok: true });
          return { ok: true, result: res };
        }
        return { ok: false, reason: "no_handler" };
      } catch (e) {
        window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("action_execute", { module: moduleId, action, payload, source: source || "code", ok: false, error: String(e) });
        return { ok: false, reason: "exception", error: String(e) };
      }
    }
  };
})();



// ------------------------------
// Boot + App Shell
// ------------------------------


function initCoreShell() {
  const boot = document.getElementById("boot");
  const app  = document.getElementById("app");

  if (!boot || !app) {
    console.warn("[GRACEX CORE] Boot or app shell not found.");
    return;
  }

  function startApp() {
    const bootVideo = document.getElementById("boot-video");
    const bootVoice = document.getElementById("boot-voice");

    // Prevent double-start if user hammers keys/clicks
    if (boot.dataset.starting === "1") {
      return;
    }
    boot.dataset.starting = "1";

    // Helper to actually enter the app
    let finished = false;
    function finishBoot() {
      if (finished) return;
      finished = true;

      boot.style.display = "none";
      app.style.display  = "flex";

      if (window.GRACEX_CORE_STATE) {
        window.GRACEX_CORE_STATE.lastIntent = "boot_start";
      }
    }

    // Play boot video WITH SOUND - unmute and restart on user interaction
    try {
      if (bootVideo && typeof bootVideo.play === "function") {
        // Unmute the video now that user has interacted
        bootVideo.muted = false;
        bootVideo.loop = false; // Don't loop - play once with sound then finish
        bootVideo.currentTime = 0;
        
        // Play with sound
        bootVideo.play().then(() => {
          console.log("[GRACEX CORE] Boot video playing with sound");
        }).catch((err) => {
          console.warn("[GRACEX CORE] Could not play boot video with sound:", err);
          // If sound fails, still finish boot after delay
          setTimeout(finishBoot, 3000);
        });
        
        // When video ends, enter the app
        bootVideo.addEventListener("ended", () => {
          finishBoot();
        });
      }
    } catch (err) {
      console.warn("[GRACEX CORE] Could not play boot video", err);
    }
    
    // Safety fallback: if video is longer than 15s or something fails
    setTimeout(finishBoot, 15000);
  }

  // Tap the boot card
  boot.addEventListener("click", startApp);

  // Any key press
  document.addEventListener("keydown", (e) => {
    if (boot.style.display !== "none") {
      startApp();
    }
  });
}
// ------------------------------
// Audio wiring (delegates to audioManager.js)
// ------------------------------
function initCoreAudioButtons() {
  if (!window.GRACEX_AudioManager) {
    console.warn("[GRACEX CORE] AudioManager not found. Audio buttons will not work.");
    return;
  }

  const audioButtons = document.querySelectorAll("[data-voice-key]");
  audioButtons.forEach((btn) => {
    const key = btn.getAttribute("data-voice-key");
    if (!key) return;

    btn.addEventListener("click", () => {
      window.GRACEX_AudioManager.play(key);
    });
  });

  const muteBtn   = document.getElementById("audio-mute");
  const unmuteBtn = document.getElementById("audio-unmute");

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      window.GRACEX_AudioManager.mute();
    });
  }

  if (unmuteBtn) {
    unmuteBtn.addEventListener("click", () => {
      window.GRACEX_AudioManager.unmute();
    });
  }
}

// ------------------------------
// Core voice input (only activates where elements exist)
// ------------------------------
function initCoreVoice() {
  const voiceBtn  = document.getElementById("core-voice-btn");
  const heardBox  = document.getElementById("core-voice-text");
  const chatLog   = document.getElementById("core-chat-log");
  const chatInput = document.getElementById("core-chat-input");
  const sendBtn   = document.getElementById("core-chat-input");

  if (!voiceBtn || !heardBox || !chatLog || !chatInput) {
    // Not on the Core chat screen; nothing to do.
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("[GRACEX CORE VOICE] SpeechRecognition not supported in this browser.");
    voiceBtn.disabled = true;
    return;
  }

  // Use the new Voice Assistant for extended listening
  voiceBtn.addEventListener("click", () => {
    // If Voice Assistant is available, use it for longer listening
    if (window.GRACEX_VoiceAssistant && window.GRACEX_VoiceAssistant.isSupported) {
      window.GRACEX_VoiceAssistant.activate();
      return;
    }
    
    // Fallback to basic recognition with extended settings
    const recognizer = new SpeechRecognition();
    recognizer.lang = "en-GB";
    recognizer.continuous = true;  // Keep listening longer
    recognizer.interimResults = true;  // Show partial results
    recognizer.maxAlternatives = 1;
    
    let finalTranscript = '';
    let silenceTimer = null;
      const SILENCE_TIMEOUT = 15000; // 15s silence window (user-requested)
    
    recognizer.addEventListener("result", async (event) => {
      // Reset silence timer on any speech
      if (silenceTimer) clearTimeout(silenceTimer);
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      heardBox.value = finalTranscript.trim();
      
      // Set silence timer - process after pause in speech
      silenceTimer = setTimeout(async () => {
        recognizer.stop();
        
        if (!finalTranscript.trim()) return;
        
        // Process the full transcript
        let result;
        try {
          if (typeof window.runModuleBrain === "function") {
            const reply = window.runModuleBrain("core", finalTranscript.trim());
            if (reply && typeof reply.then === 'function') {
              result = await reply;
            } else {
              result = reply;
            }
          } else if (window.GraceX && typeof window.GraceX.think === "function") {
            const res = GraceX.think({
              text: finalTranscript.trim(),
              module: "core",
              mode: "voice"
            });
            result = res.reply || "I heard you, but I'm not sure how to respond.";
          } else {
            result = "Brain system not available.";
          }
          
          if (window.GRACEX_CORE_STATE) {
            window.GRACEX_CORE_STATE.lastHeard = finalTranscript.trim();
            window.GRACEX_CORE_STATE.lastReply = result;
            window.GRACEX_CORE_STATE.lastIntent = "core_voice";
            if (typeof window.updateCoreDebugPanel === 'function') {
              window.updateCoreDebugPanel();
            }
          }
          
          if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled() && result) {
            window.GRACEX_TTS.speak(result).catch(err => {
              console.warn("[GRACEX CORE VOICE] TTS error:", err);
            });
          }
        } catch (err) {
          console.warn("[GRACEX CORE VOICE] Brain error:", err);
        }
        
        if (window.GRACEX_Core && typeof window.GRACEX_Core.routeCommand === "function") {
          window.GRACEX_Core.routeCommand(finalTranscript.trim());
        }
      }, SILENCE_TIMEOUT);
    });

    recognizer.addEventListener("error", (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("[GRACEX CORE VOICE] Recognition error:", event.error);
      }
    });
    
    // Stop after 15 seconds max
    setTimeout(() => {
      try { recognizer.stop(); } catch(e) {}
    }, 15000);

    try {
      recognizer.start();
      console.log("[GRACEX CORE VOICE] Listening... (extended mode)");
    } catch (err) {
      console.warn("[GRACEX CORE VOICE] Could not start recognition:", err);
    }
  });
}

// ------------------------------
// Core Chat + Debug Panel
// This ONLY runs on screens that have the chat elements (core.html).
// ------------------------------
function initCoreChat() {
  const chatLog     = document.getElementById("core-chat-log");
  const chatInput   = document.getElementById("core-chat-input");
  const sendBtn     = document.getElementById("core-chat-send");
  const useHeardBtn = document.getElementById("core-chat-use-heard");
  const heardBox    = document.getElementById("core-voice-text");

  if (!chatLog || !chatInput || !sendBtn) {
    // Not on the Core chat screen.
    return false;
  }

  function appendLine(role, text) {
    if (!text) return;
    const line  = document.createElement("div");
    line.className = "core-chat-line core-chat-" + role;
    const label = role === "user" ? "You" : "Core";
    line.innerHTML = "<strong>" + label + ":</strong> " + text;
    chatLog.appendChild(line);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function openModule(path) {
    if (!path) return false;

    // Normalise to a module id for the SPA router
    let moduleId = null;

    // Accept old-style "modules/x.html" paths for backwards compatibility
    if (path.indexOf("modules/") === 0 && path.endsWith(".html")) {
      moduleId = path.replace(/^modules\//, "").replace(/\.html$/, "");
    } else if (path.indexOf("/") === -1) {
      // Or a bare module name like "core"
      moduleId = path;
    }

    if (window.GRACEX_CORE_STATE) {
      window.GRACEX_CORE_STATE.lastModulePath = path;
      window.GRACEX_CORE_STATE.lastIntent = "route:" + (moduleId || path);
    }

    if (moduleId) {
      // Drive the SPA hash router instead of doing a full page navigation
      window.location.hash = "#/" + moduleId;
    } else {
      // Fallback: direct navigation if we somehow get a raw URL
      window.location.href = path;
    }

    return true;
  }

  function getCoreReply(text) {
    const raw = text || "";
    const t   = raw.toLowerCase().trim();

    if (!t) {
      return "I didn’t quite catch that – try saying what you want help with, like Builder, Uplift, Chef or Family.";
    }

    if (window.GRACEX_CORE_STATE) {
      window.GRACEX_CORE_STATE.lastHeard = raw;
    }

    // High-level “what can you do” / help queries
    if (
      t.includes("what can you do") ||
      t.includes("what do you do") ||
      (t.includes("help") &&
        (t.includes("modules") ||
         t.includes("system") ||
         t.includes("explain") ||
         t.includes("overview")))
    ) {
      return "I’m the Core brain. I can route you into Builder, SiteOps, TradeLink, Uplift, Beauty, Fit, Yoga, Chef, Artist, Family, Accounting and OSINT. Tell me the area – like measurements, mental health, fakeaways, beauty, homework or tax – and I’ll send you to the right module.";
    }

    // Emotion / wellbeing → Uplift
    if (
      t.includes("anxious") ||
      t.includes("anxiety") ||
      t.includes("panic") ||
      t.includes("meltdown") ||
      t.includes("stressed") ||
      t.includes("overwhelmed") ||
      t.includes("mental health")
    ) {
      openModule("modules/uplift.html");
      return "That sounds like one for Uplift – I’ll open Uplift so we can take it step by step, gently.";
    }

    // Route to modules by vibe
    if (
      t.includes("builder") ||
      t.includes("plaster") ||
      t.includes("plastering") ||
      t.includes("measure") ||
      t.includes("measurement") ||
      t.includes("blueprint")
    ) {
      openModule("modules/builder.html");
      return "Loading Builder – we’ll handle measurements, tasks and job logic there.";
    }

    if (
      t.includes("siteops") ||
      t.includes("site ops") ||
      t.includes("rigging") ||
      t.includes("stage") ||
      t.includes("studio ops")
    ) {
      openModule("modules/siteops.html");
      return "Loading SiteOps – rigging, stages and on-site ops live here.";
    }

    if (t.includes("uplift") || t.includes("motivate") || t.includes("motivation")) {
      openModule("modules/uplift.html");
      return "Opening Uplift – we’ll take this one gently and step by step.";
    }

    if (
      t.includes("chef") ||
      t.includes("fakeaway") ||
      t.includes("takeaway") ||
      t.includes("cook") ||
      t.includes("recipe")
    ) {
      openModule("modules/chef.html");
      return "Let’s go to Chef – fakeaways, money-saving and food logic are there.";
    }

    // Yoga – direct module
    if (t.includes("yoga") || t.includes("stretch")) {
      openModule("modules/yoga.html");
      return "Opening Yoga – stretching and breathing flows are in that module.";
    }

    // Fit – fitness & diet
    if (
      t.includes("fit") ||
      t.includes("fitness") ||
      t.includes("diet") ||
      t.includes("gym")
    ) {
      openModule("modules/fit.html");
      return "Opening Fit – workouts, macros and general fitness tools are there.";
    }

    if (
      t.includes("family") ||
      t.includes("kids") ||
      t.includes("child") ||
      t.includes("homework") ||
      t.includes("school")
    ) {
      openModule("modules/family.html");
      return "Loading Family – kids, homework, and safe family tools sit in that module.";
    }

    if (t.includes("gamer") || t.includes("game") || t.includes("overlay")) {
      openModule("modules/gamer.html");
      return "Firing up Gamer Mode – overlays and safe gaming logic start there.";
    }

    if (
      t.includes("accounting") ||
      t.includes("tax") ||
      t.includes("vat") ||
      t.includes("money") ||
      t.includes("invoice")
    ) {
      openModule("modules/accounting.html");
      return "Opening Accounting – tax, forms and money admin live in that module.";
    }

    if (
      t.includes("osint") ||
      t.includes("guardian") ||
      t.includes("street safe") ||
      t.includes("streetsafe")
    ) {
      openModule("modules/osint.html");
      return "Loading OSINT / Guardian tools – strictly white-hat checks only.";
    }

    if (
      t.includes("beauty") ||
      t.includes("hair") ||
      t.includes("makeup") ||
      t.includes("style")
    ) {
      openModule("modules/beauty.html");
      return "Jumping to Beauty – we’ll talk hair, skin and style properly there.";
    }

    // TradeLink
    if (
      t.includes("tradelink") ||
      t.includes("trade link") ||
      t.includes("tradesman") ||
      t.includes("job lead")
    ) {
      openModule("modules/tradelink.html");
      return "Opening TradeLink – connecting you to the right trades and services.";
    }

    // Artist / Studio
    if (
      t.includes("artist") ||
      t.includes("studio") ||
      t.includes("gracex studio") ||
      t.includes("design")
    ) {
      openModule("modules/artist.html");
      return "Opening Artist / Studio – creative tools and visuals live in there.";
    }

    if (t.includes("core") || t.includes("home")) {
      openModule("modules/core.html");
      return "You’re already with Core – this is home base for the ecosystem.";
    }

    return "Got you. I can route you to Builder (jobs / measurements), SiteOps (rigging / stages), TradeLink (clients ↔ trades), Uplift (wellbeing), Chef (fakeaways / cooking), Artist (creative), Beauty, Fit / Yoga, Family, Accounting or OSINT. Tell me which area you want help with.";
  }

  function updateCoreDebugPanel() {
    if (!window.GRACEX_CORE_STATE) return;

    const panel    = document.getElementById("core-debug-panel");
    const heardEl  = document.getElementById("debug-last-heard");
    const replyEl  = document.getElementById("debug-last-reply");
    const intentEl = document.getElementById("debug-last-intent");

    if (!panel || !heardEl || !replyEl || !intentEl) {
      return;
    }

    panel.style.display = "block";
    heardEl.textContent  = window.GRACEX_CORE_STATE.lastHeard  || "-";
    replyEl.textContent  = window.GRACEX_CORE_STATE.lastReply  || "-";
    intentEl.textContent = window.GRACEX_CORE_STATE.lastIntent || "-";
  }

  // Expose globally so initCoreVoice can access it
  window.updateCoreDebugPanel = updateCoreDebugPanel;

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) {
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Please enter a message', 'error', 2000);
      }
      return;
    }

    // Validate input length
    if (window.GRACEX_Utils) {
      const validation = GRACEX_Utils.validateInput(text, {
        required: true,
        maxLength: 500
      });
      if (!validation.valid) {
        GRACEX_Utils.showToast(validation.errors[0], 'error', 2000);
        return;
      }
    }

    // user message
    chatLog.innerHTML += `<div class="user">${text}</div>`;
    chatLog.scrollTop = chatLog.scrollHeight;

    let res;

    let reply;
    try {
      if (typeof window.runModuleBrain === "function") {
        // Level 5 brain path - connects to backend API
        const brainReply = window.runModuleBrain("core", text);
        // Handle both sync and async
        if (brainReply && typeof brainReply.then === 'function') {
          reply = await brainReply;
        } else {
          reply = brainReply;
        }
        res = { reply: reply, intent: "core_chat", emotion: { mood: "neutral", confidence: 0.5 } };
      } else if (window.GraceX && typeof GraceX.think === "function") {
        // Fallback to local brain
        res = GraceX.think({
          text,
          module: "core",
          mode: "chat"
        });
        reply = res.reply;
      } else {
        // SAFETY FALLBACK
        res = { reply: "Brain not loaded." };
        reply = res.reply;
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Brain system not ready', 'error', 2000);
        }
      }
    } catch (err) {
      console.error('[GRACEX CORE] Think error:', err);
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Failed to process message', 'error', 2000);
      }
      res = { reply: "Sorry, I encountered an error. Please try again." };
      reply = res.reply;
    }

    reply = reply || "I'm not sure how to respond to that.";
    
    // Add bot message with optional emotion indicator
    let botClass = "bot";
    if (res.emotion && res.emotion.mood === "positive") botClass += " mood-positive";
    if (res.emotion && res.emotion.mood === "negative") botClass += " mood-negative";
    chatLog.innerHTML += `<div class="${botClass}">${reply}</div>`;
    chatInput.value = "";
    
    appendLine("core", reply);

    // Sync with old state system
    if (window.GRACEX_CORE_STATE) {
      window.GRACEX_CORE_STATE.lastHeard  = text;
      window.GRACEX_CORE_STATE.lastReply  = reply;
      window.GRACEX_CORE_STATE.lastIntent = res.intent || "core_chat";
      if (typeof window.updateCoreDebugPanel === 'function') {
        window.updateCoreDebugPanel();
      }
    }

    // Speak the response using TTS
    if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled() && reply) {
      window.GRACEX_TTS.speak(reply).catch(err => {
        console.warn("[GRACEX CORE CHAT] TTS error:", err);
      });
    }
    
    // Log emotional context for debugging
    if (res.emotion) {
      console.log("[GRACEX CORE] Emotion detected:", res.emotion.mood, "confidence:", res.emotion.confidence);
    }
  }

  // Wire button + Enter key + "use heard" button
  if (sendBtn) {
    sendBtn.addEventListener("click", handleSend);
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });
  }

  if (useHeardBtn && heardBox) {
    useHeardBtn.addEventListener("click", () => {
      const heardText = (heardBox.value || "").trim();
      if (!heardText) return;
      chatInput.value = heardText;
      handleSend();
    });
  }

  // Enhanced keyboard shortcuts
  if (window.GRACEX_Utils && chatInput) {
    // Escape to clear input
    GRACEX_Utils.addKeyboardShortcut('Escape', () => {
      chatInput.value = '';
      chatInput.focus();
    }, chatInput);
    
    // Ctrl+L to clear chat
    GRACEX_Utils.addKeyboardShortcut({ key: 'l', ctrl: true }, () => {
      if (confirm('Clear chat history?')) {
        chatLog.innerHTML = '<div class="bot">Chat cleared. How can I help you?</div>';
        GRACEX_Utils.showToast('Chat cleared', 'success', 2000);
      }
    });
  }

  // Add chat control buttons
  if (chatLog && chatLog.parentElement) {
    // Create button container
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'position:absolute;top:10px;right:10px;display:flex;gap:6px;';
    
    // Export chat button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📥';
    exportBtn.title = 'Export Chat History';
    exportBtn.className = 'btn btn-secondary';
    exportBtn.style.cssText = 'padding:4px 8px;font-size:12px;';
    exportBtn.addEventListener('click', () => {
      try {
        const messages = [];
        chatLog.querySelectorAll('.user, .bot, .core').forEach(el => {
          const role = el.classList.contains('user') ? 'You' : 'GRACE-X';
          messages.push({ role, message: el.textContent });
        });
        
        if (messages.length === 0) {
          if (window.GRACEX_Utils) GRACEX_Utils.showToast('No messages to export', 'info');
          return;
        }
        
        if (window.GRACEX_Utils) {
          GRACEX_Utils.exportToCSV(messages, 'gracex-chat-history.csv');
        }
      } catch (err) {
        console.error('[GRACEX CORE] Export error:', err);
        if (window.GRACEX_Utils) GRACEX_Utils.showToast('Failed to export', 'error');
      }
    });
    
    // Copy last message button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy Last Response';
    copyBtn.className = 'btn btn-secondary';
    copyBtn.style.cssText = 'padding:4px 8px;font-size:12px;';
    copyBtn.addEventListener('click', () => {
      const lastBot = chatLog.querySelector('.bot:last-of-type, .core:last-of-type');
      if (lastBot && window.GRACEX_Utils) {
        GRACEX_Utils.copyToClipboard(lastBot.textContent);
      } else if (!lastBot) {
        if (window.GRACEX_Utils) GRACEX_Utils.showToast('No message to copy', 'info');
      }
    });
    
    // Clear chat button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️';
    clearBtn.title = 'Clear Chat';
    clearBtn.className = 'btn btn-secondary';
    clearBtn.style.cssText = 'padding:4px 8px;font-size:12px;';
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear chat history?')) {
        chatLog.innerHTML = '<div class="bot">Chat cleared. How can I help you?</div>';
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Chat cleared', 'success', 2000);
        }
      }
    });
    
    btnContainer.appendChild(exportBtn);
    btnContainer.appendChild(copyBtn);
    btnContainer.appendChild(clearBtn);
    chatLog.parentElement.style.position = 'relative';
    chatLog.parentElement.appendChild(btnContainer);
  }

  // Voice path uses the same brain
  window.GRACEX_Core = window.GRACEX_Core || {};
  window.GRACEX_Core.routeCommand = async function (text) {
    const t = (text || "").trim();
    if (!t) return;

    appendLine("user", t);
    
    // Try Level 5 brain (runModuleBrain) FIRST for API, then fallback
    let reply;
    try {
      if (typeof window.runModuleBrain === "function") {
        // Level 5 brain path - connects to backend API
        const brainReply = window.runModuleBrain("core", t);
        if (brainReply && typeof brainReply.then === 'function') {
          reply = await brainReply;
        } else {
          reply = brainReply;
        }
      } else if (window.GraceX && typeof window.GraceX.think === "function") {
        // Fallback to local brain
        const res = GraceX.think({
          text: t,
          module: "core",
          mode: "voice"
        });
        reply = res.reply || "I heard you, but I'm not sure how to respond.";
      } else {
        // FINAL FALLBACK: old system
        reply = getCoreReply(t);
      }
    } catch (err) {
      console.warn("[GRACEX CORE] Brain error, using fallback:", err);
      reply = getCoreReply(t);
    }
    
    appendLine("core", reply);

    if (window.GRACEX_CORE_STATE) {
      window.GRACEX_CORE_STATE.lastHeard  = text;
      window.GRACEX_CORE_STATE.lastReply  = reply;
      window.GRACEX_CORE_STATE.lastIntent = "core_voice";
      updateCoreDebugPanel();
    }

    // Speak the response using TTS
    if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled() && reply) {
      window.GRACEX_TTS.speak(reply).catch(err => {
        console.warn("[GRACEX CORE VOICE] TTS error:", err);
      });
    }
  };

  return true;
}

function initChatWithRetry() {
  let attempts     = 0;
  const maxAttempt = 20;

  const timer = setInterval(() => {
    attempts++;
    const ok = initCoreChat();
    if (ok) {
      clearInterval(timer);
    } else if (attempts >= maxAttempt) {
      clearInterval(timer);
      console.warn("[GRACEX CORE CHAT] Could not find chat elements.");
    }
  }, 300);
}

// ------------------------------
// Generic module voice wiring

function initModuleVoice(moduleId) {
  try {
    if (!moduleId) return;
    const panel = document.querySelector('.module-voice-panel[data-module="' + moduleId + '"]');
    if (!panel) return;

    const btn     = panel.querySelector('.module-voice-btn');
    const status  = panel.querySelector('.module-voice-status');
    const heardEl = panel.querySelector('.module-voice-text');
    const replyEl = panel.querySelector('.module-voice-reply');

    if (!btn || !status || !heardEl) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      status.textContent = "Mic not supported in this browser.";
      btn.disabled = true;
      return;
    }

    if (btn.dataset.micWired === "1") {
      return;
    }

    // Extended listening configuration
      const SILENCE_TIMEOUT = 15000; // 15s silence window (user-requested)
    const MAX_LISTEN_TIME = 15000; // 15 seconds max listen time
    
    btn.addEventListener("click", () => {
      // If Voice Assistant is available, use it
      if (window.GRACEX_VoiceAssistant && window.GRACEX_VoiceAssistant.isSupported) {
        window.GRACEX_VoiceAssistant.activate();
        return;
      }
      
      const recognizer = new SpeechRecognition();
      recognizer.lang = "en-GB";
      recognizer.continuous = true;  // Keep listening longer
      recognizer.interimResults = true;  // Show partial results
      recognizer.maxAlternatives = 1;
      
      let finalTranscript = '';
      let silenceTimer = null;
      let maxTimer = null;
      
      status.textContent = "🎤 Listening...";
      
      recognizer.addEventListener("result", async (event) => {
        // Reset silence timer on any speech
        if (silenceTimer) clearTimeout(silenceTimer);
        
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update display with what's being heard
        heardEl.value = (finalTranscript + interimTranscript).trim();
        status.textContent = "🎤 Listening...";
        
        // Set silence timer - process after pause in speech
      silenceTimer = setTimeout(() => {
        if (!isListening) return;
        const elapsed = Date.now() - sessionStart;
        if (elapsed < MIN_LISTEN_MS) {
          const remaining = Math.max(0, MIN_LISTEN_MS - elapsed);
          // extend once to guarantee minimum listening window
          silenceTimer = setTimeout(() => {
            if (isListening) { try { recognition.stop(); } catch(e) {} }
          }, remaining);
          return;
        }
        try { recognition.stop(); } catch(e) {}
      }, SILENCE_TIMEOUT);
      });
      
      async function processVoiceResult() {
        if (maxTimer) clearTimeout(maxTimer);
        try { recognizer.stop(); } catch(e) {}
        
        const transcript = finalTranscript.trim();
        try { window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("voice_heard", { module: moduleId, transcript }); } catch(e) {}
        if (!transcript) {
          status.textContent = "Mic off";
          return;
        }
        try { if (window.moduleVoiceActions && typeof window.moduleVoiceActions[moduleId] === "function") { const handled = window.moduleVoiceActions[moduleId](transcript); if (handled) { try { window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("voice_action_handled", { module: moduleId, transcript, handled: true }); } catch(e) {} status.textContent = "Mic off"; return; } } } catch(e) {}
        
        status.textContent = "Processing...";
        
        // Show loading state
        if (replyEl) {
          replyEl.textContent = "Thinking...";
          replyEl.style.opacity = "0.7";
        }

        // Try Level 5 brain (runModuleBrain) FIRST for API, then fallback to local
        try {
          let result;
          if (typeof window.runModuleBrain === "function") {
            const reply = window.runModuleBrain(moduleId, transcript);
            
            if (reply && typeof reply.then === 'function') {
              result = await reply;
            } else {
              result = reply;
            }
          } else if (window.GraceX && typeof window.GraceX.think === 'function') {
            const res = window.GraceX.think({
              text: transcript,
              module: moduleId,
              mode: 'voice'
            });
            result = res.reply || res.message || "I heard you, but I'm not sure how to respond.";
          } else {
            result = "Brain system not available.";
          }
          
          try { window.GRACEX_AUDIT && window.GRACEX_AUDIT.log("voice_reply", { module: moduleId, transcript, reply: result }); } catch(e) {}
          if (replyEl) {
            replyEl.textContent = result;
            replyEl.style.opacity = "1";
          }
          
          // Speak the response using TTS
          if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled() && result) {
            window.GRACEX_TTS.speak(result).catch(err => {
              console.warn("[GRACEX MODULE VOICE] TTS error:", err);
            });
          }
        } catch (err) {
          console.warn("[GRACEX MODULE VOICE] Error running brain for", moduleId, err);
          if (replyEl) {
            replyEl.textContent = "Prototype brain glitched on that one – try rephrasing in simpler words.";
            replyEl.style.opacity = "1";
          }
        }
        
        status.textContent = "Mic off";
      }

      recognizer.addEventListener("error", (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn("[GRACEX MODULE VOICE] Recognition error:", event.error);
        }
        status.textContent = "Mic off";
      });
      
      recognizer.addEventListener("end", () => {
        if (finalTranscript.trim() && status.textContent === "🎤 Listening...") {
          processVoiceResult();
        } else {
          status.textContent = "Mic off";
        }
      });
      
      // Max listen time safety
      maxTimer = setTimeout(() => {
        processVoiceResult();
      }, MAX_LISTEN_TIME);

      try {
        recognizer.start();
        console.log("[GRACEX MODULE VOICE] Extended listening started for", moduleId);
      } catch (err) {
        console.warn("[GRACEX MODULE VOICE] Could not start recognition:", err);
        status.textContent = "Mic error";
      }
    });

    btn.dataset.micWired = "1";
  } catch (err) {
    console.warn("[GRACEX MODULE VOICE] Failed to init module voice for", moduleId, err);
  }
}

// ------------------------------
// Module text Ask → tiny brains
// ------------------------------
function initModuleAskUI(moduleId) {
  try {
    if (!window.runModuleBrain) return;
    if (!moduleId) return;

    var id = String(moduleId).toLowerCase();

    // Generic pattern: module-brain panel with *-brain-input / *-brain-send / *-brain-output
    var brainPanelId  = id + "-brain-panel";
    var brainInputId  = id + "-brain-input";
    var brainSendId   = id + "-brain-send";
    var brainOutputId = id + "-brain-output";

    var brainPanel  = document.getElementById(brainPanelId);
    var brainInput  = document.getElementById(brainInputId);
    var brainSend   = document.getElementById(brainSendId);
    var brainOutput = document.getElementById(brainOutputId);

    if (brainPanel && brainInput && brainSend && brainOutput) {
      if (brainSend.dataset.brainWired === "1") {
        // Already wired on a previous load.
      } else {
        brainSend.addEventListener("click", function () {
          var text = (brainInput.value || "").trim();
          if (!text) {
            brainOutput.textContent =
              "Tell me in one short sentence what you want help with, then tap Ask.";
            return;
          }
          try {
            // Try Level 5 brain (runModuleBrain) FIRST for API, then fallback
            let reply;
            if (window.runModuleBrain) {
              reply = window.runModuleBrain(id, text);
            } else if (window.GraceX && typeof window.GraceX.think === 'function') {
              // Fallback to local brain
              const res = window.GraceX.think({
                text: text,
                module: id,
                mode: 'chat'
              });
              reply = res.reply || res.message || "I'm not sure how to respond to that.";
            } else {
              reply = "Brain system not available.";
            }
            
            // Handle both sync (Level 1) and async (Level 5) responses
            if (reply && typeof reply.then === 'function') {
              reply.then(function(result) {
                brainOutput.textContent = result;
              }).catch(function(err) {
                console.warn("[GRACEX MODULE ASK] Brain error for", id, err);
                brainOutput.textContent = "Prototype brain glitched on that – try saying it in simpler words.";
              });
            } else {
            brainOutput.textContent = reply;
            }
          } catch (err) {
            console.warn("[GRACEX MODULE ASK] Brain error for", id, err);
            brainOutput.textContent =
              "Prototype brain glitched on that – try saying it in simpler words.";
          }
        });
        brainSend.dataset.brainWired = "1";
      }
    }

    // Special cases for Beauty and Yoga typed Ask cards
    if (id === "beauty") {
      var bInput  = document.getElementById("beautyInput");
      var bBtn    = document.getElementById("beautyAskBtn");
      var bOutput = document.getElementById("beautyOutput");

      if (bInput && bBtn && bOutput && bBtn.dataset.brainWired !== "1") {
        bBtn.addEventListener("click", function () {
          var text = (bInput.value || "").trim();
          if (!text) {
            bOutput.textContent =
              "Tell me what you want help with – hair, skin, makeup or outfits – in one short sentence.";
            return;
          }
          try {
            // Try Level 5 brain (runModuleBrain) FIRST for API, then fallback
            let reply;
            if (window.runModuleBrain) {
              reply = window.runModuleBrain("beauty", text);
            } else if (window.GraceX && typeof window.GraceX.think === 'function') {
              // Fallback to local brain
              const res = window.GraceX.think({
                text: text,
                module: "beauty",
                mode: 'chat'
              });
              reply = res.reply || res.message || "I'm not sure how to respond to that.";
            } else {
              reply = "Brain system not available.";
            }
            
            if (reply && typeof reply.then === 'function') {
              reply.then(function(result) { bOutput.textContent = result; })
                .catch(function(err) { 
                  console.warn("[GRACEX BEAUTY ASK] Brain error", err);
                  bOutput.textContent = "Prototype Beauty brain glitched on that one – try saying it a bit simpler.";
                });
            } else {
            bOutput.textContent = reply;
            }
          } catch (err) {
            console.warn("[GRACEX BEAUTY ASK] Brain error", err);
            bOutput.textContent =
              "Prototype Beauty brain glitched on that one – try saying it a bit simpler.";
          }
        });
        bBtn.dataset.brainWired = "1";
      }
    }

    if (id === "yoga") {
      var yInput  = document.getElementById("yogaInput");
      var yBtn    = document.getElementById("yogaAskBtn");
      var yOutput = document.getElementById("yogaOutput");

      if (yInput && yBtn && yOutput && yBtn.dataset.brainWired !== "1") {
        yBtn.addEventListener("click", function () {
          var text = (yInput.value || "").trim();
          if (!text) {
            yOutput.textContent =
              "Tell me what’s tight, how long you’ve got, and whether you’re sitting or standing.";
            return;
          }
          try {
            // Try Level 5 brain (runModuleBrain) FIRST for API, then fallback
            let reply;
            if (window.runModuleBrain) {
              reply = window.runModuleBrain("yoga", text);
            } else if (window.GraceX && typeof window.GraceX.think === 'function') {
              // Fallback to local brain
              const res = window.GraceX.think({
                text: text,
                module: "yoga",
                mode: 'chat'
              });
              reply = res.reply || res.message || "I'm not sure how to respond to that.";
            } else {
              reply = "Brain system not available.";
            }
            
            if (reply && typeof reply.then === 'function') {
              reply.then(function(result) { yOutput.textContent = result; })
                .catch(function(err) {
                  console.warn("[GRACEX YOGA ASK] Brain error", err);
                  yOutput.textContent = "Prototype Yoga brain glitched on that – try describing it in simpler words.";
                });
            } else {
            yOutput.textContent = reply;
            }
          } catch (err) {
            console.warn("[GRACEX YOGA ASK] Brain error", err);
            yOutput.textContent =
              "Prototype Yoga brain glitched on that – try describing it in simpler words.";
          }
        });
        yBtn.dataset.brainWired = "1";
      }
    }
  } catch (err) {
    console.warn("[GRACEX MODULE ASK] Failed to init Ask UI for", moduleId, err);
  }
}



// SPA module hook for Core
// ------------------------------
document.addEventListener("gracex:module:loaded", (event) => {
  try {
    const detail   = event.detail || {};
    const moduleId = detail.module;

    if (moduleId === "core") {
      // Core HTML has just been injected into #view – wire chat + voice.
      initCoreChat();
      initCoreVoice();
    }

    if (moduleId) {
      // Wire generic module voice panel and typed Ask → brains for this module.
      initModuleVoice(moduleId);
      initModuleAskUI(moduleId);
    }
  } catch (err) {
    console.warn("[GRACEX CORE] Failed to init module after router event", err);
  }
});

// ------------------------------
// Tiny-brain harness for modules
// ------------------------------
(function () {
  if (window.runModuleBrain) {
    // Respect any existing implementation
    return;
  }

  function normalise(text) {
    return (text || "").toLowerCase().trim();
  }

  const brains = {
    tradelink(text) {
      const t = normalise(text);
      if (!t) {
        return "Tell me what the job is in one sentence – like ‘small leak under kitchen sink in Corby’ – and I’ll help you structure it.";
      }
      if (t.includes("leak") || t.includes("pipe") || t.includes("burst")) {
        return "Sounds like a plumbing leak. Note where it is, how fast it’s dripping, and if you can safely shut off the water at the stop tap.";
      }
      if (t.includes("boiler") || t.includes("heating")) {
        return "Boiler or heating job – make a note of the boiler make/model and any error codes on the display, that really helps the engineer.";
      }
      if (t.includes("quote") || t.includes("price")) {
        return "For a quote, write: what the problem is, how urgent it is, and any photos you can send. That gives trades a fair shot at pricing it.";
      }
      return "This is the TradeLink prototype brain. Describe the job, the room, and how urgent it is – I’ll nudge you on what a good job brief needs.";
    },

    siteops(text) {
      const t = normalise(text);
      if (!t) {
        return "Tell me what stage you’re at – prep, rigging, live, or strike – and I’ll reflect back the key safety checks.";
      }
      if (t.includes("rigging") || t.includes("points") || t.includes("anchors")) {
        return "Rigging phase: double-check anchors, SWL labels, secondary safeties, and exclusion zones under the load path.";
      }
      if (t.includes("live") || t.includes("show") || t.includes("performance")) {
        return "Live run: minimise changes, keep a single point of contact for cues, and log anything that deviates from the plan.";
      }
      if (t.includes("strike") || t.includes("derig") || t.includes("de-rig")) {
        return "Strike phase: confirm power is isolated where needed, keep clear comms, and watch for fatigue – tired crews miss obvious things.";
      }
      return "Prototype SiteOps brain: I’m here to nudge on phases, safety snapshots, and live/strike awareness rather than giving strict orders.";
    },

    builder(text) {
      const t = normalise(text);
      if (!t) {
        return "This is the Builder brain. Tell me the job type – like plastering, electrics, bathroom, or measurements – and which room you’re in.";
      }
      if (t.includes("measure") || t.includes("measurement") || t.includes("dimensions")) {
        return "Measurement pass: walk the room slowly, measure each wall length and height, and note doors/windows. The tool will turn that into areas later – your job is just to capture clean numbers.";
      }
      if (t.includes("plaster") || t.includes("plastering") || t.includes("skim")) {
        return "Plastering logic: note substrate (old plaster, board, brick), total wall/ceiling area, and access issues. That decides time and material, not just the square metres.";
      }
      if (t.includes("socket") || t.includes("rewire") || t.includes("electrics") || t.includes("lighting")) {
        return "Electrical work: list how many points (sockets, lights, switches), consumer unit condition, and whether there’s existing certs. Photos of the board help later.";
      }
      if (t.includes("bathroom") || t.includes("kitchen")) {
        return "Bathroom/kitchen: think in zones – wet areas, extraction, electrics, and access. Measure wall runs and key appliance positions so we can overlay units accurately.";
      }
      return "Prototype Builder brain: I’ll remind you what to record – room name, dimensions, services and access – so the system can do the heavy lifting later.";
    },

    uplift(text) {
      const t = normalise(text);

      if (!t) {
        return "This is Uplift. I’m not a doctor, but I can help you slow things down and think more clearly. In one short sentence, tell me what’s going on or how today feels.";
      }

      if (
        t.includes("suicide") ||
        t.includes("kill myself") ||
        t.includes("end it") ||
        t.includes("end my life") ||
        t.includes("dont want to be here") ||
        t.includes("don't want to be here") ||
        t.includes("self harm") ||
        t.includes("self-harm") ||
        t.includes("hurt myself")
      ) {
        return "I’m really glad you told me that. This sounds serious, and you deserve real-world help, not just an app. I’m only software, so I can’t keep you safe – but other people can. If you’re in immediate danger, please contact emergency services. In the UK you can talk to Samaritans 24/7 on 116 123 or via jo@samaritans.org.";
      }

      if (
        t.includes("panic") ||
        t.includes("meltdown") ||
        t.includes("overwhelmed") ||
        t.includes("shaking") ||
        t.includes("cant breathe") ||
        t.includes("can't breathe")
      ) {
        return "Okay. You’re not in trouble with me. Let’s do one grounding loop: breathe in for 4, hold for 4, out for 6 – three times. Then tell me in one sentence what hit you just before this started.";
      }

      if (
        t.includes("anxiety") ||
        t.includes("anxious") ||
        t.includes("worried") ||
        t.includes("worry") ||
        t.includes("overthinking") ||
        t.includes("cant switch off") ||
        t.includes("can't switch off")
      ) {
        return "Anxiety loves keeping everything vague and massive. Let’s pin it down: finish ‘I’m scared that…’ or ‘I keep thinking about…’ in your head, then type the best match. We’ll split it into what you can control this week and what you can’t.";
      }

      if (
        t.includes("depressed") ||
        t.includes("low") ||
        t.includes("empty") ||
        t.includes("numb") ||
        t.includes("cant be bothered") ||
        t.includes("can't be bothered") ||
        t.includes("no energy") ||
        t.includes("drained")
      ) {
        return "Low mood makes everything feel heavy. Pick ONE tiny thing: stand up and stretch, drink a glass of water, open the curtains, or change into a clean T-shirt. Tell me which one you’ll do – we’re not fixing life tonight, just nudging the dial.";
      }

      if (
        t.includes("angry") ||
        t.includes("rage") ||
        t.includes("pissed off") ||
        t.includes("furious")
      ) {
        return "Anger usually means something feels unfair or blocked. Try finishing: ‘I’m sick of…’, ‘It’s not fair that…’ or ‘I keep getting wound up when…’. Once you’ve got a sentence, we can look at what you actually want out of this.";
      }

      if (
        t.includes("cant sleep") ||
        t.includes("can't sleep") ||
        t.includes("insomnia") ||
        (t.includes("sleep") && t.includes("problem"))
      ) {
        return "Sleep goes weird when your brain thinks it has unfinished business. Try a brain dump on paper before bed – everything on your mind, no order. Then pick one micro-target for tomorrow and park the rest for 24 hours.";
      }

      return "Thanks for trusting me with that. I’m a prototype Uplift brain, not a clinician, but I can help you break this into smaller steps. If it ever feels like you might hurt yourself or someone else, please reach out to real-world support like your GP, crisis lines, or Samaritans in the UK on 116 123.";
    },

    family(text) {
      const t = normalise(text);
      if (!t) {
        return "Tell me the kid’s age and what you’re trying to sort – homework, routines, screen-time, or behaviour – and we’ll keep it simple.";
      }
      if (t.includes("homework") || t.includes("school")) {
        return "Homework: pick one small chunk, set a short timer, and praise effort not perfection. Brains learn better when they don’t feel under attack.";
      }
      if (t.includes("bedtime") || t.includes("sleep")) {
        return "Bedtime battles are normal. A predictable 3-step routine (wash, calm activity, bed) most nights beats any fancy trick.";
      }
      return "Prototype Family brain: I’m here to help you break things into one or two realistic steps, not to judge your parenting.";
    },

    chef(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Chef. Tell me the vibe – fakeaway, quick, healthy, cheap, or kids – and what you’ve actually got in the kitchen.";
      }
      if (
        t.includes("allergy") ||
        t.includes("allergic") ||
        t.includes("nut") ||
        t.includes("nuts") ||
        t.includes("gluten") ||
        t.includes("coeliac") ||
        t.includes("celiac") ||
        t.includes("dairy") ||
        t.includes("lactose")
      ) {
        return "Allergies are serious – I can’t check labels for you. Always double-check packets and recipes. Tell me the allergy and meal vibe and I’ll keep suggestions general, but you stay in charge of safety.";
      }
      if (
        t.includes("fakeaway") ||
        t.includes("kebab") ||
        t.includes("burger") ||
        t.includes("pizza") ||
        t.includes("chinese") ||
        t.includes("curry") ||
        t.includes("takeaway")
      ) {
        return "Fakeaway mode: same craving, cheaper and less greasy. Wrap pizzas, tray-bake kebab meat, or oven/air-fryer versions instead of deep-fry. Tell me what meat/veg you’ve got and I’ll mirror back a rough plan.";
      }
      if (
        t.includes("budget") ||
        t.includes("cheap") ||
        t.includes("skint") ||
        t.includes("broke")
      ) {
        return "Budget mode: think carb + protein + veg. Pasta, rice, potatoes with eggs, beans, tinned fish or mince, plus any frozen veg you’ve got. Tell me what’s in your cupboard and I’ll bounce back a simple idea.";
      }
      if (
        t.includes("quick") ||
        t.includes("10 minutes") ||
        t.includes("15 minutes") ||
        t.includes("fast") ||
        t.includes("no time")
      ) {
        return "Quick cook: one-pan pasta, stir-fry, or loaded toast. Pick one of those and tell me what you’ve actually got in and I’ll lay out a basic plan.";
      }
      if (
        t.includes("kids") ||
        t.includes("kid") ||
        t.includes("family") ||
        t.includes("picky") ||
        t.includes("fussy")
      ) {
        return "Family mode: same base, different toppings. Tray-bakes, taco/wrap nights, or DIY pizza wraps let picky eaters tweak their own plate.";
      }
      if (
        t.includes("healthy") ||
        t.includes("healthier") ||
        t.includes("diet") ||
        t.includes("lose weight") ||
        t.includes("calories") ||
        t.includes("calorie")
      ) {
        return "Healthier cooking: more protein, more veg, and watch oils and sauces. Tell me your usual takeaway or comfort meal and I’ll suggest a lighter home version.";
      }
      if (
        t.includes("air fryer") ||
        t.includes("airfryer") ||
        t.includes("oven") ||
        t.includes("bake") ||
        t.includes("baked")
      ) {
        return "Oven / air-fryer mode: don’t overcrowd the tray, line it, and always cook food through. Tell me what you’re cooking and I’ll give a rough, common-sense plan – you still follow packet times and safety.";
      }
      return "Prototype Chef brain: I’ll help you think through meals with what you’ve actually got, not Instagram perfection. You stay in charge of labels, allergies and cooking things properly.";
    },

  fit(text) {
      const t = normalise(text);

      if (!t) {
        return "This is GRACE-X Fit. Tell me your rough goal – move more, feel better, or ease tension – in simple words.";
      }

      if (t.includes("steps") || t.includes("walk")) {
        return "Walking still counts. Even 10–15 minutes outside can reset your head more than another hour of scrolling. Start with something you’d actually do most days.";
      }

      if (t.includes("gym") || t.includes("weights") || t.includes("strength")) {
        return "Strength work: start light, learn the movements, and don’t chase someone else’s numbers. Two or three short sessions a week beats one monster session then nothing.";
      }

      if (
        t.includes("diet") ||
        t.includes("food") ||
        t.includes("eat") ||
        t.includes("eating")
      ) {
        return "Diet tweaks: more protein, more veg, enough water, slightly smaller portions of the heavy stuff. No magic – just boring consistency that still fits your life.";
      }

      if (
        t.includes("tired") ||
        t.includes("exhausted") ||
        t.includes("no energy") ||
        t.includes("burnt out") ||
        t.includes("burned out")
      ) {
        return "If you’re constantly wiped out, the goal isn’t ‘beast mode’ – it’s gentle movement, more rest, and checking basics like sleep and food. Overtraining when you’re already exhausted just makes everything worse.";
      }

      return "Prototype Fit brain: I’m here for realistic tweaks, not six-pack fantasies. Tell me your goal in one sentence and how many days a week you can honestly give this.";
    },

    gamer(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Gamer Mode. Tell me what you’re playing, how long you’ve been on, and whether you want overlays, focus, or breaks.";
      }
      if (t.includes("overlay") || t.includes("hud") || t.includes("ui")) {
        return "Overlay thinking: keep it clean and readable. Only show what matters in the moment – health, objective, and maybe one progress bar – not the whole spreadsheet.";
      }
      if (
        t.includes("break") ||
        t.includes("too long") ||
        t.includes("addicted") ||
        t.includes("no life")
      ) {
        return "If you’ve been glued to the screen for ages, try a ‘one more round, then stand up’ rule. Stand, stretch, water, quick reset – then decide if you actually want another game.";
      }
      if (
        t.includes("competitive") ||
        t.includes("ranked") ||
        t.includes("tilt")
      ) {
        return "Ranked and tilt: pick one small improvement per session – calmer comms, better crosshair placement – instead of obsessing over rank jumps every night.";
      }
      return "Prototype Gamer brain: I’m here to balance immersion with comfort, focus, and breaks – not to lecture you about never playing games.";
    },

    artist(text) {
      const t = normalise(text);
      if (!t) {
        return "This is the GRACE-X Artist / Studio brain. Tell me what you want to create – logo, thumbnail, intro, or full scene – and the vibe you’re going for.";
      }
      if (t.includes("logo") || t.includes("branding")) {
        return "Branding: pick 2–3 core colours, one main font, and one accent. Tell me the mood – clean, playful, cinematic, techy – and who it’s for.";
      }
      if (t.includes("thumbnail") || t.includes("youtube") || t.includes("tiktok")) {
        return "Thumbnails: one strong face or icon, 2–4 words max, and a clear contrast between foreground and background. No tiny text nobody can read on a phone.";
      }
      if (t.includes("animation") || t.includes("intro") || t.includes("motion")) {
        return "Intros and motion: keep it short – 5–10 seconds – and make sure logo, tagline, and channel identity are clear by the halfway mark.";
      }
      return "Prototype Artist brain: I’ll help you think in terms of mood, contrast, and clarity so your visuals read quickly on tiny screens.";
    },

    beauty(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Beauty. Tell me your skin type in simple words, what look you’re aiming for, and whether it’s day-to-day or a special event.";
      }
      if (t.includes("foundation") || t.includes("base")) {
        return "Base: match to your neck rather than your hand, and build thin layers instead of one heavy coat. Soft edges around jaw and hairline keep it natural.";
      }
      if (t.includes("eyes") || t.includes("eyeliner") || t.includes("mascara") || t.includes("shadow")) {
        return "Eyes: pick one focus – liner, lashes, or colour – not all three at full blast. Tell me if you want soft, everyday, or sharp and dramatic.";
      }
      if (t.includes("hair")) {
        return "Hair: tell me your length, texture, and how much effort you’ll honestly put in. We can pick 1–2 simple go‑to styles you can repeat without stress.";
      }
      return "Prototype Beauty brain: I can offer general style nudges, but I’m not a dermatologist or doctor. If you’ve got skin or health concerns, talk to a professional.";
    },

    accounting(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Accounting. Tell me if you’re tracking income, expenses, or getting ready for tax time, and whether it’s personal or for a business.";
      }
      if (t.includes("receipt") || t.includes("receipts") || t.includes("expenses")) {
        return "Expenses: keep every receipt, tag it with a simple category (travel, materials, software, etc.), and note what job or client it relates to.";
      }
      if (t.includes("invoice") || t.includes("invoices")) {
        return "Invoices: each one needs a date, description of work, your details, client details, amount, and payment terms. Keep them numbered in order.";
      }
      if (t.includes("tax") || t.includes("hmrc") || t.includes("return")) {
        return "Tax and HMRC: log all income and all business costs cleanly, and keep records for the years required in your country. For anything complex, get an accountant – I’m not a substitute for professional advice.";
      }
      return "Prototype Accounting brain: I can help you think about tidy records, categories, and habits – but not give formal tax, legal, or financial advice.";
    },

    osint(text) {
      const t = normalise(text);
      if (!t) {
        return "This is the GRACE-X OSINT prototype. I’m here for legal, white-hat thinking about open‑source information – not hacking, breaking into systems, or anything shady.";
      }
      if (t.includes("recon") || t.includes("reconnaissance") || t.includes("footprinting")) {
        return "OSINT recon: start with what’s public – official websites, company filings, news, social profiles – and keep a log of where each piece of information came from.";
      }
      if (t.includes("illegal") || t.includes("hack") || t.includes("exploit") || t.includes("breach")) {
        return "I can’t help with hacking, exploiting, or breaking into anything. This module is strictly for ethical, legal information gathering and learning.";
      }
      if (t.includes("training") || t.includes("learn") || t.includes("course")) {
        return "For OSINT learning, focus on: how to search effectively, how to verify sources, and how to respect privacy and the law. Think like a careful investigator, not a criminal.";
      }
      return "Prototype OSINT brain: I’m here to organise your thinking around open, legal sources and basic analysis – anything beyond that needs proper professional, ethical training.";
    },

    yoga(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Yoga. Tell me if you want to loosen up, calm down, or reset after sitting too long, and roughly how your body feels right now.";
      }
      if (t.includes("desk") || t.includes("sitting") || t.includes("hunched")) {
        return "Desk reset: think gentle neck rolls, shoulder circles, and opening the chest. Nothing forced – just slow movements within a comfortable range.";
      }
      if (t.includes("stress") || t.includes("stressed") || t.includes("anxious") || t.includes("panic")) {
        return "Stress lane: slow the breath first – in for 4, hold for 4, out for 6 – then add simple forward folds or child's pose if they feel okay for your body.";
      }
      if (t.includes("back") || t.includes("hips") || t.includes("tight")) {
        return "For tight backs and hips, gentle cat‑cow movements and easy hip openers can help, as long as there's no sharp pain. If something hurts, back off immediately.";
      }
      return "Prototype Yoga brain: I can suggest light, general movements and breath ideas, but I'm not a physio or doctor. If you're injured or unsure, get proper medical advice first.";
    },

    sport(text) {
      const t = normalise(text);
      if (!t) {
        return "This is GRACE-X Sport. Tell me what you want to know – match predictions, team analysis, player stats, or betting insights for any sport.";
      }
      if (t.includes("predict") || t.includes("prediction") || t.includes("winner") || t.includes("who will win")) {
        return "For predictions, I look at form, head-to-head records, and recent performances. Tell me the specific match or event and I'll give you my analysis.";
      }
      if (t.includes("football") || t.includes("premier league") || t.includes("soccer")) {
        return "Football analysis: form tables, goal stats, injury reports, and home/away records all factor in. Which match or team do you want me to break down?";
      }
      if (t.includes("horse") || t.includes("racing") || t.includes("cheltenham") || t.includes("ascot")) {
        return "Horse racing: I look at form guides, going conditions, trainer/jockey combos, and course history. Tell me the race and I'll share what the data suggests.";
      }
      if (t.includes("basketball") || t.includes("nba") || t.includes("lakers") || t.includes("celtics")) {
        return "NBA analysis: points per game, defensive ratings, and rest days matter. Which game or team are you interested in?";
      }
      if (t.includes("f1") || t.includes("formula") || t.includes("racing")) {
        return "F1 insights: qualifying pace, tyre strategies, and track history are key. Tell me the race weekend and I'll give you my take.";
      }
      if (t.includes("bet") || t.includes("odds") || t.includes("accumulator") || t.includes("acca")) {
        return "Betting insight: always gamble responsibly. I can analyse odds value and probabilities, but remember – there's no such thing as a guaranteed bet.";
      }
      return "Prototype Sport brain: I can help with match analysis, predictions, and sports data. Tell me the sport, team, or event you're interested in.";
    },

    guardian(text) {
      const t = normalise(text);
      
      // Crisis detection (highest priority)
      const crisisKeywords = ['suicide', 'kill myself', 'end it', 'hurt myself', 'self harm', 'want to die'];
      for (const keyword of crisisKeywords) {
        if (t.includes(keyword)) {
          return "I'm really concerned about what you've shared. Please reach out for support now: Samaritans: 116 123 (free, 24/7), Emergency: 999 if you're in immediate danger. These services are confidential and won't judge you. I'm an AI and can't keep you safe the way real people can.";
        }
      }
      
      if (!t) {
        return "I'm Guardian, the safety and protection AI within GRACE-X. I can help with safeguarding concerns, online safety, crisis support, and threat awareness. What would you like help with?";
      }
      if (t.includes("child") || t.includes("kid") || t.includes("son") || t.includes("daughter")) {
        return "Child safety is my priority. I can help with: online safety settings, recognising warning signs, having age-appropriate conversations about safety, and when to involve professionals. What specific area concerns you?";
      }
      if (t.includes("online") || t.includes("internet") || t.includes("social media")) {
        return "Online safety basics: Use strong unique passwords, enable 2FA where possible, be cautious about what you share, verify who you're talking to, and remember that screenshots can be shared. What specific online safety topic would you like to discuss?";
      }
      if (t.includes("emergency") || t.includes("help") || t.includes("danger")) {
        return "UK Emergency Contacts: 999 – Police, Fire, Ambulance (immediate danger). 101 – Non-emergency police. 116 123 – Samaritans (24/7 emotional support). 0800 1111 – Childline (under 18s). If you're in immediate danger, call 999 now.";
      }
      if (t.includes("report") || t.includes("concern") || t.includes("worried")) {
        return "I hear you. When something doesn't feel right, it's important to talk about it. Can you tell me more about what's concerning you? I'll help you figure out the right next step.";
      }
      if (t.includes("grooming") || t.includes("manipulation") || t.includes("secret")) {
        return "If someone is asking you to keep secrets, meet alone, or share pictures, that's a serious red flag. Childline: 0800 1111 (confidential). CEOP: ceop.police.uk (report online concerns). You haven't done anything wrong – talking about it breaks their power.";
      }
      return "I'm Guardian, here for your safety. I can help with safeguarding concerns, online safety, crisis support, threat awareness, and connecting you with the right services. What's on your mind?";
    },

};

  // [V2 WIRING] Expose brains via window.moduleBrains so modules can call upliftBrainV2 etc.
  window.moduleBrains = window.moduleBrains || {};
  Object.keys(brains).forEach(function (id) {
    if (typeof brains[id] === "function") {
      // If not already present, wrap as { handle(text) }
      if (!window.moduleBrains[id]) {
        window.moduleBrains[id] = {
          handle: function (text) {
            return brains[id](text || "");
          }
        };
      } else if (!window.moduleBrains[id].handle && typeof window.moduleBrains[id] === "function") {
        // If someone put the raw function in already, normalise it
        var fn = window.moduleBrains[id];
        window.moduleBrains[id] = {
          handle: function (text) {
            return fn(text || "");
          }
        };
      }
    }
  });

  window.runModuleBrain = function (moduleId, text) {
    const id = (moduleId || "").toLowerCase();
    const brain = brains[id];
    if (!brain) {
      return "Prototype brain here. This module hasn't had its full intelligence trained yet – Zac will be teaching me more.";
    }
    try {
      const result = brain(text || "");
      // If brain returns a Promise (Level 5), return it; otherwise return the string
      return result instanceof Promise ? result : Promise.resolve(result);
    } catch (err) {
      console.warn("runModuleBrain error for", id, err);
      return Promise.resolve("Something glitched in my prototype brain – try rephrasing that or nudging me in simpler words.");
    }
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTIVITY HUB - COMPREHENSIVE DEVICE INTEGRATION (via Core)
// Bluetooth, Serial, USB, Gamepad, MIDI, Location, Sensors
// ═══════════════════════════════════════════════════════════════════════════

// Device state
let bluetoothDevice = null;
let bluetoothServer = null;
let serialPort = null;
let serialReader = null;
let serialWriter = null;
let usbDevice = null;
let gamepadInterval = null;
let midiAccess = null;
let locationWatchId = null;
let sensorsEnabled = false;

function initCoreConnectivity() {
  // Wire up quick module buttons
  document.querySelectorAll('.quick-module-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const moduleId = btn.dataset.module;
      if (moduleId) {
        window.location.hash = '#/' + moduleId;
      }
    });
  });

  // Wire up export chat button
  const exportBtn = document.getElementById('core-brain-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCoreChat);
  }

  // Check API support and render badges
  checkAPISupport();

  // Initialize connectivity tabs
  initConnectivityTabs();

  // Initialize all connection types
  initBluetoothUI();
  initSerialUI();
  initUSBUI();
  initGamepadUI();
  initMIDIUI();
  initLocationUI();
  initSensorsUI();
  initNetworkUI();

  // Update status displays
  updateNetworkStatus();
  updateAPIStatus();
  
  // Monitor network changes
  if (navigator.connection) {
    navigator.connection.addEventListener('change', updateNetworkStatus);
  }
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Monitor gamepads
  window.addEventListener('gamepadconnected', onGamepadConnected);
  window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

  console.log('[GRACEX Core] Connectivity Hub initialized');
}

document.addEventListener('DOMContentLoaded', function() {
  initNetworkSettingsUI();
});
function initNetworkSettingsUI() {
  const ssid = document.getElementById('net-ssid');
  const pwd = document.getElementById('net-password');
  const pwdShow = document.getElementById('net-password-show');
  const proxy = document.getElementById('net-proxy');
  const api = document.getElementById('net-api-endpoint');
  const status = document.getElementById('net-settings-status');
  const badge = document.getElementById('net-settings-badge');
  const openBtn = document.getElementById('net-open-settings-btn');
  const testBtn = document.getElementById('net-test-btn');
  const saveBtn = document.getElementById('net-save-btn');
  const saved = JSON.parse(localStorage.getItem('gracex.network') || '{}');
  if (ssid && saved.ssid) ssid.value = saved.ssid;
  if (pwd && saved.password) pwd.value = saved.password;
  if (proxy && saved.proxy) proxy.value = saved.proxy;
  if (api && (saved.apiEndpoint || window.GRACEX_BRAIN_API)) {
    api.value = saved.apiEndpoint || window.GRACEX_BRAIN_API;
  }
  if (pwdShow && pwd) {
    pwdShow.onchange = function() {
      pwd.type = pwdShow.checked ? 'text' : 'password';
    };
  }
  function updateBadge() {
    if (!badge) return;
    if (navigator.onLine) {
      badge.textContent = '🟢 Online';
    } else {
      badge.textContent = '🔴 Offline';
    }
  }
  updateBadge();
  if (openBtn) {
    openBtn.onclick = function() {
      let opened = false;
      try { window.open('ms-settings:network', '_blank'); opened = true; } catch(e) {}
      if (!opened) {
        if (status) status.textContent = 'Open your OS network settings to configure Wi‑Fi.';
      }
    };
  }
  if (testBtn) {
    testBtn.onclick = async function() {
      if (status) status.textContent = 'Testing...';
      try {
        const base = (api && api.value) ? api.value : (window.GRACEX_BRAIN_API || 'http://localhost:3000/api/brain');
        const healthUrl = base.replace('/api/brain', '/health');
        const netUrl = base.replace('/api/brain', '/net/status');
        let ok = false;
        try {
          const resp = await fetch(healthUrl, { method: 'GET' });
          if (resp.ok) {
            const data = await resp.json().catch(() => ({}));
            status.textContent = data.status === 'ok' ? 'Connected' : 'Degraded';
            ok = data.status === 'ok';
          } else {
            status.textContent = 'Error ' + resp.status;
          }
        } catch (_) {}
        if (!ok) {
          const resp2 = await fetch(netUrl, { method: 'GET' }).catch(() => null);
          if (resp2 && resp2.ok) {
            const data2 = await resp2.json().catch(() => ({}));
            const dnsOk = data2.dns && (data2.dns.openai || data2.dns.google);
            const httpsOk = data2.https && data2.https.google;
            status.textContent = (dnsOk || httpsOk) ? 'Online (API unreachable)' : 'Offline';
          } else {
            status.textContent = navigator.onLine ? 'API Unreachable' : 'Offline';
          }
        }
      } catch (e) {
        status.textContent = navigator.onLine ? 'API Unreachable' : 'Offline';
      }
    };
  }
  if (saveBtn) {
    saveBtn.onclick = function() {
      const payload = {
        ssid: ssid ? ssid.value.trim() : '',
        password: pwd ? pwd.value : '',
        proxy: proxy ? proxy.value.trim() : '',
        apiEndpoint: api ? api.value.trim() : ''
      };
      localStorage.setItem('gracex.network', JSON.stringify(payload));
      if (payload.apiEndpoint) {
        window.GRACEX_BRAIN_API = payload.apiEndpoint;
      }
      if (status) status.textContent = 'Saved';
    };
  }
  window.addEventListener('online', updateBadge);
  window.addEventListener('offline', updateBadge);
}
// ═══════════════════════════════════════════════════════════════════════════
// API SUPPORT CHECK
// ═══════════════════════════════════════════════════════════════════════════
function checkAPISupport() {
  const grid = document.getElementById('api-support-grid');
  if (!grid) return;

  const apis = [
    { name: 'Bluetooth', supported: !!navigator.bluetooth, icon: '📶' },
    { name: 'Serial', supported: !!navigator.serial, icon: '🔌' },
    { name: 'USB', supported: !!navigator.usb, icon: '🔗' },
    { name: 'Gamepad', supported: 'getGamepads' in navigator, icon: '🎮' },
    { name: 'MIDI', supported: !!navigator.requestMIDIAccess, icon: '🎹' },
    { name: 'Geolocation', supported: !!navigator.geolocation, icon: '📍' },
    { name: 'DeviceOrientation', supported: 'DeviceOrientationEvent' in window, icon: '📐' },
    { name: 'Battery', supported: 'getBattery' in navigator, icon: '🔋' },
    { name: 'Network Info', supported: !!navigator.connection, icon: '📡' },
    { name: 'Clipboard', supported: !!navigator.clipboard, icon: '📋' },
    { name: 'Share', supported: !!navigator.share, icon: '📤' },
    { name: 'Vibration', supported: 'vibrate' in navigator, icon: '📳' }
  ];

  grid.innerHTML = apis.map(api => `
    <div class="api-badge ${api.supported ? 'api-supported' : 'api-unsupported'}" title="${api.name}: ${api.supported ? 'Available' : 'Not Available'}">
      <span>${api.icon}</span>
      <span>${api.name}</span>
      <span class="api-status">${api.supported ? '✓' : '✗'}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTIVITY TABS
// ═══════════════════════════════════════════════════════════════════════════
function initConnectivityTabs() {
  document.querySelectorAll('.conn-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.conn-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding content
      document.querySelectorAll('.conn-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const contentEl = document.getElementById('tab-' + tabId);
      if (contentEl) contentEl.classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BLUETOOTH
// ═══════════════════════════════════════════════════════════════════════════
function initBluetoothUI() {
  const scanBtn = document.getElementById('bluetooth-scan-btn');
  const disconnectBtn = document.getElementById('bluetooth-disconnect-btn');
  
  if (scanBtn) scanBtn.addEventListener('click', scanBluetoothDevices);
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectBluetooth);
}

// ═══════════════════════════════════════════════════════════════════════════
// SERIAL PORT (Arduino, Microcontrollers)
// ═══════════════════════════════════════════════════════════════════════════
function initSerialUI() {
  const connectBtn = document.getElementById('serial-connect-btn');
  const disconnectBtn = document.getElementById('serial-disconnect-btn');
  const sendBtn = document.getElementById('serial-send-btn');
  const input = document.getElementById('serial-input');

  if (connectBtn) connectBtn.addEventListener('click', connectSerialDevice);
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectSerialDevice);
  if (sendBtn) sendBtn.addEventListener('click', sendSerialData);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendSerialData();
    });
  }
}

async function connectSerialDevice() {
  if (!navigator.serial) {
    if (window.GXToast) GXToast.error('Not Supported', 'Web Serial API not available');
    return;
  }

  try {
    serialPort = await navigator.serial.requestPort();
    const baudRate = parseInt(document.getElementById('serial-baud')?.value || '115200');
    await serialPort.open({ baudRate });

    // Update UI
    document.getElementById('serial-connect-btn').style.display = 'none';
    document.getElementById('serial-disconnect-btn').style.display = 'inline-block';
    document.getElementById('serial-config').style.display = 'none';
    document.getElementById('serial-terminal').style.display = 'block';
    document.getElementById('serial-empty').style.display = 'none';
    
    document.getElementById('conn-serial-value').textContent = 'Connected';
    document.getElementById('conn-serial-indicator').className = 'conn-indicator conn-green';

    // Start reading
    serialReader = serialPort.readable.getReader();
    serialWriter = serialPort.writable.getWriter();
    readSerialData();

    if (window.GXToast) GXToast.success('Connected', 'Serial device ready');
  } catch (err) {
    console.log('[Serial] Connection cancelled or error:', err);
    if (err.name !== 'NotFoundError') {
      if (window.GXToast) GXToast.error('Serial Error', err.message);
    }
  }
}

async function readSerialData() {
  const output = document.getElementById('serial-output');
  const decoder = new TextDecoder();

  try {
    while (serialPort && serialPort.readable) {
      const { value, done } = await serialReader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      if (output) {
        output.innerHTML += `<div class="serial-line">${escapeHtml(text)}</div>`;
        output.scrollTop = output.scrollHeight;
      }
    }
  } catch (err) {
    console.log('[Serial] Read error:', err);
  }
}

async function sendSerialData() {
  const input = document.getElementById('serial-input');
  const output = document.getElementById('serial-output');
  if (!serialWriter || !input) return;

  const text = input.value.trim();
  if (!text) return;

  try {
    const encoder = new TextEncoder();
    await serialWriter.write(encoder.encode(text + '\n'));
    
    if (output) {
      output.innerHTML += `<div class="serial-line serial-sent">&gt; ${escapeHtml(text)}</div>`;
      output.scrollTop = output.scrollHeight;
    }
    input.value = '';
  } catch (err) {
    console.error('[Serial] Write error:', err);
  }
}

async function disconnectSerialDevice() {
  try {
    if (serialReader) {
      await serialReader.cancel();
      serialReader.releaseLock();
    }
    if (serialWriter) {
      await serialWriter.close();
    }
    if (serialPort) {
      await serialPort.close();
    }
  } catch (err) {
    console.warn('[Serial] Disconnect error:', err);
  }

  serialPort = null;
  serialReader = null;
  serialWriter = null;

  document.getElementById('serial-connect-btn').style.display = 'inline-block';
  document.getElementById('serial-disconnect-btn').style.display = 'none';
  document.getElementById('serial-terminal').style.display = 'none';
  document.getElementById('serial-empty').style.display = 'block';
  
  document.getElementById('conn-serial-value').textContent = 'Not Connected';
  document.getElementById('conn-serial-indicator').className = 'conn-indicator conn-grey';

  if (window.GXToast) GXToast.info('Disconnected', 'Serial device disconnected');
}

// ═══════════════════════════════════════════════════════════════════════════
// USB DEVICES
// ═══════════════════════════════════════════════════════════════════════════
function initUSBUI() {
  const connectBtn = document.getElementById('usb-connect-btn');
  const disconnectBtn = document.getElementById('usb-disconnect-btn');

  if (connectBtn) connectBtn.addEventListener('click', connectUSBDevice);
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectUSBDevice);
}

async function connectUSBDevice() {
  if (!navigator.usb) {
    if (window.GXToast) GXToast.error('Not Supported', 'WebUSB API not available');
    return;
  }

  try {
    usbDevice = await navigator.usb.requestDevice({ filters: [] });
    await usbDevice.open();

    // Update UI
    const info = document.getElementById('usb-device-info');
    const empty = document.getElementById('usb-empty');
    
    if (info) {
      info.style.display = 'block';
      info.innerHTML = `
        <div class="usb-device-card">
          <h5>🔗 ${usbDevice.productName || 'USB Device'}</h5>
          <div class="usb-details">
            <div><span>Manufacturer:</span> <strong>${usbDevice.manufacturerName || 'Unknown'}</strong></div>
            <div><span>Vendor ID:</span> <strong>0x${usbDevice.vendorId.toString(16).padStart(4, '0')}</strong></div>
            <div><span>Product ID:</span> <strong>0x${usbDevice.productId.toString(16).padStart(4, '0')}</strong></div>
            <div><span>Serial:</span> <strong>${usbDevice.serialNumber || 'N/A'}</strong></div>
          </div>
        </div>
      `;
    }
    if (empty) empty.style.display = 'none';

    document.getElementById('usb-connect-btn').style.display = 'none';
    document.getElementById('usb-disconnect-btn').style.display = 'inline-block';
    document.getElementById('conn-usb-value').textContent = usbDevice.productName || 'Connected';
    document.getElementById('conn-usb-indicator').className = 'conn-indicator conn-green';

    if (window.GXToast) GXToast.success('Connected', `USB: ${usbDevice.productName}`);
  } catch (err) {
    if (err.name !== 'NotFoundError') {
      if (window.GXToast) GXToast.error('USB Error', err.message);
    }
  }
}

async function disconnectUSBDevice() {
  if (usbDevice) {
    await usbDevice.close();
    usbDevice = null;
  }

  document.getElementById('usb-connect-btn').style.display = 'inline-block';
  document.getElementById('usb-disconnect-btn').style.display = 'none';
  document.getElementById('usb-device-info').style.display = 'none';
  document.getElementById('usb-empty').style.display = 'block';
  document.getElementById('conn-usb-value').textContent = 'Not Connected';
  document.getElementById('conn-usb-indicator').className = 'conn-indicator conn-grey';
}

// ═══════════════════════════════════════════════════════════════════════════
// GAMEPAD
// ═══════════════════════════════════════════════════════════════════════════
function initGamepadUI() {
  // Gamepads are detected via events
  updateGamepadList();
}

function onGamepadConnected(e) {
  console.log('[Gamepad] Connected:', e.gamepad.id);
  document.getElementById('conn-gamepad-value').textContent = e.gamepad.id.substring(0, 20) + '...';
  document.getElementById('conn-gamepad-indicator').className = 'conn-indicator conn-green';
  updateGamepadList();
  startGamepadLoop();
  if (window.GXToast) GXToast.success('Gamepad', e.gamepad.id);
}

function onGamepadDisconnected(e) {
  console.log('[Gamepad] Disconnected:', e.gamepad.id);
  document.getElementById('conn-gamepad-value').textContent = 'Not Connected';
  document.getElementById('conn-gamepad-indicator').className = 'conn-indicator conn-grey';
  updateGamepadList();
  if (window.GXToast) GXToast.info('Gamepad', 'Controller disconnected');
}

function updateGamepadList() {
  const list = document.getElementById('gamepad-list');
  const visualizer = document.getElementById('gamepad-visualizer');
  if (!list) return;

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const connected = Array.from(gamepads).filter(g => g !== null);

  if (connected.length === 0) {
    list.innerHTML = `
      <div class="conn-empty">
        <span>🎮</span>
        <p>No gamepads detected</p>
        <p class="hint">Connect a controller and press any button</p>
      </div>
    `;
    if (visualizer) visualizer.style.display = 'none';
    return;
  }

  list.innerHTML = connected.map(gp => `
    <div class="gamepad-item">
      <span>🎮</span>
      <div class="gamepad-info">
        <strong>${gp.id}</strong>
        <span class="hint">${gp.buttons.length} buttons, ${gp.axes.length} axes</span>
      </div>
    </div>
  `).join('');

  if (visualizer) visualizer.style.display = 'block';
}

function startGamepadLoop() {
  if (gamepadInterval) return;
  
  gamepadInterval = setInterval(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(gamepads).find(g => g !== null);
    if (!gp) return;

    const axesEl = document.getElementById('gamepad-axes');
    const buttonsEl = document.getElementById('gamepad-buttons');

    if (axesEl) {
      axesEl.innerHTML = gp.axes.slice(0, 4).map((val, i) => 
        `<div class="axis-bar"><span>Axis ${i}</span><div class="axis-value" style="width: ${Math.abs(val) * 50}%; margin-left: ${val < 0 ? 50 - Math.abs(val) * 50 : 50}%;"></div><span>${val.toFixed(2)}</span></div>`
      ).join('');
    }

    if (buttonsEl) {
      buttonsEl.innerHTML = gp.buttons.slice(0, 16).map((btn, i) =>
        `<div class="btn-indicator ${btn.pressed ? 'pressed' : ''}">${i}</div>`
      ).join('');
    }
  }, 50);
}

// ═══════════════════════════════════════════════════════════════════════════
// MIDI
// ═══════════════════════════════════════════════════════════════════════════
function initMIDIUI() {
  const accessBtn = document.getElementById('midi-access-btn');
  if (accessBtn) accessBtn.addEventListener('click', requestMIDIAccess);
}

async function requestMIDIAccess() {
  if (!navigator.requestMIDIAccess) {
    if (window.GXToast) GXToast.error('Not Supported', 'Web MIDI API not available');
    return;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    updateMIDIDevices();
    
    midiAccess.onstatechange = updateMIDIDevices;
    
    document.getElementById('midi-monitor').style.display = 'block';
    if (window.GXToast) GXToast.success('MIDI', 'MIDI access granted');
  } catch (err) {
    if (window.GXToast) GXToast.error('MIDI Error', err.message);
  }
}

function updateMIDIDevices() {
  const list = document.getElementById('midi-devices');
  if (!midiAccess || !list) return;

  const inputs = Array.from(midiAccess.inputs.values());
  const outputs = Array.from(midiAccess.outputs.values());

  if (inputs.length === 0 && outputs.length === 0) {
    list.innerHTML = `
      <div class="conn-empty">
        <span>🎹</span>
        <p>No MIDI devices found</p>
        <p class="hint">Connect a MIDI keyboard or controller</p>
      </div>
    `;
    return;
  }

  list.innerHTML = `
    <div class="midi-device-list">
      ${inputs.length > 0 ? `
        <h5>Inputs</h5>
        ${inputs.map(d => `<div class="midi-device">📥 ${d.name}</div>`).join('')}
      ` : ''}
      ${outputs.length > 0 ? `
        <h5>Outputs</h5>
        ${outputs.map(d => `<div class="midi-device">📤 ${d.name}</div>`).join('')}
      ` : ''}
    </div>
  `;

  // Listen to inputs
  inputs.forEach(input => {
    input.onmidimessage = onMIDIMessage;
  });
}

function onMIDIMessage(event) {
  const messages = document.getElementById('midi-messages');
  if (!messages) return;

  const [status, data1, data2] = event.data;
  const channel = status & 0x0F;
  const command = status >> 4;

  let msg = '';
  if (command === 9 && data2 > 0) msg = `Note ON: ${data1} vel:${data2}`;
  else if (command === 8 || (command === 9 && data2 === 0)) msg = `Note OFF: ${data1}`;
  else if (command === 11) msg = `CC ${data1}: ${data2}`;
  else msg = `${status.toString(16)} ${data1} ${data2}`;

  const div = document.createElement('div');
  div.className = 'midi-msg';
  div.textContent = `[CH${channel + 1}] ${msg}`;
  messages.insertBefore(div, messages.firstChild);
  
  // Keep only last 20 messages
  while (messages.children.length > 20) {
    messages.removeChild(messages.lastChild);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GEOLOCATION
// ═══════════════════════════════════════════════════════════════════════════
function initLocationUI() {
  const getBtn = document.getElementById('location-get-btn');
  const watchBtn = document.getElementById('location-watch-btn');
  const stopBtn = document.getElementById('location-stop-btn');

  if (getBtn) getBtn.addEventListener('click', getCurrentLocation);
  if (watchBtn) watchBtn.addEventListener('click', watchLocation);
  if (stopBtn) stopBtn.addEventListener('click', stopWatchingLocation);
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    if (window.GXToast) GXToast.error('Not Supported', 'Geolocation not available');
    return;
  }

  const dataEl = document.getElementById('location-data');
  if (dataEl) dataEl.innerHTML = '<div class="conn-loading">📍 Getting location...</div>';

  navigator.geolocation.getCurrentPosition(
    (pos) => updateLocationUI(pos),
    (err) => {
      if (dataEl) dataEl.innerHTML = `<div class="conn-error">❌ ${err.message}</div>`;
    },
    { enableHighAccuracy: true }
  );
}

function watchLocation() {
  if (!navigator.geolocation) return;

  document.getElementById('location-watch-btn').style.display = 'none';
  document.getElementById('location-stop-btn').style.display = 'inline-block';

  locationWatchId = navigator.geolocation.watchPosition(
    (pos) => updateLocationUI(pos),
    (err) => console.error('[Location]', err),
    { enableHighAccuracy: true }
  );
}

function stopWatchingLocation() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
  document.getElementById('location-watch-btn').style.display = 'inline-block';
  document.getElementById('location-stop-btn').style.display = 'none';
}

function updateLocationUI(position) {
  const dataEl = document.getElementById('location-data');
  if (!dataEl) return;

  const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
  
  dataEl.innerHTML = `
    <div class="location-info">
      <div class="location-row"><span>Latitude</span><strong>${latitude.toFixed(6)}°</strong></div>
      <div class="location-row"><span>Longitude</span><strong>${longitude.toFixed(6)}°</strong></div>
      <div class="location-row"><span>Accuracy</span><strong>±${accuracy.toFixed(0)}m</strong></div>
      ${altitude !== null ? `<div class="location-row"><span>Altitude</span><strong>${altitude.toFixed(1)}m</strong></div>` : ''}
      ${speed !== null ? `<div class="location-row"><span>Speed</span><strong>${(speed * 3.6).toFixed(1)} km/h</strong></div>` : ''}
      ${heading !== null ? `<div class="location-row"><span>Heading</span><strong>${heading.toFixed(0)}°</strong></div>` : ''}
      <div class="location-row"><span>Timestamp</span><strong>${new Date(position.timestamp).toLocaleTimeString()}</strong></div>
    </div>
    <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" class="builder-btn" style="margin-top: 12px;">🗺️ Open in Maps</a>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE SENSORS
// ═══════════════════════════════════════════════════════════════════════════
function initSensorsUI() {
  const enableBtn = document.getElementById('sensors-enable-btn');
  const disableBtn = document.getElementById('sensors-disable-btn');

  if (enableBtn) enableBtn.addEventListener('click', enableSensors);
  if (disableBtn) disableBtn.addEventListener('click', disableSensors);
}

function enableSensors() {
  sensorsEnabled = true;
  document.getElementById('sensors-enable-btn').style.display = 'none';
  document.getElementById('sensors-disable-btn').style.display = 'inline-block';

  // Device Orientation
  if ('DeviceOrientationEvent' in window) {
    // Check if permission is needed (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', onDeviceOrientation);
        }
      });
    } else {
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }
  }

  // Device Motion
  if ('DeviceMotionEvent' in window) {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', onDeviceMotion);
        }
      });
    } else {
      window.addEventListener('devicemotion', onDeviceMotion);
    }
  }

  // Battery Status
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      updateBatteryUI(battery);
      battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
      battery.addEventListener('levelchange', () => updateBatteryUI(battery));
    });
  }

  if (window.GXToast) GXToast.success('Sensors', 'Device sensors enabled');
}

function disableSensors() {
  sensorsEnabled = false;
  document.getElementById('sensors-enable-btn').style.display = 'inline-block';
  document.getElementById('sensors-disable-btn').style.display = 'none';

  window.removeEventListener('deviceorientation', onDeviceOrientation);
  window.removeEventListener('devicemotion', onDeviceMotion);
}

function onDeviceOrientation(e) {
  if (!sensorsEnabled) return;
  const alphaEl = document.getElementById('sensor-alpha');
  const betaEl = document.getElementById('sensor-beta');
  const gammaEl = document.getElementById('sensor-gamma');
  if (alphaEl) alphaEl.textContent = e.alpha ? e.alpha.toFixed(1) + '°' : '--';
  if (betaEl) betaEl.textContent = e.beta ? e.beta.toFixed(1) + '°' : '--';
  if (gammaEl) gammaEl.textContent = e.gamma ? e.gamma.toFixed(1) + '°' : '--';
}

function onDeviceMotion(e) {
  if (!sensorsEnabled || !e.acceleration) return;
  const axEl = document.getElementById('sensor-accel-x');
  const ayEl = document.getElementById('sensor-accel-y');
  const azEl = document.getElementById('sensor-accel-z');
  if (axEl) axEl.textContent = e.acceleration.x ? e.acceleration.x.toFixed(2) : '--';
  if (ayEl) ayEl.textContent = e.acceleration.y ? e.acceleration.y.toFixed(2) : '--';
  if (azEl) azEl.textContent = e.acceleration.z ? e.acceleration.z.toFixed(2) : '--';
}

function updateBatteryUI(battery) {
  const levelEl = document.getElementById('sensor-battery-level');
  const chargingEl = document.getElementById('sensor-battery-charging');
  const timeEl = document.getElementById('sensor-battery-time');
  if (levelEl) levelEl.textContent = Math.round(battery.level * 100) + '%';
  if (chargingEl) chargingEl.textContent = battery.charging ? '⚡ Yes' : 'No';
  if (timeEl) timeEl.textContent = battery.chargingTime === Infinity ? '--' : Math.round(battery.chargingTime / 60) + ' min';
}

// ═══════════════════════════════════════════════════════════════════════════
// NETWORK
// ═══════════════════════════════════════════════════════════════════════════
function initNetworkUI() {
  const speedTestBtn = document.getElementById('network-speed-test-btn');
  if (speedTestBtn) speedTestBtn.addEventListener('click', runSpeedTest);
}

async function runSpeedTest() {
  const resultsEl = document.getElementById('speed-test-results');
  const downloadEl = document.getElementById('speed-download');
  const latencyEl = document.getElementById('speed-latency');
  
  if (resultsEl) resultsEl.style.display = 'block';
  if (downloadEl) downloadEl.textContent = 'Testing...';
  if (latencyEl) latencyEl.textContent = 'Testing...';

  // Latency test
  const latencyStart = performance.now();
  try {
    await fetch(window.GRACEX_BRAIN_API || 'http://localhost:3000/api/brain', { method: 'HEAD', mode: 'no-cors' });
  } catch (e) {}
  const latency = Math.round(performance.now() - latencyStart);
  if (latencyEl) latencyEl.textContent = latency + ' ms';

  // Download speed estimate (using Network Info API if available)
  const conn = navigator.connection;
  if (conn && conn.downlink) {
    if (downloadEl) downloadEl.textContent = conn.downlink + ' Mbps';
  } else {
    if (downloadEl) downloadEl.textContent = 'N/A';
  }

  if (window.GXToast) GXToast.info('Speed Test', `Latency: ${latency}ms`);
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function exportCoreChat() {
  const output = document.getElementById('core-brain-output');
  if (!output) return;

  const messages = [];
  output.querySelectorAll('.brain-message').forEach(msg => {
    const role = msg.classList.contains('brain-message-user') ? 'You' : 'GRACE';
    messages.push(`[${role}] ${msg.textContent}`);
  });

  if (messages.length === 0) {
    if (window.GXToast) GXToast.info('Empty', 'No conversation to export');
    return;
  }

  const text = `GRACE-X Core Chat Export\n${new Date().toLocaleString()}\n${'='.repeat(40)}\n\n${messages.join('\n\n')}`;
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gracex-core-chat-' + Date.now() + '.txt';
  a.click();
  URL.revokeObjectURL(url);

  if (window.GXToast) GXToast.success('Exported', 'Chat saved to file');
}

function updateNetworkStatus() {
  const indicator = document.getElementById('conn-network-indicator');
  const value = document.getElementById('conn-network-value');
  const typeEl = document.getElementById('network-type');
  const effectiveEl = document.getElementById('network-effective');
  const downlinkEl = document.getElementById('network-downlink');
  const rttEl = document.getElementById('network-rtt');
  const saverEl = document.getElementById('network-saver');

  const online = navigator.onLine;
  
  if (indicator) {
    indicator.className = 'conn-indicator ' + (online ? 'conn-green' : 'conn-red');
  }
  if (value) {
    value.textContent = online ? 'Online' : 'Offline';
  }

  // Network Information API (if supported)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    if (typeEl) typeEl.textContent = conn.type || 'Unknown';
    if (effectiveEl) effectiveEl.textContent = conn.effectiveType || '--';
    if (downlinkEl) downlinkEl.textContent = conn.downlink ? conn.downlink + ' Mbps' : '--';
    if (rttEl) rttEl.textContent = conn.rtt ? conn.rtt + ' ms' : '--';
    if (saverEl) saverEl.textContent = conn.saveData ? 'Enabled' : 'Disabled';
  } else {
    if (typeEl) typeEl.textContent = 'N/A';
    if (effectiveEl) effectiveEl.textContent = 'N/A';
    if (downlinkEl) downlinkEl.textContent = 'N/A';
    if (rttEl) rttEl.textContent = 'N/A';
    if (saverEl) saverEl.textContent = 'N/A';
  }
}

async function updateAPIStatus() {
  const indicator = document.getElementById('conn-api-indicator');
  const value = document.getElementById('conn-api-value');

  // Prefer a lightweight health ping over a full brain call
  try {
    const base = window.GRACEX_BRAIN_API || 'http://localhost:3000/api/brain';
    const healthUrl = base.replace('/api/brain', '/health');
    const resp = await fetch(healthUrl, { method: 'GET' });
    if (resp.ok) {
      const data = await resp.json().catch(() => ({}));
      const healthy = data && data.status === 'ok';
      if (indicator) indicator.className = 'conn-indicator ' + (healthy ? 'conn-green' : 'conn-yellow');
      if (value) value.textContent = healthy ? 'Connected' : 'Degraded';
      return;
    }
    if (indicator) indicator.className = 'conn-indicator conn-yellow';
    if (value) value.textContent = 'Error ' + resp.status;
  } catch (err) {
    if (indicator) indicator.className = 'conn-indicator conn-red';
    if (value) value.textContent = navigator.onLine ? 'API Unreachable' : 'Offline';
  }
}

async function scanBluetoothDevices() {
  const devicesList = document.getElementById('bluetooth-devices-list');
  const disconnectBtn = document.getElementById('bluetooth-disconnect-btn');
  const indicator = document.getElementById('conn-bluetooth-indicator');
  const value = document.getElementById('conn-bluetooth-value');

  // Check if Web Bluetooth API is supported
  if (!navigator.bluetooth) {
    if (window.GXToast) {
      GXToast.error('Not Supported', 'Bluetooth is not available in this browser. Try Chrome on HTTPS.');
    }
    return;
  }

  try {
    // Show scanning state
    if (devicesList) {
      devicesList.innerHTML = `
        <div class="bluetooth-scanning">
          <span class="scanning-spinner">🔍</span>
          <p>Scanning for devices...</p>
        </div>
      `;
    }

    // Request a Bluetooth device with common services
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      // Accept all devices for maximum compatibility
      acceptAllDevices: true,
      optionalServices: [
        'heart_rate',
        'battery_service',
        'device_information',
        'health_thermometer',
        'weight_scale',
        'generic_access',
        'generic_attribute'
      ]
    });

    // Connect to the device
    bluetoothDevice.addEventListener('gattserverdisconnected', onBluetoothDisconnected);
    
    if (value) value.textContent = bluetoothDevice.name || 'Device Connected';
    if (indicator) indicator.className = 'conn-indicator conn-green';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-block';

    // Try to connect to GATT server
    try {
      bluetoothServer = await bluetoothDevice.gatt.connect();
      
      // Get device info
      const deviceInfo = {
        name: bluetoothDevice.name || 'Unknown Device',
        id: bluetoothDevice.id,
        connected: bluetoothDevice.gatt.connected
      };

      // Try to read available services
      const services = await bluetoothServer.getPrimaryServices();
      deviceInfo.services = services.map(s => s.uuid);

      updateBluetoothDeviceUI(deviceInfo);
      
      if (window.GXToast) {
        GXToast.success('Connected!', `Paired with ${deviceInfo.name}`);
      }

      // Try to read specific data based on available services
      for (const service of services) {
        await readBluetoothServiceData(service);
      }

    } catch (connErr) {
      console.warn('[Bluetooth] GATT connection error:', connErr);
      updateBluetoothDeviceUI({
        name: bluetoothDevice.name || 'Unknown Device',
        id: bluetoothDevice.id,
        connected: false,
        error: 'Could not read device data'
      });
    }

  } catch (err) {
    console.log('[Bluetooth] User cancelled or error:', err.message);
    
    if (err.name === 'NotFoundError') {
      // User cancelled the picker
      if (devicesList) {
        devicesList.innerHTML = `
          <div class="bluetooth-empty">
            <span>📵</span>
            <p>No device selected</p>
            <p class="hint">Click "Scan for Devices" to try again</p>
          </div>
        `;
      }
    } else {
      if (window.GXToast) {
        GXToast.warning('Bluetooth', err.message || 'Could not connect');
      }
      if (devicesList) {
        devicesList.innerHTML = `
          <div class="bluetooth-empty">
            <span>⚠️</span>
            <p>Connection failed</p>
            <p class="hint">${err.message || 'Try again'}</p>
          </div>
        `;
      }
    }
  }
}

async function readBluetoothServiceData(service) {
  const serviceUUID = service.uuid;
  
  try {
    const characteristics = await service.getCharacteristics();
    
    for (const char of characteristics) {
      if (char.properties.read) {
        try {
          const value = await char.readValue();
          console.log(`[Bluetooth] ${serviceUUID} / ${char.uuid}:`, new Uint8Array(value.buffer));
          
          // Handle specific characteristics
          if (char.uuid.includes('2a37')) {
            // Heart Rate Measurement
            const heartRate = value.getUint8(1);
            updateBluetoothDataUI('heart_rate', heartRate + ' BPM');
          } else if (char.uuid.includes('2a19')) {
            // Battery Level
            const battery = value.getUint8(0);
            updateBluetoothDataUI('battery', battery + '%');
          }
        } catch (readErr) {
          // Some characteristics may not be readable
        }
      }
      
      // Set up notifications for real-time data
      if (char.properties.notify) {
        try {
          await char.startNotifications();
          char.addEventListener('characteristicvaluechanged', (event) => {
            const val = event.target.value;
            if (char.uuid.includes('2a37')) {
              const heartRate = val.getUint8(1);
              updateBluetoothDataUI('heart_rate', heartRate + ' BPM');
            }
          });
        } catch (notifyErr) {
          // Notifications may not be available
        }
      }
    }
  } catch (err) {
    console.warn('[Bluetooth] Could not read service:', serviceUUID, err);
  }
}

function updateBluetoothDeviceUI(deviceInfo) {
  const devicesList = document.getElementById('bluetooth-devices-list');
  if (!devicesList) return;

  devicesList.innerHTML = `
    <div class="bluetooth-device connected">
      <div class="device-header">
        <span class="device-icon">📱</span>
        <div class="device-info">
          <strong class="device-name">${deviceInfo.name}</strong>
          <span class="device-id">${deviceInfo.id ? deviceInfo.id.substring(0, 8) + '...' : ''}</span>
        </div>
        <span class="device-status ${deviceInfo.connected ? 'status-connected' : 'status-error'}">
          ${deviceInfo.connected ? '✓ Connected' : '⚠️ Limited'}
        </span>
      </div>
      ${deviceInfo.error ? `<p class="device-error hint">${deviceInfo.error}</p>` : ''}
      <div class="device-data" id="bluetooth-device-data">
        <!-- Real-time data will appear here -->
      </div>
      ${deviceInfo.services && deviceInfo.services.length > 0 ? `
        <div class="device-services">
          <span class="hint">Services: ${deviceInfo.services.length} found</span>
        </div>
      ` : ''}
    </div>
  `;
}

function updateBluetoothDataUI(type, value) {
  const dataContainer = document.getElementById('bluetooth-device-data');
  if (!dataContainer) return;

  let dataRow = dataContainer.querySelector(`[data-type="${type}"]`);
  if (!dataRow) {
    dataRow = document.createElement('div');
    dataRow.className = 'bluetooth-data-row';
    dataRow.dataset.type = type;
    dataContainer.appendChild(dataRow);
  }

  const labels = {
    heart_rate: '❤️ Heart Rate',
    battery: '🔋 Battery',
    steps: '👟 Steps',
    temperature: '🌡️ Temperature',
    weight: '⚖️ Weight'
  };

  dataRow.innerHTML = `
    <span class="data-label">${labels[type] || type}</span>
    <strong class="data-value">${value}</strong>
  `;
}

function onBluetoothDisconnected(event) {
  console.log('[Bluetooth] Device disconnected:', event.target.name);
  
  const indicator = document.getElementById('conn-bluetooth-indicator');
  const value = document.getElementById('conn-bluetooth-value');
  const disconnectBtn = document.getElementById('bluetooth-disconnect-btn');
  const devicesList = document.getElementById('bluetooth-devices-list');

  if (indicator) indicator.className = 'conn-indicator conn-grey';
  if (value) value.textContent = 'Disconnected';
  if (disconnectBtn) disconnectBtn.style.display = 'none';
  if (devicesList) {
    devicesList.innerHTML = `
      <div class="bluetooth-empty">
        <span>📵</span>
        <p>Device disconnected</p>
        <p class="hint">Click "Scan for Devices" to reconnect</p>
      </div>
    `;
  }

  bluetoothDevice = null;
  bluetoothServer = null;

  if (window.GXToast) {
    GXToast.info('Disconnected', 'Bluetooth device disconnected');
  }
}

function disconnectBluetooth() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    onBluetoothDisconnected({ target: { name: 'Device' } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL FLAGS (Kids Present, etc.)
// ═══════════════════════════════════════════════════════════════════════════
window.GRACEX_FLAGS = window.GRACEX_FLAGS || {
  kidsPresent: false,
  parentalMode: false
};

// ------------------------------
// DOM Ready
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  try {
  initCoreShell();
  initCoreVoice();
  initCoreConnectivity();
  // Chat + voice are re-wired when Core module is loaded via the SPA router.
  } catch (err) {
    console.error("[GRACEX CORE] Initialization error:", err);
    // Ensure boot screen is visible even if init fails
    const boot = document.getElementById("boot");
    const app = document.getElementById("app");
    if (boot) boot.style.display = "grid";
    if (app) app.style.display = "none";
  }
});

// Re-initialize connectivity when Core module is loaded via router
document.addEventListener('gracex:module:loaded', (event) => {
  if (event.detail && event.detail.module === 'core') {
    setTimeout(() => {
      initCoreConnectivity();
      updateNetworkStatus();
      updateAPIStatus();
    }, 100);
  }
});

// Also try to initialize if DOM is already loaded (for edge cases)
if (document.readyState === "loading") {
  // DOMContentLoaded will fire
} else {
  // DOM already loaded, initialize immediately
  try {
    initCoreShell();
    initCoreVoice();
  } catch (err) {
    console.error("[GRACEX CORE] Immediate initialization error:", err);
  }
}
// ═══════════════════════════════════════════════════════════════════════
// BULLETPROOF: Boot Guard + Error Overlay (Lightweight)
// BUILD: ZGV6_19.12.25.7_ANCHOR_LIVE_DATA_PATCH
// Engineered & Copyrighted by Zac Crockett
// ═════════════════════════════════════════════════════════════════════==
(function(){
  try {
    window.GRACEX_BUILD_ID = "ZGV6_19.12.25.6_BULLETPROOF_SWEEP";
    if (window.__GRACEX_BOOT_GUARD__) return;
    window.__GRACEX_BOOT_GUARD__ = true;

    function ensureOverlay() {
      let el = document.getElementById('gracex-error-overlay');
      if (el) return el;
      el = document.createElement('div');
      el.id = 'gracex-error-overlay';
      el.style.cssText = [
        'position:fixed','inset:0','z-index:99999','display:none',
        'background:rgba(0,0,0,0.92)','color:#fff','padding:16px',
        'font-family:system-ui,Segoe UI,Arial,sans-serif','overflow:auto'
      ].join(';');
      el.innerHTML = `
        <div style="max-width:980px;margin:0 auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="font-size:18px;font-weight:700;">GRACE-X — Error Overlay</div>
            <button id="gracex-error-close" style="padding:8px 12px;border:0;border-radius:10px;cursor:pointer;">Close</button>
          </div>
          <div style="margin-top:8px;opacity:.85;font-size:12px;">BUILD: <span id="gracex-error-build"></span></div>
          <pre id="gracex-error-text" style="white-space:pre-wrap;margin-top:12px;background:rgba(255,255,255,0.06);padding:12px;border-radius:12px;"></pre>
          <div style="margin-top:10px;opacity:.75;font-size:12px;">
            Tip: If you see this, copy the error and paste it into Forge Chat→Core for a clean fix.
          </div>
        </div>`;
      document.body.appendChild(el);
      el.querySelector('#gracex-error-close')?.addEventListener('click', () => {
        el.style.display='none';
      });
      return el;
    }

    function logAudit(level, message, meta) {
      try {
        window.GRACEX_AUDIT = window.GRACEX_AUDIT || [];
        window.GRACEX_AUDIT.push({ ts: new Date().toISOString(), level, message, meta: meta || null, build: window.GRACEX_BUILD_ID || '' });
      } catch(_) {}
    }

    function showOverlay(err) {
      try {
        const el = ensureOverlay();
        const buildSpan = el.querySelector('#gracex-error-build');
        const pre = el.querySelector('#gracex-error-text');
        if (buildSpan) buildSpan.textContent = window.GRACEX_BUILD_ID || '';
        if (pre) pre.textContent = err;
        el.style.display = 'block';
      } catch(_) {}
    }

    window.addEventListener('error', (e) => {
      const msg = (e && e.error && e.error.stack) ? e.error.stack : `${e.message || 'Error'}\n${e.filename || ''}:${e.lineno || ''}:${e.colno || ''}`;
      logAudit('ERROR', 'window.error', { msg });
      showOverlay(msg);
    });

    window.addEventListener('unhandledrejection', (e) => {
      const reason = e && e.reason;
      const msg = (reason && reason.stack) ? reason.stack : String(reason || 'Unhandled rejection');
      logAudit('ERROR', 'unhandledrejection', { msg });
      showOverlay(msg);
    });
  } catch(_) {}
})();
// ============================================
// BRAIN WIRING - Level 5 Integration  
// ============================================
function wireCoreBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[CORE] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('core', {
    capabilities: {
      hasSystemControl: true,
      hasModuleLauncher: true,
      hasDashboard: true,
      hasAnalytics: true
    },

    onQuery: async (query) => {
      return 'GRACE-X Core - System command center active.';
    }
  });

  console.log('[CORE] ✅ Brain wired - Level 5 integration active');
}

// Wire brain on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireCoreBrain);
} else {
  wireCoreBrain();
}
