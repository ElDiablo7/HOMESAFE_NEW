/* ============================================
   GRACE-X BOOT SCREEN CONTROLLER
   Enterprise Startup Sequence
   ============================================ */

(function(window) {
  'use strict';

  const GraceXBoot = {
    initialized: false,
    startTime: Date.now(),
    modules: [
      'CORE BRAIN SYSTEM',
      'STATE MANAGER',
      'ROUTER',
      'RAM CACHE',
      'ANALYTICS ENGINE',
      'MASTER BRAIN',
      'MASTER CONTROL',
      'CALL SHEETS',
      'RISK & SAFETY',
      'BUILDER MODULE',
      'SPORT MODULE',
      'GUARDIAN MODULE',
      'OSINT MODULE',
      'ACCOUNTING MODULE',
      'FORGE MODULE',
      'LASER™ ULTRA',
      'NETWORK MANAGER',
      'UI CONTROLS'
    ],
    currentModuleIndex: 0,
    bootDuration: 6000, // 6 seconds total boot time
    skipRequested: false,

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Check if user wants to skip boot (localStorage preference)
      const skipBoot = localStorage.getItem('gracex_skip_boot') === 'true';
      if (skipBoot) {
        this.skipBoot();
        return;
      }

      console.log('🚀 GRACE-X BOOT SEQUENCE INITIATED');
      
      this.createBootScreen();
      this.startBootSequence();
      this.setupEventListeners();
    },

    createBootScreen() {
      const bootScreen = document.createElement('div');
      bootScreen.id = 'gracex-boot-screen';
      bootScreen.innerHTML = `
        <!-- Animated Grid Background -->
        <div class="boot-grid"></div>
        
        <!-- Floating Particles -->
        <div class="boot-particles" id="boot-particles"></div>
        
        <!-- System Info (Top Right) -->
        <div class="boot-system-info">
          <div>GRACE-X AI™ ECOSYSTEM</div>
          <div>BUILD: TITAN_v${this.getBuildVersion()}</div>
          <div>MODULES: 18</div>
          <div>STATUS: INITIALIZING</div>
        </div>
        
        <!-- Main Logo -->
        <div class="boot-logo-container">
          <img src="assets/images/gracex-boot-logo.png" alt="GRACE-X AI PRO FILM PRODUCTION SUITE">
        </div>
        
        <!-- Module Loading List -->
        <div class="boot-modules" id="boot-modules"></div>
        
        <!-- Status Text & Progress -->
        <div class="boot-status">
          <div class="boot-status-text" id="boot-status-text">
            INITIALIZING GRACE-X ECOSYSTEM...
          </div>
          <div class="boot-progress-container">
            <div class="boot-progress-bar" id="boot-progress-bar"></div>
          </div>
        </div>
        
        <!-- Skip Hint -->
        <div class="boot-skip-hint">
          Press any key to skip • ESC to skip always
        </div>
        
        <!-- Copyright -->
        <div class="boot-copyright">
          © 2026 ZAC CROCKETT • MINISTRY OF DEFENCE GRADE SYSTEM
        </div>
      `;
      
      document.body.insertBefore(bootScreen, document.body.firstChild);
      
      // Generate particles
      this.generateParticles();
    },

    generateParticles() {
      const particlesContainer = document.getElementById('boot-particles');
      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'boot-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (5 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
      }
    },

    startBootSequence() {
      const statusText = document.getElementById('boot-status-text');
      const progressBar = document.getElementById('boot-progress-bar');
      const systemInfo = document.querySelector('.boot-system-info');
      
      // Update status
      this.updateStatus('WIRING 18 AI MODULES...');
      
      // Load modules progressively
      this.loadModulesSequentially();
      
      // Update progress bar smoothly
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min((elapsed / this.bootDuration) * 100, 100);
        progressBar.style.width = progress + '%';
        
        if (progress >= 100 || this.skipRequested) {
          clearInterval(progressInterval);
          this.completeBoot();
        }
      }, 50);
      
      // Update system status
      setTimeout(() => {
        systemInfo.querySelector('div:last-child').textContent = 'STATUS: WIRING MODULES';
      }, 1000);
      
      setTimeout(() => {
        systemInfo.querySelector('div:last-child').textContent = 'STATUS: ONLINE';
      }, this.bootDuration - 1000);
    },

    loadModulesSequentially() {
      const modulesContainer = document.getElementById('boot-modules');
      const moduleLoadTime = this.bootDuration / this.modules.length;
      
      const loadNextModule = () => {
        if (this.currentModuleIndex >= this.modules.length || this.skipRequested) {
          return;
        }
        
        const moduleName = this.modules[this.currentModuleIndex];
        const moduleItem = document.createElement('div');
        moduleItem.className = 'boot-module-item loading';
        moduleItem.textContent = `[LOADING] ${moduleName}...`;
        modulesContainer.appendChild(moduleItem);
        
        // Scroll to bottom
        modulesContainer.scrollTop = modulesContainer.scrollHeight;
        
        // Mark as loaded after short delay
        setTimeout(() => {
          moduleItem.className = 'boot-module-item loaded';
          moduleItem.textContent = `[✓] ${moduleName} ONLINE`;
        }, moduleLoadTime * 0.3);
        
        this.currentModuleIndex++;
        
        if (this.currentModuleIndex < this.modules.length) {
          setTimeout(loadNextModule, moduleLoadTime);
        }
      };
      
      loadNextModule();
    },

    completeBoot() {
      const statusText = document.getElementById('boot-status-text');
      const progressBar = document.getElementById('boot-progress-bar');
      const systemInfo = document.querySelector('.boot-system-info');
      
      // Final updates
      progressBar.style.width = '100%';
      statusText.textContent = 'ALL SYSTEMS OPERATIONAL • GRACE-X READY';
      statusText.style.color = '#00ff88';
      systemInfo.querySelector('div:last-child').textContent = 'STATUS: READY';
      systemInfo.querySelector('div:last-child').style.color = '#00ff88';
      
      // Wait a moment, then fade out
      setTimeout(() => {
        this.fadeOutBoot();
      }, 800);
    },

    fadeOutBoot() {
      const bootScreen = document.getElementById('gracex-boot-screen');
      const app = document.getElementById('app');
      
      bootScreen.classList.add('fade-out');
      
      setTimeout(() => {
        bootScreen.classList.add('hidden');
        
        // Show main app with fade-in
        if (app) {
          app.style.display = 'flex';
          // Trigger fade-in animation
          setTimeout(() => {
            app.classList.add('app-ready');
          }, 50); // Small delay to ensure transition triggers
        }
        
        console.log('✅ GRACE-X BOOT COMPLETE - System Ready');
        
        // Dispatch custom event for other systems to know boot is complete
        window.dispatchEvent(new CustomEvent('gracex:boot-complete'));
      }, 1000);
    },

    skipBoot() {
      const bootScreen = document.getElementById('gracex-boot-screen');
      const app = document.getElementById('app');
      
      if (bootScreen) {
        bootScreen.classList.add('hidden');
      }
      
      // Show app immediately when skipping
      if (app) {
        app.style.display = 'flex';
        app.classList.add('app-ready');
      }
      
      console.log('⏭️ GRACE-X BOOT SKIPPED');
      window.dispatchEvent(new CustomEvent('gracex:boot-complete'));
    },

    setupEventListeners() {
      // Press any key to skip
      const skipHandler = (e) => {
        if (this.skipRequested) return;
        
        this.skipRequested = true;
        
        // ESC = skip always
        if (e.key === 'Escape') {
          localStorage.setItem('gracex_skip_boot', 'true');
          console.log('🔇 Boot screen disabled for future sessions');
        }
        
        this.completeBoot();
        document.removeEventListener('keydown', skipHandler);
      };
      
      document.addEventListener('keydown', skipHandler);
      
      // Click to skip
      const bootScreen = document.getElementById('gracex-boot-screen');
      bootScreen.addEventListener('click', () => {
        if (!this.skipRequested) {
          this.skipRequested = true;
          this.completeBoot();
        }
      });
    },

    updateStatus(text) {
      const statusText = document.getElementById('boot-status-text');
      if (statusText) {
        statusText.textContent = text;
      }
    },

    getBuildVersion() {
      // Try to extract version from script tags
      const scripts = document.querySelectorAll('script[src*="?v="]');
      if (scripts.length > 0) {
        const src = scripts[0].src;
        const match = src.match(/\?v=([^&]+)/);
        return match ? match[1] : 'TITAN';
      }
      return 'TITAN';
    },

    // Public method to re-enable boot screen
    enableBootScreen() {
      localStorage.removeItem('gracex_skip_boot');
      console.log('✅ Boot screen re-enabled');
    }
  };

  // Export to window
  window.GraceXBoot = GraceXBoot;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      GraceXBoot.init();
    });
  } else {
    GraceXBoot.init();
  }

})(window);
