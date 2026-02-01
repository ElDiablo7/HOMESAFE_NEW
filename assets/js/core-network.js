/* ============================================
   GRACE-X CORE NETWORK MANAGER
   Handles all internet/API access through Core
   Security Protocol: All modules route through Core
   © 2026 Zachary Charles Anthony Crockett
   ============================================ */

(function() {
    'use strict';
    
    // Network configuration
    const NetworkConfig = {
        // API Base URLs
        brainAPI: window.GRACEX_BRAIN_API || 'http://localhost:3000/api/brain',
        sportAPI: window.GRACEX_SPORT_API || 'http://localhost:3000/api/sport',
        
        // Timeouts
        defaultTimeout: 30000,
        longTimeout: 60000,
        
        // Retry policy
        maxRetries: 3,
        retryDelay: 1000,
        
        // Status
        online: navigator.onLine,
        coreReady: false
    };
    
    // ============================================
    // CORE NETWORK MANAGER
    // ============================================
    class CoreNetworkManager {
        constructor() {
            this.activeRequests = new Map();
            this.requestQueue = [];
            this.apiCache = new Map();
            this.setupOnlineDetection();
        }
        
        // ============================================
        // ONLINE/OFFLINE DETECTION
        // ============================================
        setupOnlineDetection() {
            window.addEventListener('online', () => {
                NetworkConfig.online = true;
                console.log('[CORE] Network connection restored');
                if (window.GRACEX_TTS) {
                    GRACEX_TTS.speak('Network connection restored');
                }
                this.processQueue();
            });
            
            window.addEventListener('offline', () => {
                NetworkConfig.online = false;
                console.warn('[CORE] Network connection lost');
                if (window.GRACEX_TTS) {
                    GRACEX_TTS.speak('Network offline. Working in local mode.');
                }
            });
        }
        
        // ============================================
        // CORE API REQUEST - All modules use this
        // ============================================
        async request(endpoint, options = {}) {
            const requestId = `${Date.now()}-${Math.random()}`;
            
            // Check if online
            if (!NetworkConfig.online) {
                return this.handleOfflineRequest(endpoint, options);
            }
            
            // Build request config
            const config = {
                method: options.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-GRACEX-Version': window.GRACEX_VERSION || 'TITAN',
                    'X-Request-ID': requestId,
                    ...options.headers
                },
                timeout: options.timeout || NetworkConfig.defaultTimeout
            };
            
            if (options.body) {
                config.body = JSON.stringify(options.body);
            }
            
            // Log request
            console.log(`[CORE] API Request: ${endpoint}`, {
                method: config.method,
                requestId
            });
            
            try {
                // Execute request with timeout
                const response = await this.fetchWithTimeout(endpoint, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Cache successful responses
                if (options.cache) {
                    this.apiCache.set(endpoint, {
                        data,
                        timestamp: Date.now()
                    });
                }
                
                return {
                    success: true,
                    data,
                    requestId
                };
                
            } catch (error) {
                console.error(`[CORE] API Error:`, error);
                
                // Retry logic
                if (options.retry && this.shouldRetry(error, options.retryCount || 0)) {
                    return this.retryRequest(endpoint, options);
                }
                
                return {
                    success: false,
                    error: error.message,
                    requestId
                };
            }
        }
        
        // ============================================
        // FETCH WITH TIMEOUT
        // ============================================
        fetchWithTimeout(url, config) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, config.timeout);
                
                fetch(url, config)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => clearTimeout(timeout));
            });
        }
        
        // ============================================
        // RETRY LOGIC
        // ============================================
        shouldRetry(error, retryCount) {
            if (retryCount >= NetworkConfig.maxRetries) return false;
            if (!NetworkConfig.online) return false;
            
            // Retry on network errors, not on client errors
            return error.message.includes('timeout') || 
                   error.message.includes('Failed to fetch') ||
                   error.message.includes('Network');
        }
        
        async retryRequest(endpoint, options) {
            const retryCount = (options.retryCount || 0) + 1;
            const delay = NetworkConfig.retryDelay * retryCount;
            
            console.log(`[CORE] Retrying request (${retryCount}/${NetworkConfig.maxRetries})`);
            
            await this.sleep(delay);
            
            return this.request(endpoint, {
                ...options,
                retryCount
            });
        }
        
        // ============================================
        // OFFLINE HANDLING
        // ============================================
        handleOfflineRequest(endpoint, options) {
            // Check cache
            if (options.cache && this.apiCache.has(endpoint)) {
                const cached = this.apiCache.get(endpoint);
                console.log('[CORE] Returning cached response (offline)');
                return {
                    success: true,
                    data: cached.data,
                    cached: true,
                    timestamp: cached.timestamp
                };
            }
            
            // Queue for later
            if (options.queue) {
                this.requestQueue.push({ endpoint, options });
                console.log('[CORE] Request queued for when online');
            }
            
            return {
                success: false,
                error: 'Offline: No internet connection',
                queued: !!options.queue
            };
        }
        
        // ============================================
        // PROCESS QUEUED REQUESTS
        // ============================================
        async processQueue() {
            if (this.requestQueue.length === 0) return;
            
            console.log(`[CORE] Processing ${this.requestQueue.length} queued requests`);
            
            const queue = [...this.requestQueue];
            this.requestQueue = [];
            
            for (const { endpoint, options } of queue) {
                await this.request(endpoint, options);
            }
        }
        
        // ============================================
        // UTILITY METHODS
        // ============================================
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        clearCache() {
            this.apiCache.clear();
            console.log('[CORE] API cache cleared');
        }
        
        getStatus() {
            return {
                online: NetworkConfig.online,
                coreReady: NetworkConfig.coreReady,
                activeRequests: this.activeRequests.size,
                queuedRequests: this.requestQueue.length,
                cacheSize: this.apiCache.size
            };
        }
    }
    
    // ============================================
    // MODULE PROXY - Secure API access
    // ============================================
    class ModuleProxy {
        constructor(moduleName) {
            this.moduleName = moduleName;
            this.network = window.GRACEX_NETWORK;
        }
        
        async callAPI(endpoint, data, options = {}) {
            // Validate module is registered
            if (!this.isAuthorized()) {
                console.error(`[CORE] Unauthorized module: ${this.moduleName}`);
                return {
                    success: false,
                    error: 'Module not authorized'
                };
            }
            
            // Route through Core
            return this.network.request(endpoint, {
                body: {
                    module: this.moduleName,
                    data,
                    timestamp: Date.now()
                },
                ...options
            });
        }
        
        isAuthorized() {
            // Check if module is in registered modules list
            const registeredModules = [
                'core', 'forge', 'builder', 'siteops', 'sport',
                'chef', 'family', 'accounting', 'uplift', 'fit',
                'yoga', 'beauty', 'gamer', 'osint', 'guardian',
                'tradelink', 'artist'
            ];
            return registeredModules.includes(this.moduleName);
        }
    }
    
    // ============================================
    // INITIALIZE CORE NETWORK
    // ============================================
    const network = new CoreNetworkManager();
    NetworkConfig.coreReady = true;
    
    // Export to window
    window.GRACEX_NETWORK = network;
    window.GRACEX_NETWORK_CONFIG = NetworkConfig;
    
    // Helper function for modules to get proxy
    window.GRACEX_GetModuleProxy = (moduleName) => {
        return new ModuleProxy(moduleName);
    };
    
    console.log('[CORE] Network Manager initialized', network.getStatus());
    
    // Announce ready
    if (window.GRACEX_TTS) {
        setTimeout(() => {
            GRACEX_TTS.speak('Core network systems online');
        }, 2000);
    }
    
})();

/* ============================================
   USAGE EXAMPLES FOR MODULES
   ============================================

// In any module (e.g., Sport™):
const proxy = window.GRACEX_GetModuleProxy('sport');

// Make API call through Core
const result = await proxy.callAPI('/api/sport/fixtures', {
    league: 'premier-league',
    date: '2026-01-10'
}, {
    cache: true,
    retry: true,
    timeout: 10000
});

if (result.success) {
    console.log('Data:', result.data);
} else {
    console.error('Error:', result.error);
}

// Check network status
const status = window.GRACEX_NETWORK.getStatus();
console.log('Network:', status);

   ============================================ */
