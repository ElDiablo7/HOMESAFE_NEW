/* ============================================
   GRACE-X GALVANIZED ERROR RECOVERY SYSTEM
   ULTIMATE BULLETPROOF LAYER
   © 2026 Zachary Charles Anthony Crockett
   ============================================ */

(function() {
    'use strict';
    
    console.log('🦁 GRACE-X GALVANIZED LAYER LOADING...');
    
    // ============================================
    // GLOBAL ERROR HANDLER
    // ============================================
    window.GRACEX_GALVANIZED = {
        errorCount: 0,
        lastError: null,
        recoveryAttempts: 0,
        maxRecoveryAttempts: 5,
        
        // Critical error handler
        handleCriticalError: function(error, context) {
            this.errorCount++;
            this.lastError = { error, context, timestamp: Date.now() };
            
            console.error('🦁 GALVANIZED LAYER CAUGHT ERROR:', {
                error: error.message || error,
                context,
                count: this.errorCount
            });
            
            // Attempt recovery based on error type
            if (error.message && error.message.includes('API')) {
                this.recoverAPIConnection();
            } else if (error.message && error.message.includes('network')) {
                this.recoverNetworkConnection();
            } else if (error.message && error.message.includes('module')) {
                this.recoverModule(context);
            } else {
                this.genericRecovery();
            }
            
            // Update user
            if (window.GRACEX_TTS && this.errorCount < 3) {
                GRACEX_TTS.speak('Error detected. Attempting automatic recovery.');
            }
        },
        
        // API connection recovery
        recoverAPIConnection: async function() {
            if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
                console.error('🦁 Max recovery attempts reached');
                this.showRecoveryUI();
                return;
            }
            
            this.recoveryAttempts++;
            console.log(`🦁 Attempting API recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
            
            // Test backend connection
            try {
                const response = await fetch('http://localhost:3000/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok) {
                    console.log('🦁 API RECOVERED!');
                    this.recoveryAttempts = 0;
                    if (window.GRACEX_TTS) {
                        GRACEX_TTS.speak('Connection restored.');
                    }
                    return true;
                } else {
                    throw new Error('Health check failed');
                }
            } catch (err) {
                console.warn('🦁 Recovery attempt failed:', err.message);
                
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (this.recoveryAttempts < this.maxRecoveryAttempts) {
                    return this.recoverAPIConnection();
                } else {
                    this.showRecoveryUI();
                }
            }
        },
        
        // Network connection recovery
        recoverNetworkConnection: function() {
            console.log('🦁 Checking network connectivity...');
            
            if (!navigator.onLine) {
                console.warn('🦁 Device is offline');
                this.showOfflineUI();
            } else {
                console.log('🦁 Device online, testing connectivity...');
                this.recoverAPIConnection();
            }
        },
        
        // Module recovery
        recoverModule: function(moduleName) {
            console.log(`🦁 Attempting to recover module: ${moduleName}`);
            
            try {
                // Reload module
                if (window.loadModule) {
                    window.loadModule(moduleName);
                    console.log('🦁 Module reloaded successfully');
                }
            } catch (err) {
                console.error('🦁 Module recovery failed:', err);
                this.genericRecovery();
            }
        },
        
        // Generic recovery
        genericRecovery: function() {
            console.log('🦁 Performing generic recovery...');
            
            // Clear any stuck states
            if (window.GRACEX_STATE) {
                try {
                    GRACEX_STATE.clearErrors();
                } catch (e) {}
            }
            
            // Clear request cache
            if (window.GRACEX_NETWORK) {
                try {
                    GRACEX_NETWORK.clearCache();
                } catch (e) {}
            }
            
            console.log('🦁 Generic recovery complete');
        },
        
        // Show recovery UI
        showRecoveryUI: function() {
            const overlay = document.createElement('div');
            overlay.id = 'gracex-recovery-overlay';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                color: white;
                font-family: sans-serif;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center; max-width: 500px; padding: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
                    <h1 style="font-size: 2rem; margin-bottom: 20px;">Connection Issue Detected</h1>
                    <p style="margin-bottom: 30px; line-height: 1.6;">
                        GRACE-X couldn't connect to the backend server. 
                        Please check that the server is running.
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button onclick="window.GRACEX_GALVANIZED.retryConnection()" 
                                style="padding: 12px 24px; font-size: 1rem; cursor: pointer; background: #10b981; border: none; border-radius: 8px; color: white; font-weight: bold;">
                            🔄 Retry Connection
                        </button>
                        <button onclick="window.open('CONNECTION_TEST.html', '_blank')" 
                                style="padding: 12px 24px; font-size: 1rem; cursor: pointer; background: #3b82f6; border: none; border-radius: 8px; color: white; font-weight: bold;">
                            🧪 Run Diagnostics
                        </button>
                        <button onclick="window.GRACEX_GALVANIZED.dismissRecoveryUI()" 
                                style="padding: 12px 24px; font-size: 1rem; cursor: pointer; background: #6b7280; border: none; border-radius: 8px; color: white;">
                            Continue Offline
                        </button>
                    </div>
                    <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.7;">
                        Need help? Check FIRST_TIME_SETUP.md
                    </p>
                </div>
            `;
            
            document.body.appendChild(overlay);
        },
        
        // Show offline UI
        showOfflineUI: function() {
            const banner = document.createElement('div');
            banner.id = 'gracex-offline-banner';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #dc2626, #991b1b);
                color: white;
                padding: 12px;
                text-align: center;
                z-index: 999999;
                font-weight: bold;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            banner.textContent = '⚠️ OFFLINE MODE - Internet connection required for AI features';
            document.body.appendChild(banner);
            
            // Remove on reconnect
            window.addEventListener('online', () => {
                const banner = document.getElementById('gracex-offline-banner');
                if (banner) banner.remove();
            }, { once: true });
        },
        
        // Retry connection
        retryConnection: function() {
            this.recoveryAttempts = 0;
            this.dismissRecoveryUI();
            this.recoverAPIConnection();
        },
        
        // Dismiss recovery UI
        dismissRecoveryUI: function() {
            const overlay = document.getElementById('gracex-recovery-overlay');
            if (overlay) overlay.remove();
        },
        
        // System health check
        healthCheck: async function() {
            const health = {
                timestamp: Date.now(),
                errors: this.errorCount,
                lastError: this.lastError,
                online: navigator.onLine,
                backend: false,
                modules: 0
            };
            
            // Check backend
            try {
                const response = await fetch('http://localhost:3000/health', {
                    signal: AbortSignal.timeout(3000)
                });
                health.backend = response.ok;
            } catch (e) {
                health.backend = false;
            }
            
            // Check modules
            const modules = document.querySelectorAll('.module-btn');
            health.modules = modules.length;
            
            return health;
        },
        
        // Initialize galvanized layer
        init: function() {
            console.log('🦁 GALVANIZED LAYER INITIALIZED');
            console.log('🦁 Error recovery active');
            console.log('🦁 Auto-healing enabled');
            
            // Set up global error handlers
            window.addEventListener('error', (event) => {
                this.handleCriticalError(event.error || event, 'global');
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                this.handleCriticalError(event.reason, 'promise');
            });
            
            // Periodic health check
            setInterval(() => {
                this.healthCheck().then(health => {
                    if (!health.backend && navigator.onLine && this.errorCount > 3) {
                        console.warn('🦁 Backend unhealthy, attempting recovery...');
                        this.recoverAPIConnection();
                    }
                });
            }, 30000); // Every 30 seconds
            
            // Initial health check
            setTimeout(() => {
                this.healthCheck().then(health => {
                    console.log('🦁 System Health:', health);
                    if (!health.backend) {
                        console.warn('🦁 Backend not responding on startup');
                    }
                });
            }, 2000);
        }
    };
    
    // ============================================
    // AUTO-INITIALIZE ON LOAD
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.GRACEX_GALVANIZED.init();
        });
    } else {
        window.GRACEX_GALVANIZED.init();
    }
    
    console.log('🦁 GALVANIZED LAYER LOADED - SYSTEM BULLETPROOF');
    
})();
