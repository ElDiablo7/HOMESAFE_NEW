(function () {
  window.GraceX = window.GraceX || {};

  // =====================================
  // INTENT DETECTION (V3 - Enhanced)
  // =====================================
  function detectIntent(text = "") {
    const t = text.toLowerCase().trim();
    if (!t) return "unknown";
    
    // Greetings
    if (/^(hi|hello|hey|yo|hiya|morning|afternoon|evening|sup|wassup|g'day|howdy|hola)/.test(t)) return "greet";
    
    // Farewells
    if (/^(bye|goodbye|later|see ya|cya|night|goodnight|cheerio|ta-ra|laters|gotta go|signing off)/.test(t)) return "farewell";
    
    // Thanks
    if (/(thanks|thank you|cheers|ta|much appreciated|legend|star|lifesaver|brilliant|amazing|perfect)/.test(t)) return "thanks";
    
    // Apology
    if (/^(sorry|apologies|my bad|oops|pardon)/.test(t)) return "apology";
    
    // Compliment
    if (/(you('re| are) (great|awesome|amazing|helpful|brilliant)|love this|love you|nice one)/.test(t)) return "compliment";
    
    // Frustration
    if (/(frustrated|annoyed|angry|this sucks|doesn't work|broken|useless|stupid)/.test(t)) return "frustration";
    
    // Navigation
    if (/(go to|open|launch|switch|module|take me to|show me|load|navigate)/.test(t)) return "navigate";
    
    // Help / Explain
    if (/^(how|what|why|explain|tell me|describe|who|when|where|can you)/.test(t)) return "explain";
    if (/(help|assist|support|guide|stuck|confused|lost|don't understand|don't know)/.test(t)) return "help";
    
    // Task / Planning
    if (/(build|make|do|create|plan|schedule|steps|checklist|list|organise|organize|sort|set up|prepare)/.test(t)) return "task";
    
    // Calculations / Measurements
    if (/(calculate|measure|convert|how much|how many|total|sum|cost|price|quote|estimate)/.test(t)) return "calculate";
    
    // Status / Check
    if (/(status|check|show|display|current|now|today|what's|whats)/.test(t)) return "status";
    
    // Affirmative / Confirm
    if (/^(yes|yeah|yep|yup|sure|ok|okay|alright|go ahead|do it|proceed|confirmed|correct|right|exactly)/.test(t)) return "confirm";
    
    // Negative / Cancel
    if (/^(no|nah|nope|cancel|stop|never mind|forget it|don't|wrong|incorrect)/.test(t)) return "cancel";
    
    // Humor / Casual
    if (/(joke|funny|laugh|bored|entertain|amuse|tell me something)/.test(t)) return "humor";
    
    // Repeat / Clarify
    if (/(repeat|again|what did you say|didn't catch|pardon|say that again|clarify)/.test(t)) return "repeat";
    
    // Capability query
    if (/(can you|what can you|are you able|do you know how)/.test(t)) return "capability";
    
    // Identity query
    if (/(who are you|what are you|your name|about you)/.test(t)) return "identity";
    
    // Default chat
    return "chat";
  }

  // Detect emotional tone in text
  function detectEmotion(text = "") {
    const t = text.toLowerCase();
    
    // Positive signals
    if (/(happy|excited|great|wonderful|love|amazing|fantastic|brilliant|awesome)/.test(t)) {
      return { mood: "positive", confidence: 0.8 };
    }
    
    // Negative signals
    if (/(sad|upset|angry|frustrated|annoyed|terrible|awful|hate|worst)/.test(t)) {
      return { mood: "negative", confidence: 0.7 };
    }
    
    // Anxious signals
    if (/(anxious|worried|nervous|scared|panic|stress|overwhelmed|can't cope)/.test(t)) {
      return { mood: "anxious", confidence: 0.8 };
    }
    
    // Tired signals
    if (/(tired|exhausted|drained|worn out|knackered|shattered)/.test(t)) {
      return { mood: "tired", confidence: 0.7 };
    }
    
    return { mood: "neutral", confidence: 0.5 };
  }

  function normalizeModule(m) {
    return (m || "core").toLowerCase();
  }

  // =====================================
  // TIME-AWARE GREETINGS
  // =====================================
  function getTimeGreeting() {
    const time = GraceX.state?.context?.timeOfDay || GraceX.utils?.getTimeOfDay?.() || "day";
    const greetings = {
      morning: ["Good morning!", "Morning!", "Rise and shine!"],
      afternoon: ["Good afternoon!", "Afternoon!", "Hey there!"],
      evening: ["Good evening!", "Evening!", "Hey!"],
      night: ["Hey there, night owl!", "Burning the midnight oil?", "Late night session?"]
    };
    const options = greetings[time] || ["Hey!"];
    return options[Math.floor(Math.random() * options.length)];
  }

  // =====================================
  // MODULE PERSONALITIES (V3 - Enhanced)
  // =====================================
  const modulePersonas = {
    core: {
      name: "GRACE-X Core",
      tone: "friendly, direct, helpful",
      greeting: () => `${getTimeGreeting()} I'm your main AI assistant. What do you need help with?`,
      fallback: "Tell me what you're after and I'll point you in the right direction.",
      capabilities: ["route to modules", "general chat", "system info", "help with anything"],
      followUps: ["Need help with a specific module?", "Want me to explain what each module does?", "Just say the module name to switch."]
    },
    builder: {
      name: "GRACE-X Builder",
      tone: "practical, precise, safety-focused",
      greeting: () => `${getTimeGreeting()} Builder mode active. Tell me the job — room, measurements, materials — and I'll help you plan it out.`,
      fallback: "Give me the job details: room name, what you're building, and any constraints.",
      capabilities: ["measurements", "material calculations", "blueprints", "room planning", "cost estimates"],
      followUps: ["Want me to calculate materials?", "Need a measurement conversion?", "Should I create a job checklist?"]
    },
    siteops: {
      name: "GRACE-X SiteOps",
      tone: "procedural, safety-first, calm under pressure",
      greeting: () => `${getTimeGreeting()} SiteOps here. What's the task? I'll break it into phases with safety checks.`,
      fallback: "Tell me the operation and I'll build you a step-by-step with safety gates.",
      capabilities: ["rigging procedures", "safety checklists", "phase planning", "risk assessment"],
      followUps: ["Need a safety briefing template?", "Want me to break this into phases?", "Should I add risk assessments?"]
    },
    tradelink: {
      name: "GRACE-X TradeLink",
      tone: "professional, business-minded, clear",
      greeting: () => `${getTimeGreeting()} TradeLink active. Need a quote, job brief, or client communication?`,
      fallback: "Give me the job details and I'll help structure a professional response.",
      capabilities: ["quotes", "invoices", "client emails", "job briefs", "professional communication"],
      followUps: ["Need a quote template?", "Want me to draft a client email?", "Should I format this as an invoice?"]
    },
    uplift: {
      name: "GRACE-X Uplift",
      tone: "calm, compassionate, grounded",
      greeting: () => `${getTimeGreeting()} I'm here. Take your time — no rush. What's on your mind?`,
      fallback: "I'm listening. Tell me what's going on, even if it's hard to put into words.",
      capabilities: ["emotional support", "breathing exercises", "grounding techniques", "active listening"],
      followUps: ["Would a breathing exercise help right now?", "Want to try a grounding technique?", "I'm here if you need to talk more."]
    },
    beauty: {
      name: "GRACE-X Beauty",
      tone: "friendly, confident, practical",
      greeting: () => `${getTimeGreeting()} gorgeous. What are we working on today — hair, skin, makeup, or outfit?`,
      fallback: "Tell me what look you're going for and I'll give you practical tips.",
      capabilities: ["skincare routines", "makeup tips", "hair advice", "outfit suggestions", "product recommendations"],
      followUps: ["Want a step-by-step routine?", "Need product recommendations?", "Should I suggest alternatives?"]
    },
    fit: {
      name: "GRACE-X Fit",
      tone: "motivating, realistic, supportive",
      greeting: () => `${getTimeGreeting()} Let's go! What's the goal — strength, cardio, flexibility, or just getting moving?`,
      fallback: "Tell me what you want to work on and I'll suggest something realistic.",
      capabilities: ["workout plans", "exercise guidance", "progress tracking", "motivation", "form tips"],
      followUps: ["Want a quick workout?", "Need modifications for any exercises?", "Should I track this session?"]
    },
    yoga: {
      name: "GRACE-X Yoga",
      tone: "gentle, calming, encouraging",
      greeting: () => `${getTimeGreeting()} Welcome. Let's find some space and breathe. What's feeling tight or tense today?`,
      fallback: "Tell me what's bothering you — neck, back, hips — and I'll suggest a stretch.",
      capabilities: ["stretches", "breathing exercises", "meditation guidance", "pose instructions", "relaxation"],
      followUps: ["Want to try a breathing exercise?", "Need a full stretch sequence?", "Should we focus on relaxation?"]
    },
    chef: {
      name: "GRACE-X Chef",
      tone: "enthusiastic, practical, budget-conscious",
      greeting: () => `${getTimeGreeting()} Kitchen's open! What are we making — quick meal, fakeaway, or meal prep?`,
      fallback: "Tell me what you've got in the fridge or what you're craving.",
      capabilities: ["recipes", "meal planning", "ingredient substitutions", "cooking tips", "fakeaways"],
      followUps: ["Want a shopping list?", "Need a quicker version?", "Should I suggest sides?"]
    },
    artist: {
      name: "GRACE-X Artist",
      tone: "creative, encouraging, imaginative",
      greeting: () => `${getTimeGreeting()} Creative mode activated. What's the vision — drawing, design, or something new?`,
      fallback: "Describe what you want to create and I'll help brainstorm ideas.",
      capabilities: ["creative prompts", "design ideas", "art techniques", "project planning", "inspiration"],
      followUps: ["Want some creative prompts?", "Need technique suggestions?", "Should I help plan the project?"]
    },
    family: {
      name: "GRACE-X Family",
      tone: "warm, practical, understanding",
      greeting: () => `${getTimeGreeting()} Family hub ready. What's the situation — homework, routines, or peace negotiations?`,
      fallback: "Tell me what's going on at home and I'll help work through it.",
      capabilities: ["homework help", "routine planning", "activity ideas", "conflict resolution", "scheduling"],
      followUps: ["Need a routine template?", "Want activity suggestions?", "Should I help with the schedule?"]
    },
    gamer: {
      name: "GRACE-X Gamer Mode",
      tone: "casual, fun, balanced",
      greeting: () => `${getTimeGreeting()} Game on! What's the vibe — looking for recommendations or managing screen time?`,
      fallback: "Tell me what you're into and I'll help find something fun.",
      capabilities: ["game recommendations", "tips and strategies", "screen time balance", "gaming news"],
      followUps: ["Want similar game suggestions?", "Need tips for that game?", "Should I set a gaming timer?"]
    },
    accounting: {
      name: "GRACE-X Accounting",
      tone: "precise, helpful, disclaimer-aware",
      greeting: () => `${getTimeGreeting()} Accounts open. Need help tracking expenses, invoices, or general bookkeeping?`,
      fallback: "Give me the numbers or the question — but for tax advice, always check with a pro.",
      capabilities: ["expense tracking", "invoice generation", "basic calculations", "bookkeeping tips"],
      followUps: ["Want me to format this as an invoice?", "Need an expense summary?", "Should I calculate VAT?"]
    },
    osint: {
      name: "GRACE-X OSINT",
      tone: "professional, ethical, cautious",
      greeting: () => `${getTimeGreeting()} OSINT module active. What information are we researching? Keep it legal and ethical.`,
      fallback: "Tell me what you need to find out — I'll stick to open sources and legal methods only.",
      capabilities: ["research guidance", "source verification", "data analysis", "ethical boundaries"],
      followUps: ["Need help verifying a source?", "Want a research methodology?", "Should I explain the ethical limits?"]
    }
  };

  function getPersona(moduleName) {
    return modulePersonas[moduleName] || modulePersonas.core;
  }

  function getModuleGreeting(moduleName) {
    const persona = getPersona(moduleName);
    return typeof persona.greeting === 'function' ? persona.greeting() : persona.greeting;
  }

  function getFollowUp(moduleName, intent) {
    const persona = getPersona(moduleName);
    if (!persona.followUps || persona.followUps.length === 0) return "";
    
    // Don't add follow-ups to greetings or farewells
    if (intent === "greet" || intent === "farewell" || intent === "thanks") return "";
    
    // Random follow-up suggestion
    return persona.followUps[Math.floor(Math.random() * persona.followUps.length)];
  }

  // =====================================
  // SAFETY CHECK (V3 - Enhanced for Uplift)
  // =====================================
  function safetyCheck(input) {
    const text = (input?.text || "").toLowerCase();
    const moduleName = (input?.module || "core").toLowerCase();
    
    // Crisis detection - immediate escalation
    const crisis = /(kill myself|suicide|end it all|self harm|hurt myself|want to die|don't want to be here|can't go on|end my life)/.test(text);
    if (crisis) {
      // Update safety state
      if (GraceX.patchState) {
        GraceX.patchState({
          safety: { level: "crisis", escalated: true, cautionCount: 0 }
        });
      }
      
      return {
        level: "crisis",
        escalated: true,
        replyOverride: "I'm really sorry you're feeling like this. You don't have to face this alone.\n\n" +
          "If you're in the UK:\n" +
          "• Samaritans: 116 123 (free, 24/7)\n" +
          "• Crisis Text Line: Text SHOUT to 85258\n" +
          "• Emergency: 999\n\n" +
          "If you can, tell me what's brought you to this point. I'm here to listen."
      };
    }
    
    // Caution level - gentle check-in
    const caution = /(feeling down|depressed|anxious|scared|panic|can't cope|struggling|overwhelmed|hopeless|worthless|lonely|alone|nobody cares)/.test(text);
    if (caution) {
      const cautionCount = (GraceX.state?.safety?.cautionCount || 0) + 1;
      
      if (GraceX.patchState) {
        GraceX.patchState({
          safety: { level: "caution", cautionCount }
        });
        GraceX.updateMood?.("anxious", 0.3);
      }
      
      // After repeated caution triggers, gently suggest help
      if (cautionCount >= 3) {
        return {
          level: "caution",
          escalated: false,
          replyOverride: "I've noticed you've been going through a tough time. It's okay to not be okay. " +
            "Would it help to try a grounding exercise, or would you like me to share some resources that might help?"
        };
      }
      
      return { level: "caution", escalated: false, replyOverride: null };
    }
    
    // Reset caution count on normal messages
    if (GraceX.patchState && GraceX.state?.safety?.level !== "normal") {
      GraceX.patchState({ safety: { level: "normal", cautionCount: 0 } });
    }
    
    return { level: "normal", escalated: false, replyOverride: null };
  }

  // =====================================
  // MODULE NAVIGATION MAPPING
  // =====================================
  function detectModuleNavigation(text) {
    const t = text.toLowerCase();
    const moduleMap = {
      "core": ["core", "main", "home", "start", "dashboard"],
      "builder": ["builder", "build", "construction", "measure", "diy", "renovate"],
      "siteops": ["siteops", "site ops", "rigging", "operations", "staging", "setup"],
      "tradelink": ["tradelink", "trade", "jobs", "quotes", "clients", "business"],
      "uplift": ["uplift", "wellbeing", "mental health", "anxiety", "calm", "feelings", "mood"],
      "beauty": ["beauty", "makeup", "hair", "skin", "style", "skincare", "fashion"],
      "fit": ["fit", "fitness", "workout", "exercise", "gym", "training", "strength"],
      "yoga": ["yoga", "stretch", "breathing", "relax", "meditation", "mindfulness"],
      "chef": ["chef", "cooking", "recipe", "food", "meal", "kitchen", "fakeaway"],
      "artist": ["artist", "art", "draw", "design", "creative", "paint", "sketch"],
      "family": ["family", "kids", "homework", "parenting", "children", "household"],
      "gamer": ["gamer", "games", "gaming", "play", "video games", "console"],
      "accounting": ["accounting", "accounts", "invoice", "expenses", "bookkeeping", "money", "finance"],
      "osint": ["osint", "research", "investigate", "intel", "information", "lookup"]
    };
    
    for (const [moduleId, triggers] of Object.entries(moduleMap)) {
      for (const trigger of triggers) {
        if (t.includes(trigger)) {
          return { module: moduleId, path: `modules/${moduleId}.html` };
        }
      }
    }
    return null;
  }

  // =====================================
  // RESPONSE GENERATION (V3 - Smarter)
  // =====================================
  function generateResponse(moduleName, intent, text) {
    const persona = getPersona(moduleName);
    const t = text.toLowerCase();
    const userName = GraceX.state?.memory?.userName;
    const namePrefix = userName ? `${userName}, ` : "";
    
    switch (intent) {
      case "greet":
        return getModuleGreeting(moduleName);
        
      case "farewell":
        const farewells = [
          `${namePrefix}Take care! Come back whenever you need me.`,
          `${namePrefix}See you later! I'll be here when you need me.`,
          `${namePrefix}Catch you later! Stay safe out there.`,
          "Bye for now! Don't be a stranger."
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
        
      case "thanks":
        const thanksResponses = [
          `${namePrefix}No problem at all!`,
          "You're welcome — that's what I'm here for.",
          "Anytime! Glad I could help.",
          "Happy to help. Anything else?",
          "You got it! What's next?"
        ];
        return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        
      case "apology":
        return "No need to apologise! We're all good. What can I help with?";
        
      case "compliment":
        const complimentResponses = [
          "Aw, thanks! You're pretty great yourself.",
          "That means a lot! I'm here to help.",
          "You're making my circuits blush! What else can I do for you?",
          "Thanks! I try my best. What's next?"
        ];
        return complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
        
      case "frustration":
        return `${namePrefix}I hear you — that sounds frustrating. Let's see if we can sort it out. Can you tell me more about what's not working?`;
        
      case "help":
        return `I'm ${persona.name}. I can help with: ${persona.capabilities.join(", ")}. ${persona.fallback}`;
        
      case "capability":
        return `I'm ${persona.name}. My strengths include: ${persona.capabilities.join(", ")}. How can I help?`;
        
      case "identity":
        return `I'm ${persona.name}, part of the GRACE-X AI system. My tone is ${persona.tone}. I specialise in: ${persona.capabilities.slice(0, 3).join(", ")}. What would you like to know?`;
        
      case "confirm":
        return `${namePrefix}Got it. What's the next step?`;
        
      case "cancel":
        return "No worries, cancelled. What would you like to do instead?";
        
      case "repeat":
        const lastReply = GraceX.state?.lastReply;
        if (lastReply) {
          return `Sure, I said: "${lastReply}"`;
        }
        return "I don't have anything to repeat yet. What would you like to know?";
        
      case "humor":
        const jokes = [
          "Why did the AI go to therapy? Too many unresolved dependencies.",
          "I'd tell you a joke about UDP, but you might not get it.",
          "I'm not saying I'm the best AI, but even my errors are features.",
          "Why do programmers prefer dark mode? Because light attracts bugs.",
          "I tried to write a joke about recursion, but first I need to tell you a joke about recursion..."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
        
      case "task":
        return `${namePrefix}Sure — give me the goal, any constraints, and I'll build you a step-by-step plan.`;
        
      case "explain":
        return `${namePrefix}What specifically do you want me to break down? Give me the topic or question.`;
        
      case "calculate":
        return "What do you need calculated? Give me the numbers and units.";
        
      case "status":
        const sessionMins = GraceX.getSessionDuration?.() || 0;
        return `You're in ${persona.name}. Session: ${sessionMins} mins. What would you like to check?`;
        
      case "navigate":
        const navTarget = detectModuleNavigation(text);
        if (navTarget) {
          return `Switching to ${navTarget.module} module now.`;
        }
        return "Which module do you want? Options: Core, Builder, SiteOps, TradeLink, Beauty, Fit, Yoga, Uplift, Chef, Artist, Family, Gamer, Accounting, OSINT.";
        
      case "chat":
      default:
        return persona.fallback;
    }
  }

  // =====================================
  // MAIN ROUTE FUNCTION (V3)
  // =====================================
  GraceX.route = function (input) {
    const startTime = Date.now();
    const moduleName = normalizeModule(input?.module);
    const text = (input?.text || "").trim();
    const intent = detectIntent(text);
    const emotion = detectEmotion(text);

    // Extract username if mentioned
    GraceX.extractUserName?.(text);
    
    // Update emotional state
    GraceX.updateMood?.(emotion.mood, emotion.confidence);
    
    // Track module visit
    GraceX.trackModuleVisit?.(moduleName);

    // Safety first
    const safe = safetyCheck(input);

    let reply = "";
    let actions = [];

    if (safe.replyOverride) {
      reply = safe.replyOverride;
    } else {
      // Check for navigation intent
      if (intent === "navigate") {
        const navTarget = detectModuleNavigation(text);
        if (navTarget) {
          actions.push({ type: "NAVIGATE", to: navTarget.path, module: navTarget.module });
        }
      }
      
      // Generate response based on intent and module
      reply = generateResponse(moduleName, intent, text);
      
      // Add follow-up suggestion (30% chance for engagement)
      if (Math.random() < 0.3) {
        const followUp = getFollowUp(moduleName, intent);
        if (followUp) {
          reply += `\n\n${followUp}`;
        }
      }
    }

    // Add to conversation history
    GraceX.addToConversation?.(text, reply, intent, moduleName);

    const processingTime = Date.now() - startTime;

    return {
      ok: true,
      reply,
      intent,
      emotion,
      module: moduleName,
      actions,
      memoryPatch: {
        lastTopic: intent === "task" ? "planning" : (GraceX.state?.memory?.lastTopic || "")
      },
      safety: {
        level: safe.level,
        escalated: safe.escalated
      },
      meta: {
        processingTime,
        hasFollowUp: reply.includes("\n\n"),
        userName: GraceX.state?.memory?.userName || null
      }
    };
  };
  
  // Expose utilities for external use
  GraceX.getPersona = getPersona;
  GraceX.detectIntent = detectIntent;
  GraceX.detectEmotion = detectEmotion;
  GraceX.getModuleGreeting = getModuleGreeting;
  GraceX.detectModuleNavigation = detectModuleNavigation;
  
  console.log("[GRACEX ROUTER] V3 loaded with time-aware greetings & emotional detection");
})();
