// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X OSINT™ - Main Module Controller
// © Zac Crockett - White-hat OSINT only - Ethical · Legal · Professional
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file coordinates the OSINT UI, engine, sources, and reporting.
// All searches are user-initiated only. No silent background collection.
//
// Dependencies:
// - osint_engine.js (OSINTEngine)
// - osint_sources.js (OSINTSources)
// - osint_report.js (OSINTReport)
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  const MODULE_ID = 'osint';
  const UNLOCK_PASSPHRASE = 'osint_professional_2024';

  // ═══════════════════════════════════════════════════════════════════════════
  // OSINT UI CONTROLLER
  // ═══════════════════════════════════════════════════════════════════════════

  const OSINTUI = {
    currentMode: 'person',
    initialized: false,

    // ═════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═════════════════════════════════════════════════════════════════════════

    init() {
      console.log('[GRACEX OSINT] Initializing UI controller...');

      // Check if we're on the OSINT module
      if (!document.querySelector('.osint-container')) {
        return;
      }

      // Wait for engine to be ready
      if (!window.OSINTEngine || !window.OSINTEngine.isReady) {
        setTimeout(() => this.init(), 100);
        return;
      }

      // Check lock state
      this.checkLockState();

      // Wire up UI
      this.wireUnlockForm();
      this.wireModeSelector();
      this.wireSearchForms();
      this.wireEvidencePanel();
      this.wireExportButtons();
      this.wireAuditLog();
      this.wireBrainPanel();
      this.wireAcademy();
      this.wireMediaUpload();
      this.wireThreatAnalysis();

      // Populate link-out grids
      this.populateLinkouts();

      // Listen for events
      this.bindEvents();

      this.initialized = true;
      console.log('[GRACEX OSINT] UI controller ready');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // LOCK/UNLOCK STATE
    // ═════════════════════════════════════════════════════════════════════════

    checkLockState() {
      const isUnlocked = window.OSINTEngine.isUnlocked();
      
      const lockedOverlay = document.getElementById('osint-locked-overlay');
      const mainContent = document.getElementById('osint-main-content');
      const brainCard = document.getElementById('osint-brain-card');
      const statusBar = document.getElementById('osint-status-bar');
      const statusBadge = document.getElementById('osint-status-badge');
      const lockBtn = document.getElementById('osint-lock-btn');

      if (isUnlocked) {
        if (lockedOverlay) lockedOverlay.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        if (brainCard) brainCard.style.display = 'block';
        if (statusBar) statusBar.style.display = 'flex';
        if (statusBadge) {
          statusBadge.textContent = '✅ Active';
          statusBadge.className = 'gx-badge gx-badge-success';
        }
        if (lockBtn) lockBtn.style.display = 'inline-block';
        
        // Update counts
        this.updateCounts();
      } else {
        if (lockedOverlay) lockedOverlay.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
        if (brainCard) brainCard.style.display = 'none';
        if (statusBar) statusBar.style.display = 'none';
        if (statusBadge) {
          statusBadge.textContent = '🔒 Locked';
          statusBadge.className = 'gx-badge gx-badge-danger';
        }
        if (lockBtn) lockBtn.style.display = 'none';
      }
    },

    wireUnlockForm() {
      const unlockBtn = document.getElementById('osint-unlock-btn');
      const passphraseInput = document.getElementById('osint-unlock-passphrase');
      const professionalCheckbox = document.getElementById('osint-professional-mode');
      const lockBtn = document.getElementById('osint-lock-btn');

      if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
          const passphrase = passphraseInput?.value || '';
          const professional = professionalCheckbox?.checked || false;

          // Try professional mode toggle first
          if (professional) {
            window.OSINTEngine.setProfessionalMode(true);
            this.checkLockState();
            this.showToast('Module unlocked (Professional Mode)', 'success');
            return;
          }

          // Try passphrase
          const result = window.OSINTEngine.unlock(passphrase);
          if (result.success) {
            this.checkLockState();
            this.showToast('Module unlocked', 'success');
          } else {
            this.showToast('Invalid passphrase', 'error');
          }
        });
      }

      if (passphraseInput) {
        passphraseInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            unlockBtn?.click();
          }
        });
      }

      if (lockBtn) {
        lockBtn.addEventListener('click', () => {
          window.OSINTEngine.lock();
          this.checkLockState();
          this.showToast('Module locked', 'info');
        });
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // MODE SELECTOR
    // ═════════════════════════════════════════════════════════════════════════

    wireModeSelector() {
      const modeBtns = document.querySelectorAll('.osint-mode-btn');
      
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.mode;
          this.switchMode(mode);
        });
      });
    },

    switchMode(mode) {
      this.currentMode = mode;

      // Update mode buttons
      document.querySelectorAll('.osint-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });

      // Update mode content
      document.querySelectorAll('.osint-mode-content').forEach(content => {
        content.classList.toggle('active', content.id === `osint-mode-${mode}`);
      });

      // Log mode switch
      window.OSINTEngine.log('INFO', `Switched to ${mode} mode`);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // SEARCH FORMS
    // ═════════════════════════════════════════════════════════════════════════

    wireSearchForms() {
      // Person search
      this.wireSearchForm('person', 'osint-person-query', 'osint-person-search');
      
      // Company search
      this.wireSearchForm('company', 'osint-company-query', 'osint-company-search');
      
      // Domain search
      this.wireSearchForm('domain', 'osint-domain-query', 'osint-domain-search');
    },

    wireSearchForm(mode, inputId, buttonId) {
      const input = document.getElementById(inputId);
      const button = document.getElementById(buttonId);

      if (!input || !button) return;

      const doSearch = async () => {
        const query = input.value.trim();
        if (!query) {
          this.showToast('Please enter a search query', 'warning');
          return;
        }

        // USER INITIATED SEARCH
        const result = await window.OSINTEngine.executeSearch(mode, query, { userInitiated: true });
        
        if (result.success) {
          this.displaySearchResults(mode, result);
          this.updateLinkouts(mode, query);
        } else {
          this.showToast(result.error || 'Search failed', 'error');
        }
      };

      button.addEventListener('click', doSearch);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
      });
    },

    displaySearchResults(mode, result) {
      const container = document.getElementById(`osint-${mode}-results`);
      if (!container) return;

      if (!result.results || result.results.length === 0) {
        container.innerHTML = `
          <div class="osint-empty">
            <div class="osint-empty-icon">🔍</div>
            <div class="osint-empty-title">No results</div>
            <div class="osint-empty-desc">${result.message || 'Try a different query'}</div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="osint-result-card">
          <div class="osint-result-header">
            <span class="osint-result-title">Search Links Generated</span>
            <span class="osint-confidence osint-confidence-${result.confidence || 'medium'}">${result.confidence || 'varies'}</span>
          </div>
          <p class="osint-result-content">${result.message}</p>
          <p class="hint">${result.disclaimer || ''}</p>
          <div class="osint-result-actions">
            <button class="osint-explain-btn" onclick="OSINTUI.addToEvidence('${mode}', '${result.query}')">📎 Add to Evidence</button>
          </div>
        </div>
      `;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // LINKOUT GRIDS
    // ═════════════════════════════════════════════════════════════════════════

    populateLinkouts() {
      if (!window.OSINTSources) return;

      // Person links
      this.renderLinkoutGrid('osint-person-links', window.OSINTSources.getSourcesByCategory('person'));
      
      // Company links
      this.renderLinkoutGrid('osint-company-links', window.OSINTSources.getSourcesByCategory('company'));
      
      // Domain links
      this.renderLinkoutGrid('osint-domain-links', window.OSINTSources.getSourcesByCategory('domain'));
      
      // Media links
      this.renderLinkoutGrid('osint-media-links', window.OSINTSources.getSourcesByCategory('media'));
    },

    renderLinkoutGrid(containerId, sources) {
      const container = document.getElementById(containerId);
      if (!container || !sources) return;

      // Limit to first 8 sources for cleaner UI
      const displaySources = sources.slice(0, 8);

      container.innerHTML = displaySources.map(source => `
        <a href="${source.url.replace('{query}', '')}" target="_blank" rel="noopener" class="osint-linkout-btn" data-source-id="${source.id}">
          <span class="osint-linkout-icon">${source.icon || '🔗'}</span>
          <span>${source.name}</span>
          <span class="osint-linkout-external">↗</span>
        </a>
      `).join('');

      // Log clicks
      container.querySelectorAll('.osint-linkout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          window.OSINTEngine.log('ACTION', `Opened external link: ${btn.textContent.trim()}`);
        });
      });
    },

    updateLinkouts(mode, query) {
      if (!window.OSINTSources) return;

      const containerMap = {
        person: 'osint-person-links',
        company: 'osint-company-links',
        domain: 'osint-domain-links'
      };

      const containerId = containerMap[mode];
      if (!containerId) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      // Update all links with the query
      container.querySelectorAll('.osint-linkout-btn').forEach(btn => {
        const sourceId = btn.dataset.sourceId;
        const sources = window.OSINTSources.getSourcesByCategory(mode);
        const source = sources.find(s => s.id === sourceId);
        
        if (source) {
          btn.href = window.OSINTSources.buildUrl(source, query);
        }
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EVIDENCE PANEL
    // ═════════════════════════════════════════════════════════════════════════

    wireEvidencePanel() {
      const clearBtn = document.getElementById('osint-clear-evidence');
      const notesInput = document.getElementById('osint-notes');

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          window.OSINTEngine.clearEvidence();
          this.updateEvidenceList();
          this.showToast('Evidence cleared', 'info');
        });
      }

      if (notesInput) {
        // Load saved notes
        notesInput.value = window.OSINTEngine.getNotes() || '';
        
        // Save notes on change
        notesInput.addEventListener('input', () => {
          window.OSINTEngine.setNotes(notesInput.value);
        });
      }

      // Initial update
      this.updateEvidenceList();
    },

    updateEvidenceList() {
      const container = document.getElementById('osint-evidence-list');
      if (!container) return;

      const evidence = window.OSINTEngine.getEvidence();
      
      if (evidence.length === 0) {
        container.innerHTML = `
          <div class="osint-empty">
            <div class="osint-empty-icon">📭</div>
            <div class="osint-empty-desc">No evidence collected yet</div>
          </div>
        `;
        return;
      }

      container.innerHTML = evidence.map(e => `
        <div class="osint-evidence-item" data-id="${e.id}">
          <span class="osint-evidence-icon">📎</span>
          <div class="osint-evidence-text">
            <strong>${e.type}</strong>: ${e.content.substring(0, 50)}${e.content.length > 50 ? '...' : ''}
            <br><span class="osint-evidence-time">${e.time}</span>
          </div>
        </div>
      `).join('');
    },

    addToEvidence(mode, query) {
      window.OSINTEngine.addEvidence({
        type: `${mode} search`,
        content: query,
        source: 'user search',
        confidence: 'medium'
      });
      
      this.updateEvidenceList();
      this.updateCounts();
      this.showToast('Added to evidence', 'success');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EXPORT BUTTONS
    // ═════════════════════════════════════════════════════════════════════════

    wireExportButtons() {
      const exportHtml = document.getElementById('osint-export-html');
      const exportMd = document.getElementById('osint-export-md');
      const exportJson = document.getElementById('osint-export-json');

      if (exportHtml) {
        exportHtml.addEventListener('click', () => this.exportReport('html'));
      }
      if (exportMd) {
        exportMd.addEventListener('click', () => this.exportReport('md'));
      }
      if (exportJson) {
        exportJson.addEventListener('click', () => this.exportReport('json'));
      }
    },

    exportReport(format) {
      if (!window.OSINTReport) {
        this.showToast('Report generator not available', 'error');
        return;
      }

      const report = window.OSINTReport.generateFromSession({
        title: 'OSINT Investigation Report',
        subject: 'Investigation',
        objective: 'Intelligence gathering and analysis'
      });

      if (report) {
        window.OSINTReport.download(report, format);
        this.showToast(`Report exported as ${format.toUpperCase()}`, 'success');
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // AUDIT LOG
    // ═════════════════════════════════════════════════════════════════════════

    wireAuditLog() {
      this.updateAuditLog();
    },

    updateAuditLog() {
      const container = document.getElementById('osint-audit-log');
      const countDisplay = document.getElementById('osint-audit-count-display');
      
      if (!container) return;

      const logs = window.OSINTEngine.getAuditLog();
      
      if (countDisplay) {
        countDisplay.textContent = `${logs.length} entries`;
      }

      if (logs.length === 0) {
        container.innerHTML = `
          <div class="osint-empty" style="padding: 20px;">
            <div class="osint-empty-desc">No actions logged yet</div>
          </div>
        `;
        return;
      }

      container.innerHTML = logs.slice(0, 50).map(log => `
        <div class="osint-audit-entry">
          <span class="osint-audit-time">${log.time}</span>
          <span class="osint-audit-type ${log.type.toLowerCase()}">${log.type}</span>
          <span class="osint-audit-msg">${log.message}</span>
        </div>
      `).join('');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // BRAIN PANEL
    // ═════════════════════════════════════════════════════════════════════════

    wireBrainPanel() {
      const input = document.getElementById('osint-brain-input');
      const sendBtn = document.getElementById('osint-brain-send');
      const output = document.getElementById('osint-brain-output');
      const clearBtn = document.getElementById('osint-brain-clear');
      const micBtn = document.getElementById('osint-brain-mic');

      if (!input || !sendBtn || !output) return;

      const handleAsk = async () => {
        const query = input.value.trim();
        if (!query) return;

        this.addBrainMessage(output, query, 'user');
        input.value = '';

        // Get response
        let reply;
        try {
          if (typeof window.runModuleBrain === 'function') {
            reply = await window.runModuleBrain(MODULE_ID, query);
          } else {
            reply = this.getOSINTResponse(query);
          }
        } catch (e) {
          reply = 'Sorry, I had trouble processing that. Please try again.';
        }

        this.addBrainMessage(output, reply, 'ai');
      };

      sendBtn.addEventListener('click', handleAsk);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAsk();
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          output.innerHTML = `
            <div class="brain-message brain-message-system">
              I'm your OSINT assistant. I can help with ethical research methodology, verification techniques, and understanding OSINT best practices.
            </div>
          `;
        });
      }

      // Wire mic button
      if (micBtn && window.wireBrainMic) {
        window.wireBrainMic(MODULE_ID);
      }
    },

    addBrainMessage(container, text, role) {
      const div = document.createElement('div');
      div.className = `brain-message brain-message-${role}`;
      div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    },

    getOSINTResponse(query) {
      const q = query.toLowerCase();

      // OSINT methodology responses
      if (q.includes('what is osint') || q.includes('define osint')) {
        return "**Open Source Intelligence (OSINT)** is the collection and analysis of information from publicly available sources. This includes:\n\n• Public records and databases\n• Social media (public posts only)\n• News articles and publications\n• Company registrations\n• Domain/IP information\n\nOSINT is used ethically for due diligence, journalism, security research, and investigations.";
      }

      if (q.includes('legal') || q.includes('ethics')) {
        return "**OSINT Ethics & Legality:**\n\n✅ **Allowed:**\n• Publicly available information\n• Official registries\n• Search engine results\n• Public social media posts\n\n❌ **Not Allowed:**\n• Accessing private accounts\n• Scraping behind logins\n• Harassment or stalking\n• Impersonation\n\nAlways operate within the law and respect privacy.";
      }

      if (q.includes('verify') || q.includes('verification')) {
        return "**Verification Techniques:**\n\n1. **Cross-reference** - Check multiple sources\n2. **Reverse image search** - Verify image origins\n3. **WHOIS lookup** - Confirm domain ownership\n4. **Wayback Machine** - Check historical data\n5. **Social media triangulation** - Verify accounts\n\nNever trust a single source. Always corroborate findings.";
      }

      if (q.includes('grooming') || q.includes('predator')) {
        return "**Grooming Warning Signs:**\n\n🚨 **Red Flags:**\n• Requests for secrecy\n• Inappropriate compliments about maturity\n• Requests for photos\n• Isolation from friends/family\n• Gift-giving to create obligation\n\n**If you suspect grooming:**\n1. Document everything\n2. Don't delete messages\n3. Report to authorities (CEOP in UK)\n4. Contact a trusted adult";
      }

      if (q.includes('scam') || q.includes('phishing')) {
        return "**Scam/Phishing Indicators:**\n\n🚨 **Warning Signs:**\n• Urgency ('Act now!')\n• Prize/lottery claims\n• Requests for personal info\n• Suspicious links\n• Grammar/spelling errors\n• Unknown senders\n\n**Protection:**\n• Never click suspicious links\n• Verify sender identity\n• Report to Action Fraud (UK)";
      }

      return "I can help you understand OSINT methodology, verification techniques, ethics, and threat patterns. Ask me about:\n\n• What is OSINT?\n• Verification techniques\n• Legal and ethical considerations\n• Grooming/scam detection\n• Source evaluation";
    },

    // ═════════════════════════════════════════════════════════════════════════
    // ACADEMY
    // ═════════════════════════════════════════════════════════════════════════

    wireAcademy() {
      const lessonCards = document.querySelectorAll('.osint-lesson-card');
      const contentContainer = document.getElementById('osint-lesson-content');

      if (!contentContainer) return;

      const lessons = {
        intro: {
          title: '🎯 What is OSINT?',
          content: `
            <p><strong>Open Source Intelligence (OSINT)</strong> is intelligence collected from publicly available sources.</p>
            
            <h4>Key Principles:</h4>
            <ul>
              <li><strong>Public Only:</strong> All information must be publicly accessible</li>
              <li><strong>Legal:</strong> No hacking, no unauthorized access</li>
              <li><strong>Ethical:</strong> Respect privacy and human rights</li>
              <li><strong>Verifiable:</strong> Cross-reference all findings</li>
            </ul>
            
            <h4>Common Use Cases:</h4>
            <ul>
              <li>Due diligence and background checks</li>
              <li>Journalism and fact-checking</li>
              <li>Security research</li>
              <li>Missing persons investigations</li>
              <li>Fraud detection</li>
            </ul>
          `
        },
        ethics: {
          title: '⚖️ Ethics & Legality',
          content: `
            <p>OSINT practitioners must operate within legal and ethical boundaries.</p>
            
            <h4>✅ Ethical Practices:</h4>
            <ul>
              <li>Only access publicly available information</li>
              <li>Respect terms of service</li>
              <li>Consider impact on subjects</li>
              <li>Protect sensitive findings</li>
              <li>Document methodology</li>
            </ul>
            
            <h4>❌ Unethical/Illegal:</h4>
            <ul>
              <li>Hacking or unauthorized access</li>
              <li>Harassment or stalking</li>
              <li>Creating fake accounts to access private info</li>
              <li>Sharing personal data without consent</li>
              <li>Using OSINT for discrimination</li>
            </ul>
          `
        },
        methodology: {
          title: '📋 OSINT Methodology',
          content: `
            <p>A structured approach to OSINT investigations:</p>
            
            <h4>Step 1: Define Objectives</h4>
            <p>What are you trying to find? Define clear questions.</p>
            
            <h4>Step 2: Source Identification</h4>
            <p>Identify relevant public sources for your query.</p>
            
            <h4>Step 3: Data Collection</h4>
            <p>Gather information systematically. Document everything.</p>
            
            <h4>Step 4: Analysis</h4>
            <p>Correlate findings, identify patterns, assess reliability.</p>
            
            <h4>Step 5: Verification</h4>
            <p>Cross-reference with multiple independent sources.</p>
            
            <h4>Step 6: Reporting</h4>
            <p>Document findings with sources, confidence levels, and limitations.</p>
          `
        },
        sources: {
          title: '🔍 Finding Sources',
          content: `
            <h4>Categories of OSINT Sources:</h4>
            
            <p><strong>🌐 Web Sources:</strong></p>
            <ul>
              <li>Search engines (Google, Bing, DuckDuckGo)</li>
              <li>Social media platforms</li>
              <li>News archives</li>
              <li>Forums and communities</li>
            </ul>
            
            <p><strong>📋 Official Records:</strong></p>
            <ul>
              <li>Company registries</li>
              <li>Court records</li>
              <li>Property records</li>
              <li>Government databases</li>
            </ul>
            
            <p><strong>🔧 Technical Sources:</strong></p>
            <ul>
              <li>WHOIS databases</li>
              <li>DNS records</li>
              <li>SSL certificates</li>
              <li>Code repositories</li>
            </ul>
          `
        },
        verification: {
          title: '✅ Verification Techniques',
          content: `
            <h4>Never trust a single source!</h4>
            
            <p><strong>Cross-Reference:</strong> Find the same information in multiple independent sources.</p>
            
            <p><strong>Reverse Image Search:</strong> Verify image origins using Google Images, TinEye, or Yandex.</p>
            
            <p><strong>EXIF Analysis:</strong> Check image metadata for timestamps, locations, camera info.</p>
            
            <p><strong>Archive Check:</strong> Use Wayback Machine to see historical versions.</p>
            
            <p><strong>Social Media Verification:</strong></p>
            <ul>
              <li>Account age and activity patterns</li>
              <li>Follower/following ratio</li>
              <li>Content consistency</li>
              <li>Cross-platform presence</li>
            </ul>
          `
        },
        reporting: {
          title: '📝 Report Writing',
          content: `
            <h4>Professional OSINT Report Structure:</h4>
            
            <p><strong>1. Executive Summary:</strong> Key findings in 2-3 paragraphs.</p>
            
            <p><strong>2. Scope:</strong> What was investigated and why.</p>
            
            <p><strong>3. Methodology:</strong> How information was gathered.</p>
            
            <p><strong>4. Sources:</strong> All sources consulted.</p>
            
            <p><strong>5. Findings:</strong> Detailed results with confidence levels.</p>
            
            <p><strong>6. Analysis:</strong> What the findings mean.</p>
            
            <p><strong>7. Limitations:</strong> What couldn't be determined.</p>
            
            <p><strong>8. Recommendations:</strong> Suggested next steps.</p>
            
            <p><strong>9. Disclaimer:</strong> Legal and accuracy caveats.</p>
          `
        }
      };

      lessonCards.forEach(card => {
        card.addEventListener('click', () => {
          const lessonId = card.dataset.lesson;
          const lesson = lessons[lessonId];
          
          if (lesson) {
            contentContainer.style.display = 'block';
            contentContainer.innerHTML = `
              <h3>${lesson.title}</h3>
              ${lesson.content}
            `;
            window.OSINTEngine.log('INFO', `Viewed academy lesson: ${lessonId}`);
          }
        });
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // MEDIA UPLOAD (EXIF)
    // ═════════════════════════════════════════════════════════════════════════

    wireMediaUpload() {
      const uploadInput = document.getElementById('osint-media-upload');
      const resultsDiv = document.getElementById('osint-exif-results');

      if (!uploadInput || !resultsDiv) return;

      uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        resultsDiv.innerHTML = '<div class="osint-loading"><div class="osint-loading-spinner"></div><div class="osint-loading-text">Extracting metadata...</div></div>';

        const result = await window.OSINTEngine.extractEXIF(file);

        if (result.success) {
          resultsDiv.innerHTML = `
            <div class="osint-result-card">
              <div class="osint-result-header">
                <span class="osint-result-title">Image Metadata</span>
              </div>
              <div class="osint-result-content">
                <p><strong>File Name:</strong> ${result.metadata.fileName}</p>
                <p><strong>File Type:</strong> ${result.metadata.fileType}</p>
                <p><strong>File Size:</strong> ${(result.metadata.fileSize / 1024).toFixed(2)} KB</p>
                <p><strong>Last Modified:</strong> ${new Date(result.metadata.lastModified).toLocaleString()}</p>
                ${result.note ? `<p class="hint">${result.note}</p>` : ''}
              </div>
              <div class="osint-result-actions">
                <button class="osint-explain-btn" onclick="OSINTUI.addMediaEvidence('${result.metadata.fileName}')">📎 Add to Evidence</button>
              </div>
            </div>
          `;
        } else {
          resultsDiv.innerHTML = `<p class="hint">Could not extract metadata: ${result.error}</p>`;
        }
      });
    },

    addMediaEvidence(filename) {
      window.OSINTEngine.addEvidence({
        type: 'media analysis',
        content: `Analyzed file: ${filename}`,
        source: 'user upload',
        confidence: 'medium'
      });
      this.updateEvidenceList();
      this.updateCounts();
      this.showToast('Media analysis added to evidence', 'success');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // THREAT ANALYSIS
    // ═════════════════════════════════════════════════════════════════════════

    wireThreatAnalysis() {
      const analyzeBtn = document.getElementById('osint-threat-analyze');
      const textInput = document.getElementById('osint-threat-text');
      const resultsDiv = document.getElementById('osint-threat-results');

      if (!analyzeBtn || !textInput || !resultsDiv) return;

      analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
          this.showToast('Please enter text to analyze', 'warning');
          return;
        }

        const result = await window.OSINTEngine.executeSearch('threat', text, { userInitiated: true });

        if (result.success && result.patterns) {
          resultsDiv.innerHTML = result.patterns.map(p => `
            <div class="osint-threat-indicator ${p.detected ? 'detected' : 'clear'}">
              <span class="osint-threat-status ${p.detected ? 'red' : 'green'}"></span>
              <div class="osint-threat-info">
                <div class="osint-threat-name">${p.name}</div>
                <div class="osint-threat-desc">${p.description}</div>
                ${p.detected ? `<span class="osint-confidence osint-confidence-${p.confidence}">Confidence: ${p.confidence}</span>` : ''}
              </div>
            </div>
          `).join('');
        }
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════════════

    bindEvents() {
      // Listen for audit log updates
      document.addEventListener('osint:log', () => {
        this.updateAuditLog();
        this.updateCounts();
      });

      // Listen for evidence updates
      document.addEventListener('osint:evidence', () => {
        this.updateEvidenceList();
        this.updateCounts();
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════════════

    updateCounts() {
      const evidenceCount = document.getElementById('osint-evidence-count');
      const auditCount = document.getElementById('osint-audit-count');

      if (evidenceCount) {
        evidenceCount.textContent = window.OSINTEngine.getEvidence().length;
      }
      if (auditCount) {
        auditCount.textContent = window.OSINTEngine.getAuditLog().length;
      }
    },

    showToast(message, type = 'info') {
      if (window.GRACEX_Utils && window.GRACEX_Utils.showToast) {
        window.GRACEX_Utils.showToast(message, type);
      } else {
        console.log(`[OSINT ${type}] ${message}`);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.OSINTUI = OSINTUI;

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Initialize when module loads
  document.addEventListener('gracex:module:loaded', (e) => {
    if (e.detail && e.detail.module === MODULE_ID) {
      setTimeout(() => OSINTUI.init(), 100);
    }
  });

  // Also try immediate init
  if (document.querySelector('.osint-container')) {
    setTimeout(() => OSINTUI.init(), 100);
  }

  console.log('[GRACEX] OSINT UI controller loaded');

})();

// ============================================
// BRAIN WIRING - Level 5 Integration
// ============================================
function wireOSINTBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[OSINT] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('osint', {
    capabilities: {
      hasDataGathering: true,
      hasSourceAnalysis: true,
      hasReportGeneration: true,
      hasIntelligence: true
    },

    onQuery: async (query) => {
      return 'OSINT intelligence gathering active. What do you need to research?';
    }
  });

  console.log('[OSINT] ✅ Brain wired - Level 5 integration active');
}

// Wire brain on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireOSINTBrain);
} else {
  wireOSINTBrain();
}
