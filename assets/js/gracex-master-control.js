/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    GRACE-X MASTER CONTROL™                            ║
 * ║              Central Orchestration & Event Bus System                 ║
 * ║                                                                       ║
 * ║  Purpose: Enterprise-grade module coordination, cross-module          ║
 * ║           communication, health monitoring, and audit logging         ║
 * ║                                                                       ║
 * ║  © 2026 GRACE-X AI™ - GALVANIZED EDITION                             ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

(function(window) {
  'use strict';

  // ============================================================================
  // MASTER CONTROL CORE
  // ============================================================================
  
  const GraceXMaster = {
    version: '1.0.0',
    initialized: false,
    startTime: Date.now(),
    
    // Module Registry
    modules: new Map(),
    
    // Event Bus
    events: new Map(),
    
    // Cross-Module Data Store
    sharedData: new Map(),
    
    // Health Monitor
    health: {
      backend: 'unknown',
      modules: {},
      lastCheck: null,
      issues: []
    },
    
    // Audit Log
    auditLog: [],
    maxAuditEntries: 1000,
    
    // Configuration
    config: {
      autoHealthCheck: true,
      healthCheckInterval: 30000, // 30 seconds
      enableAuditLog: true,
      enableDebugMode: false,
      maxEventListeners: 50
    },

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    init() {
      if (this.initialized) {
        console.warn('[MASTER] Already initialized');
        return;
      }

      console.log('%c╔═══════════════════════════════════════════════════════════════════════╗', 'color: #00d4ff; font-weight: bold;');
      console.log('%c║          🎯 GRACE-X MASTER CONTROL™ - INITIALIZING                   ║', 'color: #00d4ff; font-weight: bold;');
      console.log('%c╚═══════════════════════════════════════════════════════════════════════╝', 'color: #00d4ff; font-weight: bold;');

      // Register core systems
      this.registerModule('core', {
        name: 'GRACE-X Core',
        version: '6.5.1',
        status: 'active',
        capabilities: ['coordination', 'routing', 'state-management']
      });

      // Start health monitoring
      if (this.config.autoHealthCheck) {
        this.startHealthMonitoring();
      }

      // Set up global error handler
      this.setupErrorHandling();

      this.initialized = true;
      this.log('SYSTEM', 'Master Control initialized successfully');
      
      // Emit system ready event
      this.publish('system.ready', {
        version: this.version,
        timestamp: new Date().toISOString()
      });
    },

    // ============================================================================
    // MODULE REGISTRY
    // ============================================================================
    
    registerModule(moduleId, metadata) {
      if (this.modules.has(moduleId)) {
        console.warn(`[MASTER] Module ${moduleId} already registered, updating...`);
      }

      const moduleData = {
        id: moduleId,
        registeredAt: Date.now(),
        lastActivity: Date.now(),
        status: 'active',
        ...metadata
      };

      this.modules.set(moduleId, moduleData);
      this.health.modules[moduleId] = 'healthy';
      
      this.log('MODULE', `Registered: ${moduleId}`, moduleData);
      this.publish('module.registered', { moduleId, metadata: moduleData });
      
      return moduleData;
    },

    unregisterModule(moduleId) {
      if (!this.modules.has(moduleId)) {
        console.warn(`[MASTER] Module ${moduleId} not found`);
        return false;
      }

      this.modules.delete(moduleId);
      delete this.health.modules[moduleId];
      
      this.log('MODULE', `Unregistered: ${moduleId}`);
      this.publish('module.unregistered', { moduleId });
      
      return true;
    },

    getModule(moduleId) {
      return this.modules.get(moduleId);
    },

    getAllModules() {
      return Array.from(this.modules.values());
    },

    updateModuleActivity(moduleId) {
      const module = this.modules.get(moduleId);
      if (module) {
        module.lastActivity = Date.now();
        this.modules.set(moduleId, module);
      }
    },

    // ============================================================================
    // EVENT BUS (PUB/SUB)
    // ============================================================================
    
    subscribe(eventName, callback, context = null) {
      if (typeof callback !== 'function') {
        console.error('[MASTER] Subscribe callback must be a function');
        return null;
      }

      if (!this.events.has(eventName)) {
        this.events.set(eventName, []);
      }

      const listeners = this.events.get(eventName);
      
      // Check max listeners
      if (listeners.length >= this.config.maxEventListeners) {
        console.warn(`[MASTER] Max listeners (${this.config.maxEventListeners}) reached for event: ${eventName}`);
      }

      const subscription = {
        id: this.generateId(),
        callback,
        context,
        subscribedAt: Date.now()
      };

      listeners.push(subscription);
      
      if (this.config.enableDebugMode) {
        console.log(`[MASTER] Subscribed to: ${eventName}`, subscription.id);
      }

      // Return unsubscribe function
      return () => this.unsubscribe(eventName, subscription.id);
    },

    unsubscribe(eventName, subscriptionId) {
      if (!this.events.has(eventName)) {
        return false;
      }

      const listeners = this.events.get(eventName);
      const index = listeners.findIndex(sub => sub.id === subscriptionId);
      
      if (index !== -1) {
        listeners.splice(index, 1);
        if (this.config.enableDebugMode) {
          console.log(`[MASTER] Unsubscribed from: ${eventName}`, subscriptionId);
        }
        return true;
      }

      return false;
    },

    publish(eventName, data = {}) {
      if (!this.events.has(eventName)) {
        // No listeners, but that's okay
        if (this.config.enableDebugMode) {
          console.log(`[MASTER] Published event with no listeners: ${eventName}`);
        }
        return 0;
      }

      const listeners = this.events.get(eventName);
      let successCount = 0;

      listeners.forEach(subscription => {
        try {
          if (subscription.context) {
            subscription.callback.call(subscription.context, data);
          } else {
            subscription.callback(data);
          }
          successCount++;
        } catch (error) {
          console.error(`[MASTER] Error in event listener for ${eventName}:`, error);
          this.log('ERROR', `Event listener error: ${eventName}`, { error: error.message });
        }
      });

      if (this.config.enableDebugMode) {
        console.log(`[MASTER] Published: ${eventName} to ${successCount} listeners`, data);
      }

      return successCount;
    },

    clearEvent(eventName) {
      return this.events.delete(eventName);
    },

    getEventListeners(eventName) {
      return this.events.get(eventName) || [];
    },

    // ============================================================================
    // CROSS-MODULE COMMUNICATION
    // ============================================================================
    
    callModule(moduleId, method, ...args) {
      const module = this.modules.get(moduleId);
      
      if (!module) {
        console.error(`[MASTER] Module not found: ${moduleId}`);
        return Promise.reject(new Error(`Module ${moduleId} not registered`));
      }

      // Check if module has exposed API
      if (!window[moduleId] || typeof window[moduleId][method] !== 'function') {
        console.error(`[MASTER] Method ${method} not found on module ${moduleId}`);
        return Promise.reject(new Error(`Method ${method} not available on ${moduleId}`));
      }

      this.updateModuleActivity(moduleId);
      this.log('CALL', `${moduleId}.${method}`, { args });

      try {
        const result = window[moduleId][method](...args);
        return Promise.resolve(result);
      } catch (error) {
        console.error(`[MASTER] Error calling ${moduleId}.${method}:`, error);
        this.log('ERROR', `Module call failed: ${moduleId}.${method}`, { error: error.message });
        return Promise.reject(error);
      }
    },

    // ============================================================================
    // SHARED DATA STORE
    // ============================================================================
    
    setSharedData(key, value, options = {}) {
      const data = {
        value,
        setBy: options.moduleId || 'unknown',
        setAt: Date.now(),
        expires: options.ttl ? Date.now() + options.ttl : null,
        metadata: options.metadata || {}
      };

      this.sharedData.set(key, data);
      this.publish('data.set', { key, value, metadata: options.metadata });
      
      if (this.config.enableDebugMode) {
        console.log(`[MASTER] Shared data set: ${key}`, data);
      }
    },

    getSharedData(key) {
      const data = this.sharedData.get(key);
      
      if (!data) {
        return null;
      }

      // Check expiration
      if (data.expires && Date.now() > data.expires) {
        this.sharedData.delete(key);
        return null;
      }

      return data.value;
    },

    deleteSharedData(key) {
      const deleted = this.sharedData.delete(key);
      if (deleted) {
        this.publish('data.deleted', { key });
      }
      return deleted;
    },

    clearSharedData() {
      this.sharedData.clear();
      this.publish('data.cleared', {});
    },

    // ============================================================================
    // HEALTH MONITORING
    // ============================================================================
    
    startHealthMonitoring() {
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck();
      }, this.config.healthCheckInterval);

      // Perform initial check
      this.performHealthCheck();
    },

    stopHealthMonitoring() {
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = null;
      }
    },

    async performHealthCheck() {
      this.health.lastCheck = Date.now();
      this.health.issues = [];

      // Check backend
      try {
        const response = await fetch('http://localhost:3000/health', {
          method: 'GET',
          timeout: 5000
        });
        this.health.backend = response.ok ? 'healthy' : 'degraded';
      } catch (error) {
        this.health.backend = 'offline';
        this.health.issues.push('Backend server unreachable');
      }

      // Check module activity (modules inactive for >5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      this.modules.forEach((module, moduleId) => {
        if (module.lastActivity < fiveMinutesAgo) {
          this.health.modules[moduleId] = 'stale';
          this.health.issues.push(`Module ${moduleId} appears inactive`);
        } else {
          this.health.modules[moduleId] = 'healthy';
        }
      });

      // Publish health status
      this.publish('health.checked', {
        status: this.getOverallHealth(),
        details: this.health
      });

      if (this.config.enableDebugMode) {
        console.log('[MASTER] Health check completed', this.health);
      }
    },

    getOverallHealth() {
      if (this.health.backend === 'offline' || this.health.issues.length > 3) {
        return 'critical';
      }
      if (this.health.backend === 'degraded' || this.health.issues.length > 0) {
        return 'degraded';
      }
      return 'healthy';
    },

    getHealthStatus() {
      return {
        overall: this.getOverallHealth(),
        backend: this.health.backend,
        modules: Object.keys(this.health.modules).length,
        issues: this.health.issues,
        lastCheck: this.health.lastCheck,
        uptime: Date.now() - this.startTime
      };
    },

    // ============================================================================
    // AUDIT LOGGING
    // ============================================================================
    
    log(type, message, data = {}) {
      if (!this.config.enableAuditLog) {
        return;
      }

      const entry = {
        id: this.generateId(),
        timestamp: Date.now(),
        type,
        message,
        data
      };

      this.auditLog.push(entry);

      // Trim if over max
      if (this.auditLog.length > this.maxAuditEntries) {
        this.auditLog.shift();
      }

      // Publish log event
      this.publish('audit.log', entry);
    },

    getAuditLog(options = {}) {
      let logs = [...this.auditLog];

      // Filter by type
      if (options.type) {
        logs = logs.filter(entry => entry.type === options.type);
      }

      // Filter by time range
      if (options.since) {
        logs = logs.filter(entry => entry.timestamp >= options.since);
      }

      // Limit results
      if (options.limit) {
        logs = logs.slice(-options.limit);
      }

      return logs;
    },

    clearAuditLog() {
      this.auditLog = [];
      this.publish('audit.cleared', {});
    },

    exportAuditLog() {
      return JSON.stringify(this.auditLog, null, 2);
    },

    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    
    setupErrorHandling() {
      // Global error handler
      window.addEventListener('error', (event) => {
        this.log('ERROR', 'Global error caught', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.log('ERROR', 'Unhandled promise rejection', {
          reason: event.reason
        });
      });
    },

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    generateId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    getUptime() {
      return Date.now() - this.startTime;
    },

    getStats() {
      return {
        version: this.version,
        uptime: this.getUptime(),
        modules: this.modules.size,
        events: this.events.size,
        sharedData: this.sharedData.size,
        auditLog: this.auditLog.length,
        health: this.getHealthStatus()
      };
    },

    // ============================================================================
    // WORKFLOW AUTOMATION
    // ============================================================================
    
    createWorkflow(name, steps) {
      const workflowId = this.generateId();
      const workflow = {
        id: workflowId,
        name,
        steps,
        createdAt: Date.now(),
        executions: 0
      };

      this.subscribe(`workflow.${workflowId}.trigger`, async (data) => {
        this.log('WORKFLOW', `Executing: ${name}`, { workflowId, data });
        workflow.executions++;

        for (const step of steps) {
          try {
            await step(data);
          } catch (error) {
            console.error(`[MASTER] Workflow step failed in ${name}:`, error);
            this.log('ERROR', `Workflow step failed: ${name}`, { error: error.message });
            this.publish(`workflow.${workflowId}.error`, { step, error });
            return;
          }
        }

        this.publish(`workflow.${workflowId}.complete`, { data });
      });

      return workflowId;
    },

    triggerWorkflow(workflowId, data) {
      this.publish(`workflow.${workflowId}.trigger`, data);
    }
  };

  // ============================================================================
  // EXPOSE GLOBAL API
  // ============================================================================
  
  window.GraceXMaster = GraceXMaster;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      GraceXMaster.init();
    });
  } else {
    GraceXMaster.init();
  }

  console.log('%c[MASTER] Master Control loaded and ready', 'color: #00d4ff; font-weight: bold;');

})(window);
