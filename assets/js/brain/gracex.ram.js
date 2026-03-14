/**
 * ═══════════════════════════════════════════════════════════════════════
 * GRACE-X RAM BRAIN™
 * ═══════════════════════════════════════════════════════════════════════
 * Purpose: Working memory buffer for temporary context, multi-step reasoning
 * Owner: Zac Crockett
 * Version: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * WHAT RAM BRAIN DOES:
 * - Stores temporary context during tasks
 * - Manages clipboard-style data buffers
 * - Supports multi-step reasoning chains
 * - Provides scratch space for calculations
 * - Enables data passing between modules
 * 
 * WHAT RAM BRAIN IS NOT:
 * - Long-term memory (that's state.memory)
 * - Persistent storage (clears on purpose)
 * - A database
 * - For sensitive data storage
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  window.GraceX = window.GraceX || {};
  window.GraceX.RAM = {};

  // ═══════════════════════════════════════════════════════════════════════
  // RAM STRUCTURE
  // ═══════════════════════════════════════════════════════════════════════
  
  const RAM_STORE = {
    // Clipboard-style buffers (max 10)
    buffers: {},
    maxBuffers: 10,
    
    // Active working context for current task
    workingContext: null,
    
    // Multi-step chains (for complex reasoning)
    chains: {},
    maxChains: 5,
    
    // Scratch calculations
    scratch: {},
    
    // Temporary module data exchange
    moduleData: {},
    
    // Metadata
    meta: {
      created: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      lastClear: Date.now()
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // BUFFER OPERATIONS (Clipboard-style)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Store data in a named buffer
   * @param {string} name - Buffer name (e.g., "calculation", "measurement")
   * @param {any} data - Data to store
   * @param {object} options - Optional metadata
   * @returns {boolean} Success status
   */
  GraceX.RAM.setBuffer = function(name, data, options = {}) {
    if (!name) return false;
    
    try {
      // Enforce buffer limit
      const bufferKeys = Object.keys(RAM_STORE.buffers);
      if (bufferKeys.length >= RAM_STORE.maxBuffers && !RAM_STORE.buffers[name]) {
        // Remove oldest buffer
        const oldest = bufferKeys.reduce((a, b) => 
          RAM_STORE.buffers[a].timestamp < RAM_STORE.buffers[b].timestamp ? a : b
        );
        delete RAM_STORE.buffers[oldest];
        console.log(`[RAM] Evicted oldest buffer: ${oldest}`);
      }
      
      RAM_STORE.buffers[name] = {
        data,
        timestamp: Date.now(),
        module: options.module || GraceX.state?.activeModule || "unknown",
        type: options.type || typeof data,
        ttl: options.ttl || null, // Time-to-live in ms
        metadata: options.metadata || {}
      };
      
      updateMeta();
      console.log(`[RAM] Buffer set: ${name} (${typeof data})`);
      return true;
      
    } catch (e) {
      console.error("[RAM] Buffer set error:", e);
      return false;
    }
  };

  /**
   * Retrieve data from a named buffer
   * @param {string} name - Buffer name
   * @returns {any} Buffer data or null
   */
  GraceX.RAM.getBuffer = function(name) {
    if (!name || !RAM_STORE.buffers[name]) return null;
    
    const buffer = RAM_STORE.buffers[name];
    
    // Check TTL expiry
    if (buffer.ttl && (Date.now() - buffer.timestamp) > buffer.ttl) {
      delete RAM_STORE.buffers[name];
      console.log(`[RAM] Buffer expired: ${name}`);
      return null;
    }
    
    updateMeta();
    return buffer.data;
  };

  /**
   * Get buffer with full metadata
   */
  GraceX.RAM.getBufferFull = function(name) {
    if (!name || !RAM_STORE.buffers[name]) return null;
    updateMeta();
    return RAM_STORE.buffers[name];
  };

  /**
   * Delete a specific buffer
   */
  GraceX.RAM.deleteBuffer = function(name) {
    if (!name) return false;
    const existed = !!RAM_STORE.buffers[name];
    delete RAM_STORE.buffers[name];
    if (existed) console.log(`[RAM] Buffer deleted: ${name}`);
    return existed;
  };

  /**
   * List all active buffers
   */
  GraceX.RAM.listBuffers = function() {
    return Object.keys(RAM_STORE.buffers).map(name => ({
      name,
      type: RAM_STORE.buffers[name].type,
      age: Date.now() - RAM_STORE.buffers[name].timestamp,
      module: RAM_STORE.buffers[name].module
    }));
  };

  // ═══════════════════════════════════════════════════════════════════════
  // WORKING CONTEXT (Single active task context)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Set the active working context
   * Use for: Current task being worked on
   */
  GraceX.RAM.setContext = function(context) {
    RAM_STORE.workingContext = {
      data: context,
      timestamp: Date.now(),
      module: GraceX.state?.activeModule || "unknown"
    };
    updateMeta();
    console.log("[RAM] Working context set");
    return true;
  };

  /**
   * Get the active working context
   */
  GraceX.RAM.getContext = function() {
    return RAM_STORE.workingContext?.data || null;
  };

  /**
   * Clear working context
   */
  GraceX.RAM.clearContext = function() {
    RAM_STORE.workingContext = null;
    console.log("[RAM] Working context cleared");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // REASONING CHAINS (Multi-step task tracking)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Start a new reasoning chain
   * @param {string} chainId - Unique chain identifier
   * @param {object} initialData - Starting data
   */
  GraceX.RAM.startChain = function(chainId, initialData = {}) {
    if (!chainId) return false;
    
    // Enforce chain limit
    const chainKeys = Object.keys(RAM_STORE.chains);
    if (chainKeys.length >= RAM_STORE.maxChains && !RAM_STORE.chains[chainId]) {
      const oldest = chainKeys.reduce((a, b) => 
        RAM_STORE.chains[a].started < RAM_STORE.chains[b].started ? a : b
      );
      delete RAM_STORE.chains[oldest];
      console.log(`[RAM] Evicted oldest chain: ${oldest}`);
    }
    
    RAM_STORE.chains[chainId] = {
      started: Date.now(),
      steps: [],
      currentStep: 0,
      data: initialData,
      status: "active"
    };
    
    console.log(`[RAM] Chain started: ${chainId}`);
    return true;
  };

  /**
   * Add a step to an existing chain
   */
  GraceX.RAM.addChainStep = function(chainId, stepData) {
    if (!chainId || !RAM_STORE.chains[chainId]) return false;
    
    const chain = RAM_STORE.chains[chainId];
    chain.steps.push({
      timestamp: Date.now(),
      stepNumber: chain.steps.length + 1,
      data: stepData
    });
    chain.currentStep = chain.steps.length;
    
    console.log(`[RAM] Chain step added: ${chainId} (step ${chain.currentStep})`);
    return true;
  };

  /**
   * Get chain status and data
   */
  GraceX.RAM.getChain = function(chainId) {
    return RAM_STORE.chains[chainId] || null;
  };

  /**
   * Complete a chain
   */
  GraceX.RAM.completeChain = function(chainId, result = null) {
    if (!chainId || !RAM_STORE.chains[chainId]) return false;
    
    RAM_STORE.chains[chainId].status = "complete";
    RAM_STORE.chains[chainId].completed = Date.now();
    if (result !== null) {
      RAM_STORE.chains[chainId].result = result;
    }
    
    console.log(`[RAM] Chain completed: ${chainId}`);
    return true;
  };

  /**
   * Abandon a chain
   */
  GraceX.RAM.abandonChain = function(chainId) {
    if (!chainId) return false;
    delete RAM_STORE.chains[chainId];
    console.log(`[RAM] Chain abandoned: ${chainId}`);
    return true;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SCRATCH PAD (Quick calculations)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Store a scratch calculation
   */
  GraceX.RAM.setScratch = function(key, value) {
    RAM_STORE.scratch[key] = {
      value,
      timestamp: Date.now()
    };
    updateMeta();
    return true;
  };

  /**
   * Get a scratch value
   */
  GraceX.RAM.getScratch = function(key) {
    return RAM_STORE.scratch[key]?.value || null;
  };

  /**
   * Clear all scratch data
   */
  GraceX.RAM.clearScratch = function() {
    RAM_STORE.scratch = {};
    console.log("[RAM] Scratch cleared");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE DATA EXCHANGE
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Pass data between modules
   */
  GraceX.RAM.setModuleData = function(targetModule, key, value) {
    if (!RAM_STORE.moduleData[targetModule]) {
      RAM_STORE.moduleData[targetModule] = {};
    }
    RAM_STORE.moduleData[targetModule][key] = {
      value,
      from: GraceX.state?.activeModule || "unknown",
      timestamp: Date.now()
    };
    updateMeta();
    return true;
  };

  /**
   * Retrieve module data
   */
  GraceX.RAM.getModuleData = function(module, key) {
    return RAM_STORE.moduleData[module]?.[key]?.value || null;
  };

  /**
   * Clear module data for a specific module
   */
  GraceX.RAM.clearModuleData = function(module) {
    delete RAM_STORE.moduleData[module];
    console.log(`[RAM] Module data cleared: ${module}`);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Get RAM statistics
   */
  GraceX.RAM.getStats = function() {
    return {
      buffers: {
        count: Object.keys(RAM_STORE.buffers).length,
        max: RAM_STORE.maxBuffers,
        usage: `${Object.keys(RAM_STORE.buffers).length}/${RAM_STORE.maxBuffers}`
      },
      chains: {
        count: Object.keys(RAM_STORE.chains).length,
        max: RAM_STORE.maxChains,
        active: Object.values(RAM_STORE.chains).filter(c => c.status === "active").length
      },
      scratch: {
        count: Object.keys(RAM_STORE.scratch).length
      },
      moduleData: {
        modules: Object.keys(RAM_STORE.moduleData).length
      },
      meta: RAM_STORE.meta
    };
  };

  /**
   * Clear all RAM (nuclear option)
   */
  GraceX.RAM.clearAll = function() {
    RAM_STORE.buffers = {};
    RAM_STORE.workingContext = null;
    RAM_STORE.chains = {};
    RAM_STORE.scratch = {};
    RAM_STORE.moduleData = {};
    RAM_STORE.meta.lastClear = Date.now();
    console.log("[RAM] All RAM cleared");
    return true;
  };

  /**
   * Clear expired buffers (based on TTL)
   */
  GraceX.RAM.garbageCollect = function() {
    let collected = 0;
    const now = Date.now();
    
    // Check buffers with TTL
    for (const [name, buffer] of Object.entries(RAM_STORE.buffers)) {
      if (buffer.ttl && (now - buffer.timestamp) > buffer.ttl) {
        delete RAM_STORE.buffers[name];
        collected++;
      }
    }
    
    if (collected > 0) {
      console.log(`[RAM] Garbage collection: ${collected} buffers removed`);
    }
    return collected;
  };

  /**
   * Export RAM state (for debugging)
   */
  GraceX.RAM.export = function() {
    return {
      ...RAM_STORE,
      exported: Date.now()
    };
  };

  /**
   * Get RAM memory usage summary
   */
  GraceX.RAM.summary = function() {
    const stats = GraceX.RAM.getStats();
    return `
RAM BRAIN STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buffers: ${stats.buffers.usage}
Active Chains: ${stats.chains.active}/${stats.chains.count}
Scratch Items: ${stats.scratch.count}
Module Data: ${stats.moduleData.modules} modules
Last Access: ${new Date(stats.meta.lastAccess).toLocaleTimeString()}
Access Count: ${stats.meta.accessCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // INTERNAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  function updateMeta() {
    RAM_STORE.meta.lastAccess = Date.now();
    RAM_STORE.meta.accessCount++;
  }

  // Auto garbage collection every 5 minutes
  setInterval(() => {
    GraceX.RAM.garbageCollect();
  }, 5 * 60 * 1000);

  console.log("[GRACE-X RAM BRAIN] v1.0.0 loaded ✓");
  console.log("[RAM] Buffers: 0/10 | Chains: 0/5 | Status: Ready");
  
})();
