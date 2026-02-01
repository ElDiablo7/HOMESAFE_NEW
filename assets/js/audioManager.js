// assets/js/audioManager.js
// GRACE-X Voice Audio Manager v3.1 - Unified Speech Queue System
// BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP
// Prevents ALL audio overlap: intro voices, TTS, and AI responses
// PATCHED: Relative paths, missing keys, enhanced queue safety

const GRACEX_AUDIO_BASE = "assets/audio/voices/";

const GRACEX_VOICES = {
  core_startup: "core_initialising.mp3",
  core_intro: "core_initialising.mp3",
  core_boot: "core_boot.mp3",
  boot_voice: "core_boot.mp3",
  builder_activate: "builder_activate.mp3",
  builder_intro: "builder_activate.mp3",
  tradelink_activate: "tradelink_activate.mp3",
  tradelink_intro: "tradelink_activate.mp3",
  siteops_activate: "siteops_activate.mp3",
  siteops_live: "siteops_activate.mp3",
  accounting_activate: "accounting_activate.mp3",
  osint_activate: "osint_activate.mp3",
  osint_extra: "osint_extra2.mp3",
  uplift_activate: "uplift_activate.mp3",
  uplift_ground: "uplift_activate.mp3",
  fit_activate: "fit_activate.mp3",
  fit_intro: "fit_activate.mp3",
  yoga_activate: "yoga_activate.mp3",
  family_activate: "family_activate.mp3",
  gamer_activate: "gamer_activate.mp3",
  chef_activate: "chef_activate.mp3",
  artist_activate: "artist_activate.mp3",
  beauty_activate: "beauty_activate.mp3",
  sport_activate: "sport_activate.mp3",
  guardian_activate: "guardian_activate.mp3",
  forge_activate: "forge_activate.mp3"
};

// Track intro completion time to prevent overlap
let lastIntroEndTime = 0;
const INTRO_COOLDOWN_MS = 3000; // Wait 3s after intro before TTS (prevents talking over)
let introPlaying = false; // Explicit flag for intro state
let introBlockUntil = 0; // Timestamp until which TTS is blocked

const MODULE_VOICE_KEYS = {
  core: "boot_voice",
  builder: "builder_activate",
  tradelink: "tradelink_activate",
  siteops: "siteops_activate",
  accounting: "accounting_activate",
  osint: "osint_activate",
  uplift: "uplift_activate",
  fit: "fit_activate",
  yoga: "yoga_activate",
  family: "family_activate",
  gamer: "gamer_activate",
  chef: "chef_activate",
  artist: "artist_activate",
  beauty: "beauty_activate",
  sport: "sport_activate",
  guardian: "guardian_activate",
  forge: "forge_activate"  // PATCHED: Added missing forge key
};

// ============================================
// UNIFIED SPEECH QUEUE SYSTEM
// ============================================

let speechQueue = [];
let isProcessingQueue = false;
let currentAudio = null;
let muted = false;
let globalSpeechLock = false;

// Speech item types
const SPEECH_TYPE = {
  INTRO: 'intro',      // Module intro voice (high priority)
  TTS: 'tts',          // AI TTS response
  EFFECT: 'effect'     // Sound effects (low priority)
};

/**
 * Add item to speech queue
 * @param {object} item - { type, payload, priority }
 */
function queueSpeech(item) {
  // High priority items go to front
  if (item.priority === 'high') {
    speechQueue.unshift(item);
  } else {
    speechQueue.push(item);
  }
  processQueue();
}

/**
 * Process the speech queue
 */
async function processQueue() {
  if (isProcessingQueue || speechQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  globalSpeechLock = true;
  
  while (speechQueue.length > 0) {
    const item = speechQueue.shift();
    
    try {
      if (item.type === SPEECH_TYPE.INTRO) {
        await playIntroAudio(item.payload);
      } else if (item.type === SPEECH_TYPE.TTS) {
        await playTTS(item.payload.text, item.payload.options);
      } else if (item.type === SPEECH_TYPE.EFFECT) {
        await playEffect(item.payload);
      }
    } catch (err) {
      console.warn('[GRACEX AUDIO] Queue item failed:', err);
    }
    
    // PATCHED: Increased gap between queued items for safety
    await sleep(300);
  }
  
  isProcessingQueue = false;
  globalSpeechLock = false;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if any audio is currently playing
 */
function isAnySpeechActive() {
  // Check intro audio
  if (currentAudio && !currentAudio.paused) return true;
  
  // Check TTS
  if (window.speechSynthesis && window.speechSynthesis.speaking) return true;
  
  // Check if we're in block period
  if (Date.now() < introBlockUntil) return true;
  
  return false;
}

/**
 * Stop ALL audio immediately
 */
function stopAll() {
  // Clear queue
  speechQueue = [];
  isProcessingQueue = false;
  globalSpeechLock = false;
  introPlaying = false;
  introBlockUntil = 0;
  
  // Stop intro audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  
  // Stop TTS
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play intro audio file (internal)
 */
function playIntroAudio(key) {
  return new Promise((resolve) => {
    if (!key || muted) {
      resolve();
      return;
    }
    
    const fileName = GRACEX_VOICES[key];
    if (!fileName) {
      console.warn('[GRACEX AUDIO] No voice file for key:', key);
      resolve();
      return;
    }
    
    const src = GRACEX_AUDIO_BASE + fileName;
    
    // CRITICAL: Stop any TTS immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Set intro playing flag
    introPlaying = true;
    
    try {
      const audio = new Audio(src);
      currentAudio = audio;
      
      // Estimate intro duration (most are 3-5 seconds)
      // Block TTS for duration + cooldown
      const estimatedDuration = 5000;
      introBlockUntil = Date.now() + estimatedDuration + INTRO_COOLDOWN_MS;
      
      audio.onended = () => {
        currentAudio = null;
        introPlaying = false;
        lastIntroEndTime = Date.now();
        // Ensure block time accounts for actual duration
        introBlockUntil = Date.now() + INTRO_COOLDOWN_MS;
        console.log('[GRACEX AUDIO] Intro ended, TTS blocked for', INTRO_COOLDOWN_MS, 'ms');
        resolve();
      };
      
      audio.onerror = (e) => {
        console.warn('[GRACEX AUDIO] Audio error for:', src, e);
        currentAudio = null;
        introPlaying = false;
        lastIntroEndTime = Date.now();
        introBlockUntil = Date.now() + 500;
        resolve();
      };
      
      audio.play().catch((err) => {
        console.warn('[GRACEX AUDIO] Play failed for:', src, err);
        currentAudio = null;
        introPlaying = false;
        lastIntroEndTime = Date.now();
        introBlockUntil = Date.now() + 500;
        resolve();
      });
    } catch (e) {
      console.warn('[GRACEX AUDIO] Exception playing:', src, e);
      introPlaying = false;
      lastIntroEndTime = Date.now();
      introBlockUntil = Date.now() + 500;
      resolve();
    }
  });
}

/**
 * Play TTS (internal)
 */
function playTTS(text, options = {}) {
  return new Promise((resolve) => {
    if (!text || muted || !window.speechSynthesis) {
      resolve();
      return;
    }
    
    // Clean text
    let cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Apply settings from GRACEX_TTS if available
    if (window.GRACEX_TTS) {
      const settings = GRACEX_TTS.getSettings();
      utterance.rate = options.rate || settings.rate || 0.95;
      utterance.pitch = options.pitch || settings.pitch || 1.0;
      utterance.volume = options.volume || settings.volume || 0.9;
      utterance.lang = settings.lang || 'en-GB';
      if (settings.voice) {
        utterance.voice = settings.voice;
      }
    } else {
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.9;
      utterance.lang = 'en-GB';
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play sound effect (internal)
 */
function playEffect(src) {
  return new Promise((resolve) => {
    if (!src || muted) {
      resolve();
      return;
    }
    
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    } catch (e) {
      resolve();
    }
  });
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Play intro voice for a module (stops current, high priority)
 */
function playVoice(key) {
  // Stop everything first for intro voices
  stopAll();
  
  return new Promise((resolve) => {
    queueSpeech({
      type: SPEECH_TYPE.INTRO,
      payload: key,
      priority: 'high'
    });
    
    // Wait for queue to finish
    const checkDone = setInterval(() => {
      if (!isProcessingQueue) {
        clearInterval(checkDone);
        resolve();
      }
    }, 100);
  });
}

/**
 * Play intro voice for a module by ID
 */
function playForModule(moduleId) {
  const key = MODULE_VOICE_KEYS[moduleId];
  if (!key) {
    console.warn("[GRACEX VOICES] No voice mapped for module:", moduleId);
    return Promise.resolve();
  }
  console.log("[GRACEX VOICES] Playing voice for module:", moduleId, "key:", key);
  return playVoice(key);
}

/**
 * Queue TTS speech (waits for intro to finish + cooldown)
 */
function speakTTS(text, options = {}) {
  return new Promise(async (resolve) => {
    // Wait for intro cooldown if needed
    const timeSinceIntro = Date.now() - lastIntroEndTime;
    if (timeSinceIntro < INTRO_COOLDOWN_MS) {
      await sleep(INTRO_COOLDOWN_MS - timeSinceIntro);
    }
    
    // Wait for any intro to finish first
    if (isAnySpeechActive() || isProcessingQueue) {
      await waitForSilence();
      await sleep(500); // PATCHED: Increased extra gap after waiting
    }
    
    queueSpeech({
      type: SPEECH_TYPE.TTS,
      payload: { text, options },
      priority: 'normal'
    });
    
    const checkDone = setInterval(() => {
      if (!isProcessingQueue) {
        clearInterval(checkDone);
        resolve();
      }
    }, 100);
  });
}

/**
 * Speak immediately, stopping everything else
 */
function speakNow(text, options = {}) {
  stopAll();
  return playTTS(text, options);
}

/**
 * Check if speech is locked (intro playing)
 */
function isSpeechLocked() {
  return globalSpeechLock || introPlaying || (Date.now() < introBlockUntil);
}

/**
 * Wait for all speech to complete
 */
function waitForSilence() {
  return new Promise((resolve) => {
    const checkSilence = setInterval(() => {
      if (!isAnySpeechActive() && !isProcessingQueue) {
        clearInterval(checkSilence);
        resolve();
      }
    }, 100);
    
    // Safety timeout after 15 seconds
    setTimeout(() => {
      clearInterval(checkSilence);
      resolve();
    }, 15000);
  });
}

/**
 * Set muted state
 */
function setMuted(isMuted) {
  muted = !!isMuted;
  if (muted) {
    stopAll();
  }
}

/**
 * Initialize audio manager
 */
function init() {
  const moduleButtons = document.querySelectorAll(".module-btn");
  moduleButtons.forEach(btn => {
    const moduleId = btn.dataset.module;
    if (!moduleId) return;
    btn.addEventListener("click", () => playForModule(moduleId));
  });
  console.info("[GRACEX VOICES] AudioManager v3.1 (Patched Speech Queue) initialised.");
  console.info("[GRACEX VOICES] BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP");
}

// ============================================
// EXPORT
// ============================================

/**
 * Check if intro is currently playing or just finished
 */
function isIntroActive() {
  // Check if intro audio is playing
  if (introPlaying) return true;
  if (currentAudio && !currentAudio.paused) return true;
  // Check if we're in block period
  if (Date.now() < introBlockUntil) return true;
  // Check if we're in cooldown period
  if (Date.now() - lastIntroEndTime < INTRO_COOLDOWN_MS) return true;
  return false;
}

/**
 * Get remaining block time in ms
 */
function getBlockTimeRemaining() {
  const blockRemaining = Math.max(0, introBlockUntil - Date.now());
  const cooldownRemaining = Math.max(0, INTRO_COOLDOWN_MS - (Date.now() - lastIntroEndTime));
  return Math.max(blockRemaining, cooldownRemaining);
}

/**
 * Safe speak - waits for intro and queues properly
 * CRITICAL: This prevents AI from talking over intro voices
 */
async function safeSpeakTTS(text, options = {}) {
  // Wait for intro to completely finish
  while (isIntroActive()) {
    const remaining = getBlockTimeRemaining();
    console.log('[GRACEX AUDIO] Waiting for intro, remaining:', remaining, 'ms');
    await sleep(Math.min(remaining + 100, 500));
  }
  
  // Extra safety gap
  await sleep(500);
  
  return speakTTS(text, options);
}

/**
 * Get list of available voice keys
 */
function getAvailableVoices() {
  return Object.keys(GRACEX_VOICES);
}

/**
 * Get module voice mapping
 */
function getModuleVoiceMap() {
  return { ...MODULE_VOICE_KEYS };
}

const AudioManager = {
  init,
  play: playVoice,
  stop: stopAll,
  stopAll,
  playForModule,
  speakTTS,
  safeSpeakTTS, // Safer speak that always waits for intro
  speakNow,
  mute: () => setMuted(true),
  unmute: () => setMuted(false),
  isMuted: () => muted,
  isPlaying: isAnySpeechActive,
  isIntroActive, // Check if intro playing/cooldown
  isSpeechLocked,
  waitForSilence,
  getBlockTimeRemaining, // Get ms until TTS allowed
  getAvailableVoices,
  getModuleVoiceMap,
  // Expose queue for debugging
  getQueueLength: () => speechQueue.length,
  // Version info
  version: '3.1.0',
  build: 'ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP'
};

// Make globally available
window.GRACEX_AudioManager = AudioManager;
