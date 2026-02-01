// GRACE-X Yoga™ – module logic
// Handles:
//  - "Ask Yoga" helper replies
//  - "Start Short Flow" prototype button

(function () {
  function getYogaReply(text) {
    const t = (text || "").toLowerCase().trim();

    if (!t) {
      return "Tell me where it feels tight, how long you’ve got (3, 5 or 10 minutes), and if you’re mostly sitting or standing.";
    }

    const mentionsBack     = t.includes("back") || t.includes("spine");
    const mentionsNeck     = t.includes("neck");
    const mentionsShoulder = t.includes("shoulder") || t.includes("shoulders");
    const mentionsHip      = t.includes("hip") || t.includes("hips");
    const mentionsStress   = t.includes("stress") || t.includes("anxiety") || t.includes("panic");

    if (mentionsBack && t.includes("lower")) {
      return "For a tight lower back, try 5 minutes: slow knee-to-chest on your back, gentle twisting left and right, then a forward fold with soft knees. Breathe out slowly as you fold.";
    }

    if (mentionsBack) {
      return "For general back tightness, keep it simple: cat–cow on hands and knees, slow twists, then a gentle forward fold. Move with your breath, not speed.";
    }

    if (mentionsNeck || mentionsShoulder) {
      return "For neck and shoulders, spend 3–5 minutes: roll the shoulders slowly, ear-to-shoulder stretches, then gentle neck circles. Keep your jaw loose and breathe out longer than you breathe in.";
    }

    if (mentionsHip) {
      return "For tight hips, try 5–10 minutes: gentle lunges with hands supported on a chair or sofa, then sitting cross-legged with a slow forward lean, staying in your comfort zone.";
    }

    if (mentionsStress) {
      return "For stress and anxiety, start with your breath: sit comfortably, breathe in for 4, hold for 2, breathe out for 6–8. Do that for 3–5 minutes before any stretching.";
    }

    return "I’d keep it gentle: pick one area (neck, shoulders, back or hips), move slowly for 3–5 minutes, and breathe out a bit longer than you breathe in. Small, repeatable is better than perfect.";
  }

  function initYoga() {
    const inputEl    = document.getElementById("yogaInput");
    const askBtn     = document.getElementById("yogaAskBtn");
    const outputEl   = document.getElementById("yogaOutput");
    const flowBtn    = document.getElementById("yoga-start-flow");
    const flowStatus = document.getElementById("yoga-flow-status");

    if (!inputEl || !askBtn || !outputEl) {
      return; // not on Yoga screen
    }

    // Avoid double-binding if Yoga gets reloaded
    if (askBtn.dataset.gracexYogaBound === "1") {
      return;
    }
    askBtn.dataset.gracexYogaBound = "1";

    function handleAsk() {
      const text  = (inputEl.value || "").trim();
      const reply = getYogaReply(text);
      outputEl.textContent = reply;
    }

    askBtn.addEventListener("click", handleAsk);

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAsk();
      }
    });

    if (flowBtn && flowStatus && !flowBtn.dataset.gracexYogaFlowBound) {
      flowBtn.dataset.gracexYogaFlowBound = "1";
      flowBtn.addEventListener("click", () => {
        flowStatus.textContent =
          "Short Yoga flow started (prototype). In the full app this will guide you step by step: pick area → pick time → follow along with simple stretches and breathing.";
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Yoga flow started", "success");
        }
      });
    }
    
    // Keyboard shortcuts for Yoga
    if (window.GRACEX_Utils && inputEl) {
      GRACEX_Utils.addKeyboardShortcut("Enter", () => {
        if (askBtn) askBtn.click();
      }, inputEl);
      GRACEX_Utils.addKeyboardShortcut("Escape", () => {
        if (outputEl) outputEl.textContent = "";
      });
    }
  }

  // First load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initYoga);
  } else {
    initYoga();
  }

  // Re-run when Core loads yoga.html into #content
  document.addEventListener("gracex:module:loaded", (evt) => {
    const url = evt.detail && evt.detail.url;
    if (url && url.indexOf("yoga.html") !== -1) {
      initYoga();
    }

   // ---- GRACE-X Yoga V5 Brain Wiring ----

function initYogaBrain() {
  if (window.initBrainV5) {
    window.initBrainV5("yoga", {
      welcomeMessage: "Tell me what's tight, how long you've got, and whether you're sitting or standing."
    });
  } else {
    const panel = document.getElementById("yoga-brain-panel");
    const input = document.getElementById("yoga-brain-input");
    const send = document.getElementById("yoga-brain-send");
    const output = document.getElementById("yoga-brain-output");
    const clearBtn = document.getElementById("yoga-brain-clear");

    if (!panel || !input || !send || !output) return;

    function appendMessage(role, text) {
      const msg = document.createElement("div");
      msg.className = "brain-message brain-message-" + role;
      msg.textContent = text;
      output.appendChild(msg);
      output.scrollTop = output.scrollHeight;
    }

    async function handleQuestion() {
      const q = input.value.trim();
      if (!q) {
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Please enter a message", "error");
        }
        return;
      }
      
      // Input validation
      if (window.GRACEX_Utils) {
        const validation = GRACEX_Utils.validateInput(q, {
          required: true,
          maxLength: 500
        });
        if (!validation.valid) {
          GRACEX_Utils.showToast(validation.errors[0], "error");
          return;
        }
      }
      
      input.value = "";
      appendMessage("user", q);

      // Show loading state
      const loader = window.GRACEX_Utils ? GRACEX_Utils.showLoading(output, "Thinking...") : null;

      try {
        // Try GraceX.think first, then fallback to runModuleBrain
        let result;
        if (window.GraceX && typeof window.GraceX.think === 'function') {
          const res = window.GraceX.think({
            text: q,
            module: "yoga",
            mode: 'chat'
          });
          result = res.reply || res.message || "I'm not sure how to respond to that.";
        } else if (window.runModuleBrain) {
          const reply = window.runModuleBrain("yoga", q);
          result = reply instanceof Promise ? await reply : reply;
        } else {
          result = "Brain system not available.";
        }
        appendMessage("ai", result);
      } catch (err) {
        console.error("[GRACEX YOGA] Brain error:", err);
        appendMessage("ai", "Sorry, something went wrong.");
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Failed to process message", "error");
        }
      } finally {
        if (loader && window.GRACEX_Utils) {
          GRACEX_Utils.hideLoading(loader);
        }
      }
    }

    send.addEventListener("click", handleQuestion);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleQuestion();
      }
    });

    // Keyboard shortcuts
    if (window.GRACEX_Utils) {
      GRACEX_Utils.addKeyboardShortcut("Escape", () => {
        input.value = "";
        input.focus();
      }, input);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        output.innerHTML = "";
        if (window.clearBrainHistory) window.clearBrainHistory("yoga");
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Chat cleared", "info");
        }
      });
    }
  }
}

  document.addEventListener("gracex:module:loaded", (ev) => {
    if (ev.detail && (ev.detail.module === "yoga" || (ev.detail.url && ev.detail.url.includes("yoga.html")))) {
      setTimeout(initYogaBrain, 50);
    }
  });

  if (document.getElementById("yoga-brain-panel")) {
    setTimeout(initYogaBrain, 100);
  }

})();
// ============================================
// BRAIN WIRING - Level 5 Integration
// ============================================
function wireYogaBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[YOGA] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('yoga', {
    capabilities: {
      hasPoseGuides: true,
      hasBreathwork: true,
      hasMeditation: true,
      hasRoutines: true
    },

    onQuery: async (query) => {
      return 'Yoga practice guide ready. Looking for poses, breathwork, or meditation?';
    }
  });

  console.log('[YOGA] ✅ Brain wired - Level 5 integration active');
}

// Wire brain on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireYogaBrain);
} else {
  wireYogaBrain();
}
