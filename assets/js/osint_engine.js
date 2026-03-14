// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X OSINT™ ENGINE - Core Intelligence Layer
// © Zac Crockett - White-hat OSINT only - Ethical · Legal · Professional
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 🚨 HARD CONSTRAINTS (NON-NEGOTIABLE):
// ❌ NO illegal access
// ❌ NO credential harvesting
// ❌ NO scraping behind logins
// ❌ NO malware, exploits, or "grey" tools
// ❌ NO auto-execution of external scripts
// ✅ White-hat OSINT only
// ✅ Publicly available data only
// ✅ User-initiated searches only
// ✅ Audit trail for every action
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  const OSINT_CONFIG = {
    version: '1.0.0',
    name: 'GRACE-X OSINT™ Engine',
    
    // Module is LOCKED by default
    isLocked: true,
    
    // Storage keys
    storageKeys: {
      unlocked: 'gracex_osint_unlocked',
      professional: 'gracex_osint_professional',
      auditLog: 'gracex_osint_audit',
      evidence: 'gracex_osint_evidence',
      notes: 'gracex_osint_notes',
      investigations: 'gracex_osint_investigations'
    },
    
    // Unlock passphrase (hash-based comparison)
    unlockHash: 'osint_professional_2024',
    
    // Maximum audit log entries to keep
    maxAuditEntries: 500,
    
    // Maximum evidence items
    maxEvidenceItems: 100
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OSINT ENGINE STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const OSINTEngine = {
    isReady: false,
    currentMode: 'person',
    currentSearch: null,
    auditLog: [],
    evidence: [],
    notes: '',
    investigations: [],

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    init() {
      console.log(`[GRACEX OSINT] ${OSINT_CONFIG.name} v${OSINT_CONFIG.version} initializing...`);
      
      // Load persisted data
      this.loadData();
      
      // Log initialization
      this.log('INFO', 'OSINT Engine initialized');
      
      this.isReady = true;
      
      // Expose health ping
      window.OSINT_READY = true;
      
      console.log('[GRACEX OSINT] Engine ready');
      return this;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    isUnlocked() {
      try {
        return localStorage.getItem(OSINT_CONFIG.storageKeys.unlocked) === 'true';
      } catch (e) {
        return false;
      }
    },

    isProfessionalMode() {
      try {
        return localStorage.getItem(OSINT_CONFIG.storageKeys.professional) === 'true';
      } catch (e) {
        return false;
      }
    },

    unlock(passphrase) {
      // Simple passphrase check (in production, use proper hashing)
      if (passphrase === OSINT_CONFIG.unlockHash) {
        try {
          localStorage.setItem(OSINT_CONFIG.storageKeys.unlocked, 'true');
          this.log('ACTION', 'Module unlocked via passphrase');
          return { success: true, message: 'OSINT module unlocked' };
        } catch (e) {
          return { success: false, message: 'Storage error' };
        }
      }
      this.log('WARNING', 'Failed unlock attempt');
      return { success: false, message: 'Invalid passphrase' };
    },

    setProfessionalMode(enabled) {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.professional, enabled ? 'true' : 'false');
        if (enabled) {
          localStorage.setItem(OSINT_CONFIG.storageKeys.unlocked, 'true');
        }
        this.log('ACTION', `Professional mode ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      } catch (e) {
        return false;
      }
    },

    lock() {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.unlocked, 'false');
        this.log('ACTION', 'Module locked');
        return true;
      } catch (e) {
        return false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // AUDIT LOGGING (IMMUTABLE)
    // ═══════════════════════════════════════════════════════════════════════

    log(type, message, data = null) {
      const entry = {
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        type: type.toUpperCase(),
        message,
        data: data ? JSON.stringify(data).substring(0, 200) : null
      };

      this.auditLog.unshift(entry);

      // Trim log if too large
      if (this.auditLog.length > OSINT_CONFIG.maxAuditEntries) {
        this.auditLog = this.auditLog.slice(0, OSINT_CONFIG.maxAuditEntries);
      }

      // Persist
      this.saveAuditLog();

      // Console output for debugging
      console.log(`[OSINT ${type}] ${message}`);

      // Dispatch event for UI updates
      document.dispatchEvent(new CustomEvent('osint:log', { detail: entry }));

      return entry;
    },

    getAuditLog() {
      return [...this.auditLog];
    },

    clearAuditLog() {
      // Audit logs should be immutable, but allow clearing with warning
      this.log('WARNING', 'Audit log cleared by user');
      this.auditLog = [];
      this.saveAuditLog();
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EVIDENCE COLLECTION
    // ═══════════════════════════════════════════════════════════════════════

    addEvidence(item) {
      const evidence = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        type: item.type || 'finding',
        source: item.source || 'manual',
        content: item.content,
        confidence: item.confidence || 'medium',
        notes: item.notes || ''
      };

      this.evidence.unshift(evidence);

      if (this.evidence.length > OSINT_CONFIG.maxEvidenceItems) {
        this.evidence = this.evidence.slice(0, OSINT_CONFIG.maxEvidenceItems);
      }

      this.saveEvidence();
      this.log('ACTION', `Evidence added: ${evidence.type}`, { id: evidence.id });

      document.dispatchEvent(new CustomEvent('osint:evidence', { detail: evidence }));

      return evidence;
    },

    getEvidence() {
      return [...this.evidence];
    },

    removeEvidence(id) {
      const index = this.evidence.findIndex(e => e.id === id);
      if (index !== -1) {
        const removed = this.evidence.splice(index, 1)[0];
        this.saveEvidence();
        this.log('ACTION', `Evidence removed: ${removed.type}`, { id });
        return true;
      }
      return false;
    },

    clearEvidence() {
      this.log('WARNING', 'Evidence cleared');
      this.evidence = [];
      this.saveEvidence();
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NOTES
    // ═══════════════════════════════════════════════════════════════════════

    setNotes(text) {
      this.notes = text;
      this.saveNotes();
      return true;
    },

    getNotes() {
      return this.notes;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INVESTIGATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    createInvestigation(name, scope, legalNotes = '') {
      const investigation = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name,
        scope,
        legalNotes,
        status: 'active',
        evidence: [],
        notes: ''
      };

      this.investigations.unshift(investigation);
      this.saveInvestigations();
      this.log('ACTION', `Investigation created: ${name}`, { id: investigation.id });

      return investigation;
    },

    getInvestigations() {
      return [...this.investigations];
    },

    getInvestigation(id) {
      return this.investigations.find(i => i.id === id);
    },

    updateInvestigation(id, updates) {
      const investigation = this.investigations.find(i => i.id === id);
      if (investigation) {
        Object.assign(investigation, updates, { modified: new Date().toISOString() });
        this.saveInvestigations();
        this.log('ACTION', `Investigation updated: ${investigation.name}`, { id });
        return investigation;
      }
      return null;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SEARCH EXECUTION (SAFE, USER-INITIATED ONLY)
    // ═══════════════════════════════════════════════════════════════════════

    async executeSearch(mode, query, options = {}) {
      // SECURITY: Verify user initiated
      if (!options.userInitiated) {
        this.log('WARNING', 'Search blocked: not user-initiated');
        return { success: false, error: 'Searches must be user-initiated' };
      }

      // SECURITY: Check unlock status
      if (!this.isUnlocked()) {
        this.log('WARNING', 'Search blocked: module locked');
        return { success: false, error: 'Module is locked' };
      }

      // Log search
      this.log('SEARCH', `${mode}: ${query.substring(0, 50)}...`);

      this.currentSearch = {
        mode,
        query,
        timestamp: new Date().toISOString(),
        status: 'running'
      };

      try {
        // Route to appropriate handler
        let results;
        switch (mode) {
          case 'person':
            results = await this.searchPerson(query, options);
            break;
          case 'company':
            results = await this.searchCompany(query, options);
            break;
          case 'domain':
            results = await this.searchDomain(query, options);
            break;
          case 'media':
            results = await this.searchMedia(query, options);
            break;
          case 'threat':
            results = await this.analyzeThreat(query, options);
            break;
          default:
            results = { success: false, error: 'Unknown search mode' };
        }

        this.currentSearch.status = 'complete';
        this.currentSearch.results = results;

        return results;
      } catch (error) {
        this.log('ERROR', `Search failed: ${error.message}`);
        this.currentSearch.status = 'error';
        return { success: false, error: error.message };
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PERSON OSINT (Username, Email, Social)
    // ═══════════════════════════════════════════════════════════════════════

    async searchPerson(query, options) {
      this.log('INFO', `Person search initiated for: ${query}`);

      // Generate safe search links (no actual scraping)
      const searchLinks = this.generatePersonSearchLinks(query);
      
      // Return link-out suggestions, not scraped data
      return {
        success: true,
        type: 'person',
        query,
        timestamp: new Date().toISOString(),
        message: 'Generated public search links. Click to open in new tab.',
        results: searchLinks,
        confidence: 'varies',
        disclaimer: 'Results depend on publicly available information. No data has been scraped.'
      };
    },

    generatePersonSearchLinks(query) {
      const encodedQuery = encodeURIComponent(query);
      
      return [
        {
          name: 'Google Search',
          category: 'general',
          url: `https://www.google.com/search?q=${encodedQuery}`,
          description: 'General web search'
        },
        {
          name: 'LinkedIn (Public)',
          category: 'professional',
          url: `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`,
          description: 'Professional network (public profiles only)'
        },
        {
          name: 'Twitter/X Search',
          category: 'social',
          url: `https://twitter.com/search?q=${encodedQuery}`,
          description: 'Social media search'
        },
        {
          name: 'GitHub',
          category: 'technical',
          url: `https://github.com/search?q=${encodedQuery}`,
          description: 'Code repositories and developer profiles'
        },
        {
          name: 'Have I Been Pwned',
          category: 'breach',
          url: `https://haveibeenpwned.com/`,
          description: 'Check email breach status (manual entry required)',
          note: 'User must enter email manually on site'
        },
        {
          name: 'Reddit',
          category: 'social',
          url: `https://www.reddit.com/search/?q=${encodedQuery}`,
          description: 'Reddit user/content search'
        }
      ];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COMPANY OSINT
    // ═══════════════════════════════════════════════════════════════════════

    async searchCompany(query, options) {
      this.log('INFO', `Company search initiated for: ${query}`);

      const searchLinks = this.generateCompanySearchLinks(query);

      return {
        success: true,
        type: 'company',
        query,
        timestamp: new Date().toISOString(),
        message: 'Generated public company search links.',
        results: searchLinks,
        confidence: 'varies',
        disclaimer: 'Always verify company information through official registries.'
      };
    },

    generateCompanySearchLinks(query) {
      const encodedQuery = encodeURIComponent(query);

      return [
        {
          name: 'Companies House (UK)',
          category: 'registry',
          url: `https://find-and-update.company-information.service.gov.uk/search?q=${encodedQuery}`,
          description: 'UK company registry'
        },
        {
          name: 'OpenCorporates',
          category: 'registry',
          url: `https://opencorporates.com/companies?q=${encodedQuery}`,
          description: 'Global corporate database'
        },
        {
          name: 'LinkedIn Company',
          category: 'professional',
          url: `https://www.linkedin.com/search/results/companies/?keywords=${encodedQuery}`,
          description: 'Company profiles and employees'
        },
        {
          name: 'Crunchbase',
          category: 'business',
          url: `https://www.crunchbase.com/textsearch?q=${encodedQuery}`,
          description: 'Startup and company funding info'
        },
        {
          name: 'Google News',
          category: 'news',
          url: `https://news.google.com/search?q=${encodedQuery}`,
          description: 'Recent news about company'
        }
      ];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DOMAIN/IP OSINT
    // ═══════════════════════════════════════════════════════════════════════

    async searchDomain(query, options) {
      this.log('INFO', `Domain/IP search initiated for: ${query}`);

      const searchLinks = this.generateDomainSearchLinks(query);

      return {
        success: true,
        type: 'domain',
        query,
        timestamp: new Date().toISOString(),
        message: 'Generated domain/IP analysis links.',
        results: searchLinks,
        confidence: 'varies',
        disclaimer: 'Use these tools responsibly. Some may require accounts.'
      };
    },

    generateDomainSearchLinks(query) {
      const encodedQuery = encodeURIComponent(query);

      return [
        {
          name: 'WHOIS Lookup',
          category: 'registration',
          url: `https://who.is/whois/${encodedQuery}`,
          description: 'Domain registration information'
        },
        {
          name: 'DNS Lookup',
          category: 'dns',
          url: `https://mxtoolbox.com/SuperTool.aspx?action=dns%3a${encodedQuery}&run=toolpage`,
          description: 'DNS records and configuration'
        },
        {
          name: 'SSL Labs',
          category: 'security',
          url: `https://www.ssllabs.com/ssltest/analyze.html?d=${encodedQuery}`,
          description: 'SSL/TLS certificate analysis'
        },
        {
          name: 'Shodan',
          category: 'infrastructure',
          url: `https://www.shodan.io/search?query=${encodedQuery}`,
          description: 'Internet-connected device search'
        },
        {
          name: 'VirusTotal',
          category: 'security',
          url: `https://www.virustotal.com/gui/domain/${encodedQuery}`,
          description: 'Security and reputation analysis'
        },
        {
          name: 'Wayback Machine',
          category: 'history',
          url: `https://web.archive.org/web/*/${encodedQuery}`,
          description: 'Historical website snapshots'
        },
        {
          name: 'BuiltWith',
          category: 'technical',
          url: `https://builtwith.com/${encodedQuery}`,
          description: 'Technology stack analysis'
        }
      ];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MEDIA OSINT (Images, Videos)
    // ═══════════════════════════════════════════════════════════════════════

    async searchMedia(query, options) {
      this.log('INFO', `Media search initiated`);

      const searchLinks = this.generateMediaSearchLinks(query);

      return {
        success: true,
        type: 'media',
        query: query || 'image analysis',
        timestamp: new Date().toISOString(),
        message: 'Use these tools for media verification.',
        results: searchLinks,
        confidence: 'varies',
        disclaimer: 'For uploaded images, use the EXIF viewer below. Reverse image search requires manual image upload.'
      };
    },

    generateMediaSearchLinks(query) {
      const encodedQuery = encodeURIComponent(query || '');

      return [
        {
          name: 'Google Reverse Image',
          category: 'reverse_image',
          url: 'https://images.google.com/',
          description: 'Drag & drop image to search',
          note: 'Manual image upload required'
        },
        {
          name: 'TinEye',
          category: 'reverse_image',
          url: 'https://tineye.com/',
          description: 'Reverse image search engine',
          note: 'Manual image upload required'
        },
        {
          name: 'Yandex Images',
          category: 'reverse_image',
          url: 'https://yandex.com/images/',
          description: 'Often finds results Google misses',
          note: 'Manual image upload required'
        },
        {
          name: 'FotoForensics',
          category: 'analysis',
          url: 'https://fotoforensics.com/',
          description: 'Error level analysis for image manipulation',
          note: 'Manual image upload required'
        },
        {
          name: 'InVID',
          category: 'video',
          url: 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/',
          description: 'Video verification browser extension'
        }
      ];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // THREAT PATTERN ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════

    async analyzeThreat(query, options) {
      this.log('INFO', `Threat pattern analysis initiated`);

      // Analyze text for known threat patterns
      const patterns = this.detectThreatPatterns(query);

      return {
        success: true,
        type: 'threat',
        query: query.substring(0, 100),
        timestamp: new Date().toISOString(),
        message: 'Threat pattern analysis complete.',
        patterns,
        confidence: 'rule-based',
        disclaimer: 'This is rule-based analysis. Professional investigation may be required for confirmed threats.'
      };
    },

    detectThreatPatterns(text) {
      const t = (text || '').toLowerCase();
      const patterns = [];

      // Grooming indicators (Guardian-derived)
      const groomingIndicators = [
        { pattern: /secret|don't tell|our little secret/i, weight: 3 },
        { pattern: /special relationship|you're different/i, weight: 2 },
        { pattern: /send.*photo|picture.*send/i, weight: 3 },
        { pattern: /age.*doesn't matter|mature.*for.*age/i, weight: 3 },
        { pattern: /meet.*alone|private.*meeting/i, weight: 2 },
        { pattern: /delete.*message|erase.*chat/i, weight: 2 }
      ];

      let groomingScore = 0;
      groomingIndicators.forEach(ind => {
        if (ind.pattern.test(t)) groomingScore += ind.weight;
      });

      patterns.push({
        type: 'grooming',
        name: 'Grooming Indicators',
        detected: groomingScore >= 3,
        confidence: groomingScore >= 6 ? 'high' : groomingScore >= 3 ? 'medium' : 'low',
        score: groomingScore,
        description: groomingScore >= 3 
          ? 'Warning: Potential grooming language detected. Consider reporting to authorities.'
          : 'No significant grooming patterns detected.'
      });

      // Scam indicators
      const scamIndicators = [
        { pattern: /urgent|act now|limited time/i, weight: 1 },
        { pattern: /winner|won|lottery|prize/i, weight: 2 },
        { pattern: /bank.*details|account.*number|routing/i, weight: 3 },
        { pattern: /verify.*account|confirm.*identity/i, weight: 2 },
        { pattern: /click.*link|click here/i, weight: 1 },
        { pattern: /prince|inheritance|transfer.*million/i, weight: 3 }
      ];

      let scamScore = 0;
      scamIndicators.forEach(ind => {
        if (ind.pattern.test(t)) scamScore += ind.weight;
      });

      patterns.push({
        type: 'scam',
        name: 'Scam/Phishing Indicators',
        detected: scamScore >= 3,
        confidence: scamScore >= 6 ? 'high' : scamScore >= 3 ? 'medium' : 'low',
        score: scamScore,
        description: scamScore >= 3 
          ? 'Warning: Potential scam/phishing language detected.'
          : 'No significant scam patterns detected.'
      });

      // Impersonation indicators
      const impersonationIndicators = [
        { pattern: /official.*representative|speaking.*behalf/i, weight: 2 },
        { pattern: /government.*agency|irs|fbi|police/i, weight: 2 },
        { pattern: /tech.*support|microsoft.*calling/i, weight: 3 },
        { pattern: /verify.*identity.*or|legal.*action/i, weight: 2 }
      ];

      let impersonationScore = 0;
      impersonationIndicators.forEach(ind => {
        if (ind.pattern.test(t)) impersonationScore += ind.weight;
      });

      patterns.push({
        type: 'impersonation',
        name: 'Impersonation Indicators',
        detected: impersonationScore >= 3,
        confidence: impersonationScore >= 5 ? 'high' : impersonationScore >= 3 ? 'medium' : 'low',
        score: impersonationScore,
        description: impersonationScore >= 3 
          ? 'Warning: Potential impersonation detected. Verify identity through official channels.'
          : 'No significant impersonation patterns detected.'
      });

      return patterns;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EXIF METADATA VIEWER (User-uploaded files only)
    // ═══════════════════════════════════════════════════════════════════════

    async extractEXIF(file) {
      this.log('INFO', 'EXIF extraction initiated');

      return new Promise((resolve) => {
        // Basic EXIF extraction using FileReader
        // In production, use exif-js library
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const view = new DataView(e.target.result);
            
            // Check for JPEG
            if (view.getUint16(0, false) !== 0xFFD8) {
              resolve({
                success: true,
                message: 'Not a JPEG file or no EXIF data found',
                metadata: {
                  fileSize: file.size,
                  fileName: file.name,
                  fileType: file.type,
                  lastModified: new Date(file.lastModified).toISOString()
                }
              });
              return;
            }

            // Simplified EXIF parsing (full implementation would be more complex)
            resolve({
              success: true,
              message: 'Basic metadata extracted',
              metadata: {
                fileSize: file.size,
                fileName: file.name,
                fileType: file.type,
                lastModified: new Date(file.lastModified).toISOString()
              },
              note: 'For detailed EXIF analysis, use tools like ExifTool or online EXIF viewers'
            });

          } catch (err) {
            resolve({
              success: false,
              error: 'Could not read file metadata'
            });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DATA PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════

    loadData() {
      try {
        const auditData = localStorage.getItem(OSINT_CONFIG.storageKeys.auditLog);
        if (auditData) this.auditLog = JSON.parse(auditData);

        const evidenceData = localStorage.getItem(OSINT_CONFIG.storageKeys.evidence);
        if (evidenceData) this.evidence = JSON.parse(evidenceData);

        const notesData = localStorage.getItem(OSINT_CONFIG.storageKeys.notes);
        if (notesData) this.notes = notesData;

        const invData = localStorage.getItem(OSINT_CONFIG.storageKeys.investigations);
        if (invData) this.investigations = JSON.parse(invData);

      } catch (e) {
        console.warn('[OSINT] Failed to load persisted data:', e);
      }
    },

    saveAuditLog() {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.auditLog, JSON.stringify(this.auditLog));
      } catch (e) {
        console.warn('[OSINT] Failed to save audit log');
      }
    },

    saveEvidence() {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.evidence, JSON.stringify(this.evidence));
      } catch (e) {
        console.warn('[OSINT] Failed to save evidence');
      }
    },

    saveNotes() {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.notes, this.notes);
      } catch (e) {
        console.warn('[OSINT] Failed to save notes');
      }
    },

    saveInvestigations() {
      try {
        localStorage.setItem(OSINT_CONFIG.storageKeys.investigations, JSON.stringify(this.investigations));
      } catch (e) {
        console.warn('[OSINT] Failed to save investigations');
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════

    getHealth() {
      return {
        ready: this.isReady,
        unlocked: this.isUnlocked(),
        professional: this.isProfessionalMode(),
        evidenceCount: this.evidence.length,
        auditLogCount: this.auditLog.length,
        investigationCount: this.investigations.length,
        version: OSINT_CONFIG.version
      };
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.OSINTEngine = OSINTEngine;

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OSINTEngine.init());
  } else {
    OSINTEngine.init();
  }

  console.log('[GRACEX] OSINT Engine loaded');

})();
