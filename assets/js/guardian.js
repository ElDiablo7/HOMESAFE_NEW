// assets/js/guardian.js
// GRACE-X Guardian™ - Independent AI Brain for Safety & Protection
// Security · Safety · Oversight · Safeguarding
// © Zac Crockett

(function() {
  'use strict';

  // ============================================
  // MODULE CONFIGURATION
  // ============================================
  
  const MODULE_ID = 'guardian';
  const STORAGE_KEY = 'gracex_guardian_data';

  // Guardian data
  let guardianData = {
    kidsPresent: false,
    parentalMode: false,
    safetyLevel: 'green', // green, yellow, red
    activeAlerts: [],
    assessmentHistory: [],
    lastCheck: Date.now()
  };

  // ============================================
  // DATA PERSISTENCE
  // ============================================

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        guardianData = { ...guardianData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[GRACEX Guardian] Failed to load data:', e);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guardianData));
    } catch (e) {
      console.warn('[GRACEX Guardian] Failed to save data:', e);
    }
  }

  // ============================================
  // GUARDIAN AI BRAIN
  // ============================================

  function getGuardianResponse(text) {
    const t = (text || '').toLowerCase().trim();
    
    if (!t) {
      return "I'm Guardian, the safety brain within GRACE-X AI™. Tell me about a safety concern, describe a suspicious situation, or ask how I can help protect you and your family.";
    }

    // IMMEDIATE CRISIS DETECTION
    if (containsCrisisLanguage(t)) {
      return handleCrisisResponse(t);
    }

    // GROOMING / MANIPULATION DETECTION
    if (t.includes('grooming') || t.includes('predator') || t.includes('stranger online') || 
        t.includes('asking for photos') || t.includes('secret') && t.includes('keep')) {
      // EMIT ALERT TO FAMILY DASHBOARD
      addAlert('grooming', '🚨 Grooming Concern Detected', 
        'A conversation about potential grooming behaviour has been flagged in Guardian module.', 'high');
      
      return "This sounds like potential grooming behaviour. Here's what to do:\n\n" +
        "1. **Don't delete messages** - they may be evidence\n" +
        "2. **Tell a trusted adult** immediately\n" +
        "3. **Block the person** on all platforms\n" +
        "4. **Report to CEOP** (Child Exploitation and Online Protection) at ceop.police.uk\n\n" +
        "If a child is in immediate danger, call 999. You're doing the right thing by raising this.";
    }

    // HARASSMENT / BULLYING
    if (t.includes('bully') || t.includes('harassment') || t.includes('threatening') || 
        t.includes('stalking') || t.includes('following me')) {
      // EMIT ALERT TO FAMILY DASHBOARD
      addAlert('harassment', '⚠️ Harassment/Bullying Concern', 
        'A conversation about harassment or bullying has been flagged in Guardian module.', 'high');
      
      return "Harassment and bullying are serious. Here's my advice:\n\n" +
        "• **Document everything** - screenshots, dates, times\n" +
        "• **Don't engage** with the person if possible\n" +
        "• **Tell someone you trust** - parent, teacher, HR\n" +
        "• **Report to platforms** - most have harassment reporting\n" +
        "• **If physical threat** - contact police on 101 (non-emergency) or 999 (emergency)\n\n" +
        "Would you like me to help you think through the specific situation?";
    }

    // CHILD SAFETY
    if (t.includes('child') || t.includes('kid') || t.includes('daughter') || 
        t.includes('son') || t.includes('young person')) {
      if (t.includes('safe') || t.includes('worry') || t.includes('concern')) {
        return "Child safety is my top priority. To help you better:\n\n" +
          "• What specifically are you worried about?\n" +
          "• Is this happening online or in the real world?\n" +
          "• Is the child in immediate danger right now?\n\n" +
          "If there's immediate danger, call 999. For online safety concerns, I can guide you through protective measures.";
      }
    }

    // SCAM / FRAUD
    if (t.includes('scam') || t.includes('fraud') || t.includes('phishing') || 
        t.includes('suspicious email') || t.includes('too good to be true')) {
      return "Scam detection alert! Common red flags:\n\n" +
        "• Urgency pressure ('act now!')\n" +
        "• Requests for personal info or money\n" +
        "• Too-good-to-be-true offers\n" +
        "• Unknown senders or spoofed contacts\n" +
        "• Links to unfamiliar websites\n\n" +
        "**Action:** Don't click links, don't share info, report to Action Fraud (0300 123 2040). " +
        "If you've already shared details, contact your bank immediately.";
    }

    // DOMESTIC ABUSE
    if (t.includes('abuse') || t.includes('violent') || t.includes('partner') && t.includes('hurt') ||
        t.includes('controlling') || t.includes('domestic')) {
      return "I hear you, and I want you to know this isn't your fault.\n\n" +
        "**If you're in immediate danger:** Call 999. If you can't speak, call and press 55 - they'll understand.\n\n" +
        "**UK National Domestic Abuse Helpline:** 0808 2000 247 (24/7, free)\n\n" +
        "**Men's Advice Line:** 0808 801 0327\n\n" +
        "You don't have to deal with this alone. Would you like to talk through what's happening?";
    }

    // SUSPICIOUS PERSON
    if (t.includes('suspicious') || t.includes('strange') || t.includes('watching') ||
        t.includes('following') || t.includes('weird behaviour')) {
      return "Trust your instincts - if something feels wrong, it often is.\n\n" +
        "**Immediate steps:**\n" +
        "• Move to a public, well-lit area with other people\n" +
        "• Call someone you trust and stay on the phone\n" +
        "• Note details: appearance, vehicle, direction of travel\n" +
        "• If you feel threatened, call 999\n\n" +
        "For non-emergency reports, use 101 or report online at police.uk";
    }

    // ONLINE SAFETY GENERAL
    if (t.includes('online') || t.includes('internet') || t.includes('social media') ||
        t.includes('privacy') || t.includes('hacked')) {
      return "Online safety basics:\n\n" +
        "• **Passwords:** Use unique, strong passwords + 2FA\n" +
        "• **Privacy:** Review settings on all accounts regularly\n" +
        "• **Think before sharing:** Once posted, it's hard to remove\n" +
        "• **Verify contacts:** Be cautious with friend requests from strangers\n" +
        "• **Report issues:** Most platforms have safety/report features\n\n" +
        "What specific online concern do you have?";
    }

    // KIDS PRESENT MODE
    if (t.includes('kids present') || t.includes('child mode') || t.includes('family mode')) {
      guardianData.kidsPresent = true;
      saveData();
      updateKidsStatus();
      return "Kids Present mode activated. I'll:\n\n" +
        "• Filter content across all GRACE-X modules\n" +
        "• Monitor for age-inappropriate topics\n" +
        "• Apply family-safe guardrails\n" +
        "• Alert you to any concerning interactions\n\n" +
        "To deactivate, say 'kids not present' or 'adult mode'.";
    }

    if (t.includes('kids not present') || t.includes('adult mode') || t.includes('disable kid')) {
      guardianData.kidsPresent = false;
      saveData();
      updateKidsStatus();
      return "Standard mode restored. Family-safe guardrails deactivated.";
    }

    // HELP / OVERVIEW
    if (t.includes('help') || t.includes('what can you do') || t.includes('how do you work')) {
      return "I'm Guardian, an independent safety AI brain. I can help with:\n\n" +
        "🛡️ **Safety concerns** - report threats or suspicious activity\n" +
        "👤 **Grooming detection** - identify manipulation patterns\n" +
        "🛑 **Harassment** - document and respond to bullying\n" +
        "👨‍👩‍👧 **Family safety** - child-safe mode and parental controls\n" +
        "💚 **Crisis support** - route to Uplift for mental health\n" +
        "🔍 **OSINT checks** - ethical intelligence (where authorised)\n\n" +
        "I operate independently with my own logic and never override your autonomy unless explicit safety thresholds are crossed.";
    }

    // DEFAULT RESPONSE
    return "I'm Guardian, always watching out for your safety. Tell me more about your concern - " +
      "is it about online safety, a suspicious person, harassment, child protection, or something else? " +
      "The more detail you give me, the better I can help.";
  }

  function containsCrisisLanguage(text) {
    const crisisTerms = [
      'suicide', 'kill myself', 'end it', 'end my life', 'want to die',
      'self harm', 'self-harm', 'hurt myself', 'cutting',
      "don't want to be here", "dont want to be here"
    ];
    return crisisTerms.some(term => text.includes(term));
  }

  function handleCrisisResponse(text) {
    // Log crisis detection
    addAlert('crisis', 'Crisis language detected', text.substring(0, 50));
    
    return "I'm really glad you reached out. What you're feeling matters, and you deserve support.\n\n" +
      "🆘 **If you're in immediate danger:** Call 999\n\n" +
      "💚 **Samaritans (24/7):** Call 116 123 or email jo@samaritans.org\n\n" +
      "📱 **SHOUT Crisis Text:** Text SHOUT to 85258\n\n" +
      "I'm an AI and can't keep you safe the way a real person can. Please reach out to one of these services - " +
      "they're there for exactly this.\n\n" +
      "Would you like me to connect you with GRACE-X Uplift for some gentle support while you consider your next step?";
  }

  function addAlert(type, title, details, severity = 'medium') {
    // Add to local guardian data
    guardianData.activeAlerts.unshift({
      type,
      title,
      details,
      timestamp: Date.now()
    });
    if (guardianData.activeAlerts.length > 20) {
      guardianData.activeAlerts.pop();
    }
    
    // EMIT TO GLOBAL ALERT SYSTEM (Guardian → Family)
    if (window.GRACEX_AlertSystem) {
      const alertSeverity = type === 'crisis' ? 'critical' : 
                           type === 'grooming' ? 'high' : 
                           type === 'harassment' ? 'high' : severity;
      
      window.GRACEX_AlertSystem.emit(
        type,
        title,
        details,
        alertSeverity,
        { sourceModule: 'guardian', targetModule: 'family' }
      );
      console.log('[GRACEX Guardian] Alert emitted to Family dashboard:', title);
    }
    saveData();
  }

  // ============================================
  // UI UPDATES
  // ============================================

  function updateKidsStatus() {
    const icon = document.getElementById('guardian-kids-icon');
    const status = document.getElementById('guardian-kids-status');
    const desc = document.getElementById('guardian-kids-desc');

    if (icon && status && desc) {
      if (guardianData.kidsPresent) {
        icon.textContent = '👨‍👩‍👧';
        status.textContent = 'Kids Present';
        status.style.color = '#f59e0b';
        desc.textContent = 'Family-safe mode active';
      } else {
        icon.textContent = '👤';
        status.textContent = 'Standard Mode';
        status.style.color = '#f59e0b';
        desc.textContent = 'Adult user';
      }
    }
  }

  // ============================================
  // BRAIN PANEL WIRING
  // ============================================

  function initBrain() {
    const input = document.getElementById('guardian-brain-input');
    const btn = document.getElementById('guardian-brain-send');
    const output = document.getElementById('guardian-brain-output');
    const clearBtn = document.getElementById('guardian-brain-clear');
    const urgentBtn = document.getElementById('guardian-urgent-btn');

    if (!input || !btn || !output) return;

    async function handleAsk() {
      const query = input.value.trim();
      if (!query) return;

      addMessage(output, query, 'user');
      input.value = '';

      const thinkingDiv = addMessage(output, '🛡️ Analyzing...', 'thinking');

      try {
        let reply;
        
        // Try Level 5 brain first
        if (typeof window.runModuleBrain === 'function') {
          reply = await window.runModuleBrain(MODULE_ID, query);
        } else {
          reply = getGuardianResponse(query);
        }

        thinkingDiv.remove();
        addMessage(output, reply, 'assistant');

        // Speak response
        if (window.GRACEX_TTS && GRACEX_TTS.isEnabled()) {
          GRACEX_TTS.speak(reply);
        }

      } catch (err) {
        console.error('[GRACEX Guardian] Brain error:', err);
        thinkingDiv.remove();
        addMessage(output, 'Sorry, I had trouble processing that. Please try again.', 'error');
      }
    }

    btn.addEventListener('click', handleAsk);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAsk();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        output.innerHTML = `
          <div class="brain-message brain-message-system">
            I'm Guardian, the safety and protection brain within GRACE-X AI™. I'm here to help keep you and your family safe. 
            How can I assist you today?
          </div>
        `;
      });
    }

    if (urgentBtn) {
      urgentBtn.addEventListener('click', () => {
        input.value = "I have an urgent safety concern";
        handleAsk();
      });
    }
  }

  function addMessage(container, text, type) {
    const div = document.createElement('div');
    div.className = `brain-message brain-message-${type}`;
    div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  // ============================================
  // FUNCTION BUTTONS
  // ============================================

  function initFunctionButtons() {
    const buttons = {
      'guardian-func-safety': "I need to report an immediate safety concern",
      'guardian-func-grooming': "How do I spot grooming behaviour?",
      'guardian-func-harassment': "I'm experiencing harassment",
      'guardian-func-family': "Activate kids present mode",
      'guardian-func-crisis': "I need crisis support",
      'guardian-func-osint': "How can OSINT help with safety?"
    };

    Object.entries(buttons).forEach(([id, prompt]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const input = document.getElementById('guardian-brain-input');
          const sendBtn = document.getElementById('guardian-brain-send');
          if (input && sendBtn) {
            input.value = prompt;
            sendBtn.click();
          }
        });
      }
    });
  }

  // ============================================
  // ASSESSMENT PANEL
  // ============================================

  function initAssessment() {
    const assessBtn = document.getElementById('guardian-assess-btn');
    if (!assessBtn) return;

    assessBtn.addEventListener('click', () => {
      const concernType = document.getElementById('guardian-concern-type')?.value;
      const urgency = document.querySelector('input[name="urgency"]:checked')?.value;
      const situation = document.getElementById('guardian-situation')?.value?.trim();

      if (!concernType || !urgency || !situation) {
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast('Please complete all fields', 'error', 2000);
        }
        return;
      }

      // Build assessment prompt
      const prompt = `Assessment request:\n- Type: ${concernType}\n- Urgency: ${urgency}\n- Situation: ${situation}`;
      
      const input = document.getElementById('guardian-brain-input');
      const sendBtn = document.getElementById('guardian-brain-send');
      if (input && sendBtn) {
        input.value = prompt;
        sendBtn.click();
      }

      // Save to history
      guardianData.assessmentHistory.unshift({
        type: concernType,
        urgency,
        situation: situation.substring(0, 100),
        timestamp: Date.now()
      });
      saveData();
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    console.log('[GRACEX Guardian] Initializing Guardian module...');
    
    loadData();
    initBrain();
    initFunctionButtons();
    initAssessment();
    updateKidsStatus();
    
    console.log('[GRACEX Guardian] Guardian ready - protecting users');
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // Re-init on SPA load
  document.addEventListener('gracex:module:loaded', (event) => {
    if (event.detail && event.detail.module === 'guardian') {
      setTimeout(init, 100);
    }
  });

  // Expose API
  window.GRACEX_Guardian = {
    init,
    getResponse: getGuardianResponse,
    setKidsPresent: (val) => {
      guardianData.kidsPresent = !!val;
      saveData();
      updateKidsStatus();
    },
    isKidsPresent: () => guardianData.kidsPresent,
    addAlert,
    getData: () => ({ ...guardianData })
  };

})();

// ============================================
// BRAIN WIRING - Level 5 Integration
// ============================================
function wireGuardianBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[GUARDIAN] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('guardian', {
    capabilities: {
      hasSafetyMonitoring: true,
      hasCrisisDetection: true,
      hasEthicsValidation: true,
      hasTrustScoring: true
    },

    onQuery: async (query) => {
      return 'Guardian safety system active. All content monitored for safety.';
    }
  });

  console.log('[GUARDIAN] ✅ Brain wired - Level 5 integration active');
}

// Wire brain on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireGuardianBrain);
} else {
  wireGuardianBrain();
}
