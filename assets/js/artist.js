// GRACE-X Artist™ – module logic
(function () {
  const modeSelect = document.getElementById("artist-mode");
  const promptBtn  = document.getElementById("artist-prompt-btn");
  const output     = document.getElementById("artist-prompt-output");
  const notesArea  = document.getElementById("artist-notes");
  const clearBtn   = document.getElementById("artist-clear-notes-btn");

  if (!modeSelect || !promptBtn || !output) {
    return;
  }

  const prompts = {
    any: [
      "Design a character who just discovered a hidden superpower.",
      "Draw a city street at night in heavy rain.",
      "Illustrate a moment from your favourite film or game.",
      "Create a creature that could live deep in the ocean.",
    ],
    characters: [
      "A hero who’s scared of their own power.",
      "An elderly inventor with a backpack full of gadgets.",
      "A street magician who might be using real magic.",
      "A kid who accidentally became the ruler of a tiny kingdom.",
    ],
    environments: [
      "A cosy room lit only by fairy lights and screens.",
      "A futuristic market floating in the sky.",
      "An abandoned theme park slowly being taken over by nature.",
      "A quiet alleyway with one mysterious glowing door.",
    ],
    objects: [
      "A cursed sword that doesn’t look dangerous at all.",
      "A radio that only plays messages from the future.",
      "A pair of trainers with a secret compartment.",
      "A coffee mug that changes its pattern with your mood.",
    ],
    practice: [
      "Draw 10 hands in different poses.",
      "Fill a page with circles and turn them into faces.",
      "Pick one object on your desk and draw it in 5 styles.",
      "Do a 10-minute speed sketch of your room.",
    ],
  };

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  promptBtn.addEventListener("click", () => {
    try {
      const mode = modeSelect.value || "any";
      const pool = prompts[mode] || prompts.any;
      const idea = randomFrom(pool);
      output.textContent = idea;
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast("Creative prompt generated", "success");
      }
    } catch (err) {
      console.error("[GRACEX ARTIST] Prompt error:", err);
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast("Failed to generate prompt", "error");
      }
    }
  });
  
  // Keyboard shortcuts for Artist
  if (window.GRACEX_Utils) {
    if (modeSelect) {
      GRACEX_Utils.addKeyboardShortcut("Enter", () => {
        if (promptBtn) promptBtn.click();
      }, modeSelect);
    }
    GRACEX_Utils.addKeyboardShortcut("Escape", () => {
      if (output) output.textContent = "";
    });
  }

  if (clearBtn && notesArea) {
    clearBtn.addEventListener("click", () => {
      notesArea.value = "";
    });
  }

  // ---- GRACE-X Artist V5 Brain Wiring ----

function initArtistBrain() {
  // Use the centralized brainV5Helper if available
  if (window.setupModuleBrain) {
    window.setupModuleBrain("artist", {
      panelId: "artist-brain-panel",
      inputId: "artist-brain-input",
      sendId: "artist-brain-send",
      outputId: "artist-brain-output",
      clearId: "artist-brain-clear",
      initialMessage: "I'm the Artist brain. Ask about creative prompts, planning, or visual concepts.",
    });
  }
}

// Initialize brain when module loads
document.addEventListener("gracex:module:loaded", (ev) => {
  if (ev.detail && (ev.detail.module === "artist" || (ev.detail.url && ev.detail.url.includes("artist.html")))) {
    setTimeout(initArtistBrain, 50);
  }
});

// Also try to initialize immediately if elements exist
if (document.getElementById("artist-brain-panel")) {
  setTimeout(initArtistBrain, 100);
}

})();