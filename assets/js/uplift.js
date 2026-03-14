// =====================================================
// GRACE-X UPLIFT™ v2.0
// Mental Health · Emotional Support · Crisis De-Escalation
// HUMAN-FIRST SAFETY MODULE
//
// ⚠️ CRITICAL: This module handles mental health and crisis situations.
// If anything conflicts with safety, SAFETY WINS.
// If uncertain: STOP → SLOW → ESCALATE → INVOLVE HUMANS
// =====================================================

(function() {
  'use strict';

  // =====================================================
  // CONSTANTS & CONFIGURATION
  // =====================================================
  
  // Support Lanes (MANDATORY CLASSIFICATION)
  const LANES = {
    U0: { id: 'U0', name: 'Stable Support', color: '#10b981' },
    U1: { id: 'U1', name: 'Grounding Support', color: '#f59e0b' },
    U2: { id: 'U2', name: 'High Concern Support', color: '#ef4444' },
    U3: { id: 'U3', name: 'Crisis Support', color: '#dc2626' }
  };

  // Crisis keywords that MUST trigger U3 (NON-NEGOTIABLE)
  const CRISIS_KEYWORDS = [
    'kill myself', 'end my life', 'want to die', 'better off dead',
    'suicide', 'suicidal', 'end it all', 'not worth living',
    'hurt myself', 'self harm', 'self-harm', 'cutting myself',
    'can\'t go on', 'no point anymore', 'want to disappear',
    'rather be dead', 'life isn\'t worth', 'nothing to live for',
    'going to hurt myself', 'planning to end'
  ];

  // High concern keywords (U2)
  const HIGH_CONCERN_KEYWORDS = [
    'hopeless', 'can\'t cope', 'falling apart', 'breaking down',
    'no way out', 'trapped', 'desperate', 'giving up',
    'worthless', 'burden to everyone', 'everyone better without me',
    'can\'t take it anymore', 'nothing helps', 'completely alone'
  ];

  // Distress keywords (U1)
  const DISTRESS_KEYWORDS = [
    'overwhelmed', 'anxious', 'panic', 'can\'t breathe',
    'too much', 'stressed', 'freaking out', 'scared',
    'worried', 'nervous', 'on edge', 'can\'t sleep',
    'exhausted', 'burned out', 'depressed', 'sad'
  ];

  // UK Crisis Resources (ALWAYS AVAILABLE)
  const CRISIS_RESOURCES = {
    UK: [
      { name: 'Samaritans', number: '116 123', note: 'Free, 24/7, won\'t judge' },
      { name: 'NHS 111', number: '111, option 2', note: 'Mental health crisis' },
      { name: 'Emergency', number: '999', note: 'If in immediate danger' },
      { name: 'Shout', number: 'Text SHOUT to 85258', note: 'Free text support' },
      { name: 'Papyrus (under 35)', number: '0800 068 4141', note: 'Young people' },
      { name: 'CALM (men)', number: '0800 58 58 58', note: '5pm-midnight' }
    ]
  };

  // =====================================================
  // STATE MANAGEMENT (SESSION-ONLY BY DEFAULT)
  // =====================================================
  
  let currentLane = 'U0';
  let crisisMode = false;
  let sessionStartTime = Date.now();

  // =====================================================
  // LANE DETECTION (MANDATORY FOR EVERY MESSAGE)
  // =====================================================
  
  function detectLane(text) {
    if (!text) return 'U0';
    
    const lower = text.toLowerCase();

    // U3 CRISIS - Highest priority, NON-NEGOTIABLE
    for (const keyword of CRISIS_KEYWORDS) {
      if (lower.includes(keyword)) {
        console.warn('[GRACEX UPLIFT] ⚠️ CRISIS DETECTED - U3 triggered');
        return 'U3';
      }
    }

    // U2 HIGH CONCERN
    for (const keyword of HIGH_CONCERN_KEYWORDS) {
      if (lower.includes(keyword)) {
        console.log('[GRACEX UPLIFT] High concern detected - U2');
        return 'U2';
      }
    }

    // U1 DISTRESSED
    for (const keyword of DISTRESS_KEYWORDS) {
      if (lower.includes(keyword)) {
        return 'U1';
      }
    }

    // U0 STABLE
    return 'U0';
  }

  // =====================================================
  // LANE UI UPDATES
  // =====================================================
  
  function updateLaneDisplay(lane) {
    const badge = document.getElementById('uplift-lane-badge');
    const subtitle = document.getElementById('uplift-subtitle');
    
    if (badge) {
      badge.dataset.lane = lane;
      badge.textContent = LANES[lane]?.name || 'Support Mode';
      badge.style.background = LANES[lane]?.color || '#10b981';
    }

    // Update subtitle based on lane
    if (subtitle) {
      switch (lane) {
        case 'U3':
          subtitle.textContent = 'Safety first. I\'m here with you.';
          break;
        case 'U2':
          subtitle.textContent = 'I\'m concerned. Let\'s take this slowly.';
          break;
        case 'U1':
          subtitle.textContent = 'Let\'s help you feel calmer.';
          break;
        default:
          subtitle.textContent = 'You\'re not alone. A calm, supportive space when you need it.';
      }
    }
  }

  function setLane(lane) {
    const previousLane = currentLane;
    currentLane = lane;
    
    updateLaneDisplay(lane);

    // Trigger crisis mode if U3
    if (lane === 'U3' && !crisisMode) {
      enterCrisisMode();
    } else if (lane !== 'U3' && crisisMode) {
      exitCrisisMode();
    }

    // Show human help banner for U2
    if (lane === 'U2') {
      showHumanHelpBanner();
    }

    // Log lane change (session only)
    console.log(`[GRACEX UPLIFT] Lane changed: ${previousLane} → ${lane}`);
  }

  // =====================================================
  // CRISIS MODE (U3 - MANDATORY BEHAVIOUR)
  // =====================================================
  
  function enterCrisisMode() {
    crisisMode = true;
    console.warn('[GRACEX UPLIFT] ⚠️ ENTERING CRISIS MODE');

    // Show crisis card
    const crisisCard = document.getElementById('uplift-crisis-card');
    if (crisisCard) {
      crisisCard.style.display = 'block';
      crisisCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Show "I'm not safe" button in chat
    const notSafeBtn = document.getElementById('uplift-btn-i-am-not-safe');
    if (notSafeBtn) {
      notSafeBtn.style.display = 'inline-block';
    }

    // Update TTS to crisis mode if available
    if (window.GRACEX_TTS && window.GRACEX_TTS.enterCrisisMode) {
      window.GRACEX_TTS.enterCrisisMode();
    }

    // Notify toast (calm, not alarming)
    if (window.GRACEX_Utils) {
      GRACEX_Utils.showToast('I\'m here with you', 'info', 3000);
    }
  }

  function exitCrisisMode() {
    crisisMode = false;
    console.log('[GRACEX UPLIFT] Exiting crisis mode');

    // Hide crisis card
    const crisisCard = document.getElementById('uplift-crisis-card');
    if (crisisCard) {
      crisisCard.style.display = 'none';
    }

    // Hide "I'm not safe" button
    const notSafeBtn = document.getElementById('uplift-btn-i-am-not-safe');
    if (notSafeBtn) {
      notSafeBtn.style.display = 'none';
    }

    // Exit TTS crisis mode
    if (window.GRACEX_TTS && window.GRACEX_TTS.exitCrisisMode) {
      window.GRACEX_TTS.exitCrisisMode();
    }
  }

  // =====================================================
  // CRISIS RESPONSES (SAMARITANS-STYLE, NON-NEGOTIABLE)
  // =====================================================
  
  function getCrisisResponse() {
    // Short, calm, clear - no emojis in crisis
    const responses = [
      "I'm really sorry you're feeling this much pain. I'm concerned about your safety. Are you safe right now?",
      "That sounds incredibly hard. I'm worried about you. Is there someone with you, or are you alone?",
      "I hear you. What you're going through sounds overwhelming. Your safety matters. Are you in a safe place right now?",
      "Thank you for telling me. I'm concerned. You deserve real support from people who can help. Are you able to reach out to someone?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function getHighConcernResponse() {
    const responses = [
      "That sounds really heavy. I'm glad you're talking about it. Have you been able to share this with anyone else?",
      "I can hear how much you're struggling. You don't have to go through this alone. Is there someone you trust you could reach out to?",
      "What you're describing sounds exhausting. Would it help to look at some support resources together?",
      "I'm here. That sounds like a lot to carry. Let's slow down. What's the hardest part right now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function getDistressResponse() {
    const responses = [
      "I hear you. Let's try to slow things down a bit. Take a breath with me if you can.",
      "That sounds overwhelming. You're not alone in feeling this way. Would a grounding exercise help right now?",
      "I'm listening. What's the one thing that feels most pressing right now?",
      "It's okay to feel this way. Let's focus on just this moment. What do you need most right now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function getStableResponse(text) {
    // Basic supportive responses for U0
    const responses = [
      "I'm listening. Tell me more about what's on your mind.",
      "Thanks for sharing that. How has that been affecting you?",
      "I hear you. What would feel helpful right now?",
      "That makes sense. Is there anything specific you'd like to work through?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // =====================================================
  // GROUNDING EXERCISES
  // =====================================================
  
  const GROUNDING_EXERCISES = {
    breathing60: {
      title: 'Breathing Exercise (1 minute)',
      duration: 60000,
      steps: [
        { text: 'Breathe in slowly...', duration: 4000 },
        { text: 'Hold...', duration: 4000 },
        { text: 'Breathe out slowly...', duration: 6000 }
      ]
    },
    breathing120: {
      title: 'Breathing Exercise (2 minutes)',
      duration: 120000,
      steps: [
        { text: 'Breathe in slowly...', duration: 4000 },
        { text: 'Hold...', duration: 4000 },
        { text: 'Breathe out slowly...', duration: 6000 }
      ]
    },
    senses54321: {
      title: '5-4-3-2-1 Grounding',
      steps: [
        { text: 'Name 5 things you can SEE', action: 'input', count: 5 },
        { text: 'Name 4 things you can TOUCH', action: 'input', count: 4 },
        { text: 'Name 3 things you can HEAR', action: 'input', count: 3 },
        { text: 'Name 2 things you can SMELL', action: 'input', count: 2 },
        { text: 'Name 1 thing you can TASTE', action: 'input', count: 1 }
      ]
    },
    bodyScan: {
      title: 'Body Scan',
      steps: [
        { text: 'Notice your feet on the floor...', duration: 5000 },
        { text: 'Feel your legs and how they\'re resting...', duration: 5000 },
        { text: 'Notice your hands. Are they tense?', duration: 5000 },
        { text: 'Feel your shoulders. Let them drop...', duration: 5000 },
        { text: 'Notice your jaw. Unclench if you need to...', duration: 5000 },
        { text: 'Take one deep breath...', duration: 5000 }
      ]
    }
  };

  let currentExercise = null;
  let exerciseInterval = null;

  function startGroundingExercise(type) {
    const exercise = GROUNDING_EXERCISES[type];
    if (!exercise) return;

    currentExercise = type;
    const card = document.getElementById('uplift-grounding-card');
    const title = document.getElementById('uplift-grounding-title');
    const content = document.getElementById('uplift-grounding-content');
    const progress = document.getElementById('uplift-grounding-progress');

    if (card) card.style.display = 'block';
    if (title) title.textContent = exercise.title;

    // Clear any existing interval
    if (exerciseInterval) clearInterval(exerciseInterval);

    if (type === 'senses54321') {
      // Interactive 5-4-3-2-1
      runSensesExercise(exercise.steps, 0, content);
    } else {
      // Timed breathing/body scan
      runTimedExercise(exercise, content, progress);
    }
  }

  function runTimedExercise(exercise, contentEl, progressEl) {
    let stepIndex = 0;
    let elapsed = 0;
    const totalDuration = exercise.duration;

    function nextStep() {
      if (!currentExercise) return;

      const step = exercise.steps[stepIndex % exercise.steps.length];
      contentEl.innerHTML = `<p class="grounding-step">${step.text}</p>`;

      // Speak if TTS enabled (calm voice)
      if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
        GRACEX_TTS.speak(step.text);
      }

      stepIndex++;
      elapsed += step.duration;

      // Update progress
      if (progressEl) {
        const pct = Math.min(100, (elapsed / totalDuration) * 100);
        progressEl.style.width = pct + '%';
      }

      if (elapsed < totalDuration) {
        exerciseInterval = setTimeout(nextStep, step.duration);
      } else {
        // Exercise complete
        contentEl.innerHTML = `<p class="grounding-complete">Well done. Take a moment before moving on.</p>`;
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Exercise complete', 'success');
        }
      }
    }

    nextStep();
  }

  function runSensesExercise(steps, index, contentEl) {
    if (index >= steps.length || !currentExercise) {
      contentEl.innerHTML = `<p class="grounding-complete">Well done. You've grounded yourself in the present moment.</p>`;
      return;
    }

    const step = steps[index];
    contentEl.innerHTML = `
      <p class="grounding-step">${step.text}</p>
      <div class="senses-inputs" id="senses-inputs"></div>
      <button class="builder-btn" id="senses-next">Next</button>
    `;

    const inputsContainer = document.getElementById('senses-inputs');
    for (let i = 0; i < step.count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `${i + 1}...`;
      input.className = 'senses-input';
      inputsContainer.appendChild(input);
    }

    document.getElementById('senses-next')?.addEventListener('click', () => {
      runSensesExercise(steps, index + 1, contentEl);
    });
  }

  function stopGroundingExercise() {
    currentExercise = null;
    if (exerciseInterval) clearInterval(exerciseInterval);
    
    const card = document.getElementById('uplift-grounding-card');
    if (card) card.style.display = 'none';
  }

  // =====================================================
  // HUMAN HELP BANNER
  // =====================================================
  
  function showHumanHelpBanner() {
    const banner = document.getElementById('uplift-banner-human-help');
    if (banner) {
      banner.style.display = 'block';
    }
  }

  function hideHumanHelpBanner() {
    const banner = document.getElementById('uplift-banner-human-help');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  // =====================================================
  // RESOURCE FUNCTIONS
  // =====================================================
  
  function copyResources() {
    const resources = CRISIS_RESOURCES.UK.map(r => 
      `${r.name}: ${r.number} (${r.note})`
    ).join('\n');

    navigator.clipboard.writeText(resources).then(() => {
      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Resources copied', 'success');
      }
    }).catch(err => {
      console.error('Failed to copy resources:', err);
    });
  }

  // =====================================================
  // MESSAGE HANDLING
  // =====================================================
  
  function handleMessage(text) {
    // 1. ALWAYS detect lane first
    const detectedLane = detectLane(text);
    setLane(detectedLane);

    // 2. Generate appropriate response based on lane
    let response;
    switch (detectedLane) {
      case 'U3':
        response = getCrisisResponse();
            break;
      case 'U2':
        response = getHighConcernResponse();
            break;
      case 'U1':
        response = getDistressResponse();
            break;
          default:
        response = getStableResponse(text);
    }

    return {
      response: response,
      lane: detectedLane,
      showResources: detectedLane === 'U3' || detectedLane === 'U2',
      escalate: detectedLane === 'U3'
    };
  }

  // =====================================================
  // MOOD BUTTONS
  // =====================================================
  
  function initMoodButtons() {
    const moodButtons = document.querySelectorAll('.uplift-mood-btn');
    
    moodButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const mood = this.dataset.mood;
        const lane = this.dataset.lane;

        // Set lane based on mood
        if (lane) {
          setLane(lane);
        }

        // Handle "unsafe" mood specially
        if (mood === 'unsafe') {
          setLane('U3');
          return;
        }

        // Get mood-specific response
        const moodResponses = {
          overwhelmed: "That's a lot to carry. Let's try to bring things down a notch. Would a breathing exercise help, or would you prefer to talk through what's on your plate?",
          anxious: "Anxiety can feel so physical. Let's slow your system down. Would you like to try the 5-4-3-2-1 grounding exercise?",
          sad: "Sadness is valid. You don't have to push it away. I'm here to sit with you. What's weighing on you most?",
          angry: "Anger often comes from something feeling unfair. What's crossed the line for you?",
          flat: "Flat isn't failure. It's often your mind going into low-power mode. What's the smallest thing that might shift something - even a little?",
          hopeless: "Hopelessness is exhausting. I hear you. You've reached out, which matters. Can we look at one small thing together?",
          ok: "Glad you're checking in. What's been helping you feel okay?"
        };

        const response = moodResponses[mood] || "Thanks for sharing. Tell me more about how you're feeling.";
        
        // Add to chat
        appendToChat('system', response);

        // Speak response
        if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
          GRACEX_TTS.speak(response);
        }

        // Highlight selected mood
        moodButtons.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  }

  // =====================================================
  // CHAT FUNCTIONS
  // =====================================================
  
  function appendToChat(role, text) {
    const output = document.getElementById('uplift-brain-output');
    if (!output) return;

    const msg = document.createElement('div');
    msg.className = `brain-message brain-message-${role}`;
    msg.textContent = text;
    output.appendChild(msg);
    output.scrollTop = output.scrollHeight;
  }

  async function handleChatInput() {
    const input = document.getElementById('uplift-brain-input');
    const output = document.getElementById('uplift-brain-output');
    
    if (!input || !output) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendToChat('user', text);

    // Handle via lane detection and response
    const result = handleMessage(text);

    // Try to get AI response if available, otherwise use local
    let response = result.response;

    try {
      if (window.runModuleBrain && !crisisMode) {
        // Use Level 5 brain for non-crisis (API may have better responses)
        const aiResponse = await window.runModuleBrain('uplift', text);
        if (aiResponse && typeof aiResponse === 'string') {
          // Check AI response for safety - don't use if it seems unsafe
          const aiLane = detectLane(aiResponse);
          if (aiLane !== 'U3') {
            response = aiResponse;
          }
        }
      }
    } catch (err) {
      console.warn('[GRACEX UPLIFT] API unavailable, using local response');
    }

    appendToChat('ai', response);

    // Speak response (slower in crisis/distress)
    if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
      GRACEX_TTS.speak(response);
    }
  }

  // =====================================================
  // CRISIS BUTTON HANDLERS
  // =====================================================
  
  function initCrisisButtons() {
    // "Yes, I'm safe" button
    document.getElementById('uplift-btn-safe-yes')?.addEventListener('click', () => {
      appendToChat('system', "I'm glad to hear that. I'm still here if you want to talk. Is there anything that would help right now?");
      // Can exit crisis mode if user confirms safety
      setLane('U2'); // Stay at high concern, don't immediately drop to U0
    });

    // "No, I'm not safe" button
    document.getElementById('uplift-btn-safe-no')?.addEventListener('click', () => {
      appendToChat('system', 
        "Thank you for being honest with me. Your safety matters most right now. " +
        "Please consider calling someone who can be with you - Samaritans (116 123), " +
        "a trusted friend, or emergency services (999) if you're in immediate danger."
      );
      // Stay in crisis mode, emphasize resources
      const actions = document.getElementById('uplift-crisis-actions');
      if (actions) {
        actions.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Emergency call button
    document.getElementById('uplift-btn-call-emergency')?.addEventListener('click', () => {
      if (confirm('This will open your phone dialer to call 999. Continue?')) {
        window.location.href = 'tel:999';
      }
    });

    // Samaritans button
    document.getElementById('uplift-btn-call-crisisline')?.addEventListener('click', () => {
      if (confirm('This will open your phone dialer to call Samaritans (116 123). Continue?')) {
        window.location.href = 'tel:116123';
      }
    });

    // Text crisis line
    document.getElementById('uplift-btn-text-crisisline')?.addEventListener('click', () => {
      if (confirm('This will open your messaging app to text SHOUT to 85258. Continue?')) {
        window.location.href = 'sms:85258?body=SHOUT';
      }
    });

    // "I'm not safe" button in chat footer
    document.getElementById('uplift-btn-i-am-not-safe')?.addEventListener('click', () => {
      setLane('U3');
    });

    // Copy resources
    document.getElementById('uplift-btn-copy-crisis-resources')?.addEventListener('click', copyResources);
    document.getElementById('uplift-btn-copy-resources')?.addEventListener('click', copyResources);
  }

  // =====================================================
  // GROUNDING BUTTON HANDLERS
  // =====================================================
  
  function initGroundingButtons() {
    document.getElementById('uplift-btn-breathing-60')?.addEventListener('click', () => {
      startGroundingExercise('breathing60');
    });

    document.getElementById('uplift-btn-breathing-120')?.addEventListener('click', () => {
      startGroundingExercise('breathing120');
    });

    document.getElementById('uplift-btn-54321')?.addEventListener('click', () => {
      startGroundingExercise('senses54321');
    });

    document.getElementById('uplift-btn-body-scan')?.addEventListener('click', () => {
      startGroundingExercise('bodyScan');
    });

    document.getElementById('uplift-grounding-stop')?.addEventListener('click', () => {
      stopGroundingExercise();
    });
  }

  // =====================================================
  // PLAN GENERATOR
  // =====================================================
  
  function initPlanGenerator() {
    document.getElementById('uplift-btn-plan-generate')?.addEventListener('click', () => {
      const suggestions = {
        '10min': ['Make a cup of tea', 'Step outside for fresh air', 'Splash cold water on your face', 'Put on a song you like'],
        'today': ['Go for a 10-minute walk', 'Call or text someone', 'Do one small task you\'ve been putting off', 'Take a proper break']
      };

      const input10 = document.getElementById('uplift-plan-10min');
      const inputToday = document.getElementById('uplift-plan-today');

      if (input10 && !input10.value) {
        input10.value = suggestions['10min'][Math.floor(Math.random() * suggestions['10min'].length)];
      }
      if (inputToday && !inputToday.value) {
        inputToday.value = suggestions['today'][Math.floor(Math.random() * suggestions['today'].length)];
      }

      if (window.GRACEX_Utils) {
        GRACEX_Utils.showToast('Plan suggestions added', 'success');
      }
    });

    document.getElementById('uplift-btn-plan-copy')?.addEventListener('click', () => {
      const whats = document.getElementById('uplift-plan-whats-hard')?.value || '';
      const min10 = document.getElementById('uplift-plan-10min')?.value || '';
      const today = document.getElementById('uplift-plan-today')?.value || '';
      const person = document.getElementById('uplift-plan-person')?.value || '';

      const plan = [
        'My Support Plan',
        '═══════════════',
        '',
        `What's hard: ${whats || 'Not specified'}`,
        `Next 10 minutes: ${min10 || 'Not set'}`,
        `Today: ${today || 'Not set'}`,
        `Someone to reach out to: ${person || 'Not specified'}`,
        '',
        'Remember: One step at a time. You\'ve got this.'
      ].join('\n');

      navigator.clipboard.writeText(plan).then(() => {
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Plan copied', 'success');
        }
      });
    });
  }

  // =====================================================
  // BRAIN WIRING
  // =====================================================
  
  function wireUpliftBrain() {
    const input = document.getElementById('uplift-brain-input');
    const sendBtn = document.getElementById('uplift-brain-send');
    const clearBtn = document.getElementById('uplift-brain-clear');

    if (sendBtn) {
      sendBtn.addEventListener('click', handleChatInput);
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleChatInput();
      }
    });
  }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const output = document.getElementById('uplift-brain-output');
        if (output) {
          output.innerHTML = `
            <div class="brain-message brain-message-system">
              I'm here to listen. When you're ready, tell me how you're feeling or what's on your mind. 
              No pressure, no judgement.
            </div>
          `;
        }
        setLane('U0');
      });
    }

    // Also wire the centralized brain helper if available
    if (window.setupModuleBrain) {
      window.setupModuleBrain('uplift', {
        panelId: 'uplift-brain-panel',
        inputId: 'uplift-brain-input',
        sendId: 'uplift-brain-send',
        outputId: 'uplift-brain-output',
        clearId: 'uplift-brain-clear',
        initialMessage: "I'm here to listen. When you're ready, tell me how you're feeling or what's on your mind. No pressure, no judgement."
      });
    }
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================
  
  function init() {
    console.log('[GRACEX UPLIFT] Initializing v2.0 - Human-First Safety Module');

    // Initialize all components
    initMoodButtons();
    initCrisisButtons();
    initGroundingButtons();
    initPlanGenerator();
    wireUpliftBrain();

    // Set initial lane
    setLane('U0');

    // Log session start (session only, not persisted)
    sessionStartTime = Date.now();

    console.log('[GRACEX UPLIFT] ✅ Initialized successfully');
    console.log('[GRACEX UPLIFT] ⚠️ Safety rules active - human-first escalation enabled');
  }

  // =====================================================
  // MODULE HOOKS
  // =====================================================
  
  document.addEventListener('gracex:module:loaded', function(ev) {
    try {
      const detail = ev.detail || {};
      const mod = detail.module || '';
      const url = detail.url || '';

      if (mod === 'uplift' || (url && url.indexOf('uplift.html') !== -1)) {
        setTimeout(init, 100);
      }
    } catch (err) {
      console.warn('[GRACEX UPLIFT] Init via event failed:', err);
    }
  });

  // Direct open
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // Expose API for other modules
  window.GRACEX_Uplift = {
    detectLane,
    setLane,
    getLane: () => currentLane,
    isCrisisMode: () => crisisMode,
    handleMessage,
    startGroundingExercise,
    CRISIS_RESOURCES
  };

})();
