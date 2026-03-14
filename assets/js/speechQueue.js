// assets/js/speechQueue.js
// GRACE-X Speech Queue System - Prevents voice overlap
// © Zac Crockett, © Jason Treadaway
// BUILD: ZGV6_22.12.25.0_AUDIT_PATCH_SWEEP
// VERSION: 2.1.0

(function() {
  if (window.GRACEX_SpeechQueue) return;

  const VERSION = '2.1.0';
  const queue = [];
  let isProcessing = false;
  let currentSpeech = null;
  let introDelay = 3000; // PATCHED: Sync with audioManager (was 2500)

  // Speech types with priorities (lower = higher priority)
  const PRIORITIES = {
    system: 1,      // System alerts (highest)
    intro: 2,       // Module intro voices
    ai: 3,          // AI responses
    notification: 4 // General notifications
  };

  /**
   * Add speech to queue
   * @param {object} item - Speech item
   * @param {string} item.type - 'intro', 'ai', 'system', 'notification'
   * @param {string} item.text - Text to speak (for TTS)
   * @param {string} item.audioKey - Audio key (for intro sounds)
   * @param {function} item.callback - Optional callback when done
   */
  function enqueue(item) {
    const priority = PRIORITIES[item.type] || 5;
    
    // Add to queue with priority
    queue.push({
      ...item,
      priority,
      timestamp: Date.now()
    });

    // Sort by priority (lower first), then by timestamp
    queue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.timestamp - b.timestamp;
    });

    console.log('[GRACEX Queue] Added:', item.type, '- Queue length:', queue.length);
    
    // Start processing if not already
    if (!isProcessing) {
      processQueue();
    }
  }

  /**
   * Process the queue
   */
  async function processQueue() {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    
    while (queue.length > 0) {
      const item = queue.shift();
      currentSpeech = item;
      
      try {
        await playItem(item);
        
        // Add delay after intro voices so AI doesn't talk immediately
        if (item.type === 'intro') {
          console.log('[GRACEX Queue] Intro finished, waiting', introDelay, 'ms');
          await delay(introDelay);
        }
        
      } catch (err) {
        console.warn('[GRACEX Queue] Error playing item:', err);
      }
      
      currentSpeech = null;
    }
    
    isProcessing = false;
  }

  /**
   * Play a single item
   */
  function playItem(item) {
    return new Promise((resolve, reject) => {
      
      // Handle intro/audio file playback
      if (item.audioKey || item.audioSrc) {
        playAudio(item.audioKey || item.audioSrc)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Handle TTS
      if (item.text && window.GRACEX_TTS) {
        GRACEX_TTS.speak(item.text, item.options || {})
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Nothing to play
      resolve();
    });
  }

  /**
   * Play audio file
   * PATCHED: Complete voice key mapping & relative paths
   */
  function playAudio(keyOrSrc) {
    return new Promise((resolve, reject) => {
      let src = keyOrSrc;
      
      // Check if it's a key that needs lookup
      if (window.AudioManager && !keyOrSrc.includes('/')) {
        // PATCHED: Complete voice mapping including forge and guardian
        const VOICES = {
          // Core system
          core_startup: "core_initialising.mp3",
          core_intro: "core_initialising.mp3",
          core_boot: "core_boot.mp3",
          boot_voice: "core_boot.mp3",
          
          // All modules (PATCHED: added forge and guardian)
          builder_activate: "builder_activate.mp3",
          tradelink_activate: "tradelink_activate.mp3",
          siteops_activate: "siteops_activate.mp3",
          accounting_activate: "accounting_activate.mp3",
          osint_activate: "osint_activate.mp3",
          uplift_activate: "uplift_activate.mp3",
          fit_activate: "fit_activate.mp3",
          yoga_activate: "yoga_activate.mp3",
          family_activate: "family_activate.mp3",
          gamer_activate: "gamer_activate.mp3",
          chef_activate: "chef_activate.mp3",
          artist_activate: "artist_activate.mp3",
          beauty_activate: "beauty_activate.mp3",
          sport_activate: "sport_activate.mp3",
          guardian_activate: "guardian_activate.mp3",  // PATCHED: Added
          forge_activate: "forge_activate.mp3"         // PATCHED: Added
        };
        
        if (VOICES[keyOrSrc]) {
          // PATCHED: Use relative path (was absolute /assets/)
          src = 'assets/audio/voices/' + VOICES[keyOrSrc];
        }
      }
      
      const audio = new Audio(src);
      
      audio.onended = () => {
        console.log('[GRACEX Queue] Audio finished:', keyOrSrc);
        resolve();
      };
      
      audio.onerror = (e) => {
        console.warn('[GRACEX Queue] Audio error:', keyOrSrc, e);
        resolve(); // Don't block queue on audio errors
      };
      
      audio.play().catch(err => {
        console.warn('[GRACEX Queue] Playback failed:', keyOrSrc, err);
        resolve(); // Don't block queue
      });
    });
  }

  /**
   * Utility delay function
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the queue
   */
  function clear() {
    queue.length = 0;
    if (window.GRACEX_TTS) {
      GRACEX_TTS.stop();
    }
    console.log('[GRACEX Queue] Cleared');
  }

  /**
   * Skip current speech
   */
  function skip() {
    if (window.GRACEX_TTS) {
      GRACEX_TTS.stop();
    }
    if (currentSpeech && currentSpeech.callback) {
      currentSpeech.callback('skipped');
    }
    console.log('[GRACEX Queue] Skipped current');
  }

  /**
   * Check if queue is busy
   */
  function isBusy() {
    return isProcessing || queue.length > 0;
  }

  /**
   * Wait for queue to be empty
   */
  async function waitForEmpty() {
    while (isBusy()) {
      await delay(100);
    }
  }

  /**
   * Set intro delay
   */
  function setIntroDelay(ms) {
    introDelay = ms;
    console.log('[GRACEX Queue] Intro delay set to:', ms, 'ms');
  }

  /**
   * Get intro delay
   */
  function getIntroDelay() {
    return introDelay;
  }

  /**
   * Convenience: Queue intro voice
   */
  function queueIntro(audioKey) {
    enqueue({
      type: 'intro',
      audioKey
    });
  }

  /**
   * Convenience: Queue AI speech
   */
  function queueAI(text, options) {
    enqueue({
      type: 'ai',
      text,
      options
    });
  }

  /**
   * Convenience: Queue system message
   */
  function queueSystem(text) {
    enqueue({
      type: 'system',
      text
    });
  }

  // Export API
  window.GRACEX_SpeechQueue = {
    enqueue,
    clear,
    skip,
    isBusy,
    waitForEmpty,
    setIntroDelay,
    getIntroDelay,
    queueIntro,
    queueAI,
    queueSystem,
    getQueueLength: () => queue.length,
    version: VERSION
  };

  console.info(`[GRACEX] Speech Queue v${VERSION} loaded - prevents voice overlap`);
})();
