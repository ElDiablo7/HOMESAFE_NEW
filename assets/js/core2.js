// ============================================
// GRACE-X CORE 2.0™ JavaScript Handler
// Advanced AI Command Center Integration
// © 2026 Zachary Charles Anthony Crockett
// ============================================

(function () {
    'use strict';

    // Module state
    let isInitialized = false;
    let voiceRecognition = null;
    let messageCount = 0;
    let sessionStart = Date.now();
    let conversations = [];

    // Initialize Core 2.0 when module loads
    function initCore2() {
        if (isInitialized) return;

        console.log('🚀 Initializing GRACE-X CORE 2.0™...');

        setupVoiceRecognition();
        setupEventListeners();
        initCore2NetworkSettings();
        startSystemMonitoring();

        isInitialized = true;

        // Wire Brain
        if (window.setupModuleBrain) {
            window.setupModuleBrain('core2');
        }

        // Announce initialization
        if (window.GRACEX_TTS) {
            setTimeout(() => {
                GRACEX_TTS.speak('GRACE-X CORE 2.0 initialized. Advanced AI systems online.');
            }, 500);
        }

        console.log('✅ GRACE-X CORE 2.0™ Ready');
    }

    function setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            voiceRecognition = new SpeechRecognition();

            voiceRecognition.continuous = false;
            voiceRecognition.interimResults = false;
            voiceRecognition.lang = 'en-US';

            voiceRecognition.onstart = function () {
                console.log('🎙️ Voice recognition started');
                updateVoiceButtonState(true);
            };

            voiceRecognition.onend = function () {
                console.log('🎙️ Voice recognition ended');
                updateVoiceButtonState(false);
            };

            voiceRecognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript;
                console.log('🎙️ Voice input:', transcript);

                const input = document.getElementById('chat-input');
                if (input) {
                    input.value = transcript;
                    sendMessage();
                }
            };

            voiceRecognition.onerror = function (event) {
                console.error('Voice recognition error:', event.error);
                updateVoiceButtonState(false);
            };
        }
    }

    function setupEventListeners() {
        // Handle Enter key in chat input
        document.addEventListener('keypress', function (e) {
            if (e.target.id === 'chat-input' && e.key === 'Enter') {
                sendMessage();
            }
        });

        // Monitor network status
        window.addEventListener('online', () => {
            console.log('🌐 Network: Online');
            updateConnectionStatus('Connected');
            const badge = document.getElementById('c2-net-badge');
            if (badge) badge.textContent = '🟢 Online';
        });

        window.addEventListener('offline', () => {
            console.log('🌐 Network: Offline');
            updateConnectionStatus('Offline');
            const badge = document.getElementById('c2-net-badge');
            if (badge) badge.textContent = '🔴 Offline';
        });
    }

    function initCore2NetworkSettings() {
        const ssid = document.getElementById('c2-ssid');
        const pwd = document.getElementById('c2-password');
        const pwdShow = document.getElementById('c2-password-show');
        const proxy = document.getElementById('c2-proxy');
        const api = document.getElementById('c2-api-endpoint');
        const status = document.getElementById('c2-net-status');
        const badge = document.getElementById('c2-net-badge');
        const openBtn = document.getElementById('c2-open-settings-btn');
        const testBtn = document.getElementById('c2-test-btn');
        const saveBtn = document.getElementById('c2-save-btn');
        const saved = JSON.parse(localStorage.getItem('gracex.network') || '{}');
        if (ssid && saved.ssid) ssid.value = saved.ssid;
        if (pwd && saved.password) pwd.value = saved.password;
        if (proxy && saved.proxy) proxy.value = saved.proxy;
        if (api && (saved.apiEndpoint || window.GRACEX_BRAIN_API)) {
            api.value = saved.apiEndpoint || window.GRACEX_BRAIN_API;
        }
        if (badge) {
            badge.textContent = navigator.onLine ? '🟢 Online' : '🔴 Offline';
        }
        if (pwdShow && pwd) {
            pwdShow.onchange = function () {
                pwd.type = pwdShow.checked ? 'text' : 'password';
            };
        }
        if (openBtn) {
            openBtn.onclick = function () {
                let opened = false;
                try { window.open('ms-settings:network', '_blank'); opened = true; } catch (e) { }
                if (!opened) {
                    if (status) status.textContent = 'Open your OS network settings to configure Wi‑Fi.';
                }
            };
        }
        if (testBtn) {
            testBtn.onclick = async function () {
                if (status) status.textContent = 'Testing...';
                try {
                    const base = (api && api.value) ? api.value : (window.GRACEX_BRAIN_API || 'http://localhost:3000/api/brain');
                    const healthUrl = base.replace('/api/brain', '/health');
                    const netUrl = base.replace('/api/brain', '/net/status');
                    let ok = false;
                    try {
                        const resp = await fetch(healthUrl, { method: 'GET' });
                        if (resp.ok) {
                            const data = await resp.json().catch(() => ({}));
                            status.textContent = data.status === 'ok' ? 'Connected' : 'Degraded';
                            ok = data.status === 'ok';
                        } else {
                            status.textContent = 'Error ' + resp.status;
                        }
                    } catch (_) { }
                    if (!ok) {
                        const resp2 = await fetch(netUrl, { method: 'GET' }).catch(() => null);
                        if (resp2 && resp2.ok) {
                            const data2 = await resp2.json().catch(() => ({}));
                            const dnsOk = data2.dns && (data2.dns.openai || data2.dns.google);
                            const httpsOk = data2.https && data2.https.google;
                            status.textContent = (dnsOk || httpsOk) ? 'Online (API unreachable)' : 'Offline';
                        } else {
                            status.textContent = navigator.onLine ? 'API Unreachable' : 'Offline';
                        }
                    }
                } catch (e) {
                    status.textContent = navigator.onLine ? 'API Unreachable' : 'Offline';
                }
            };
        }
        if (saveBtn) {
            saveBtn.onclick = function () {
                const payload = {
                    ssid: ssid ? ssid.value.trim() : '',
                    password: pwd ? pwd.value : '',
                    proxy: proxy ? proxy.value.trim() : '',
                    apiEndpoint: api ? api.value.trim() : ''
                };
                localStorage.setItem('gracex.network', JSON.stringify(payload));
                if (payload.apiEndpoint) {
                    window.GRACEX_BRAIN_API = payload.apiEndpoint;
                }
                if (status) status.textContent = 'Saved';
            };
        }
        window.addEventListener('online', function () {
            if (badge) badge.textContent = '🟢 Online';
        });
        window.addEventListener('offline', function () {
            if (badge) badge.textContent = '🔴 Offline';
        });
    }

    async function sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message to chat
        addMessageToChat(message, 'user');

        // Show typing indicator
        showTypingIndicator();

        const startTime = performance.now();

        try {
            let aiResponse = '';

            // Use runModuleBrain if available (connects to backend API via brainLevel5.js)
            if (typeof window.runModuleBrain === 'function') {
                const result = await window.runModuleBrain('core2', message);
                aiResponse = typeof result === 'string' ? result : (result.reply || result.message || '');
            } else {
                // Fallback: try backend API directly
                const apiBase = window.GRACEX_BRAIN_API || window.GRACEX_API_BASE || 'http://localhost:3000';
                const response = await fetch(apiBase + '/api/brain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        module: 'core2',
                        messages: [{
                            role: 'user',
                            content: message
                        }],
                        temperature: 0.7,
                        max_tokens: 1500
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    aiResponse = data.reply || data.message || 'I received your message but had trouble processing it.';
                } else {
                    throw new Error(`API returned ${response.status}`);
                }
            }

            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);

            removeTypingIndicator();

            if (aiResponse) {
                addMessageToChat(aiResponse, 'assistant');

                // Speak response if TTS is enabled
                if (window.GRACEX_TTS && GRACEX_TTS.isEnabled()) {
                    // Speak first sentence only for brevity
                    const firstSentence = aiResponse.split('.')[0] + '.';
                    GRACEX_TTS.speak(firstSentence);
                }

                console.log(`🤖 AI Response received in ${responseTime}ms`);
            } else {
                throw new Error('No response received');
            }

        } catch (error) {
            console.error('🚨 API Error:', error);
            removeTypingIndicator();

            let errorMessage = '⚠️ I\'m experiencing connection issues. ';

            if (!navigator.onLine) {
                errorMessage += 'You appear to be offline. Please check your internet connection.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage += 'Cannot reach the backend API. Make sure the server is running on port 3000.';
            } else if (error.message.includes('401')) {
                errorMessage += 'API authentication failed. Please configure your API key in server/.env.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
            } else {
                errorMessage += 'Please try again in a moment.';
            }

            addMessageToChat(errorMessage, 'assistant');
        }

        messageCount++;
        updateMessageCount();
    }

    function addMessageToChat(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.animation = 'fadeInUp 0.4s ease';

        const timestamp = new Date().toLocaleTimeString();

        messageDiv.innerHTML = `
            <div>${content}</div>
            <div class="message-time">${timestamp}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store conversation
        conversations.push({
            content,
            type,
            timestamp: new Date()
        });

        // Limit stored conversations to last 50
        if (conversations.length > 50) {
            conversations = conversations.slice(-50);
        }
    }

    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function updateVoiceButtonState(isActive) {
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            if (isActive) {
                voiceBtn.classList.add('active');
            } else {
                voiceBtn.classList.remove('active');
            }
        }
    }

    function updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    function updateMessageCount() {
        const countElement = document.getElementById('message-count');
        if (countElement) {
            countElement.textContent = messageCount;
        }
    }

    function startSystemMonitoring() {
        // Update immediately
        updateUptime();
        updateNetworkStatus();

        // Then update every second
        setInterval(() => {
            updateUptime();
        }, 1000);

        // Check connectivity every 30 seconds
        setInterval(() => {
            checkInternetConnectivity();
        }, 30000);
    }

    async function checkInternetConnectivity() {
        if (!navigator.onLine) {
            updateConnectionStatus('Offline');
            const badge = document.getElementById('c2-net-badge');
            if (badge) badge.textContent = '🔴 Offline';
            return false;
        }

        // Test connectivity
        const testUrls = ['https://www.google.com', 'https://www.cloudflare.com'];
        let connected = false;

        for (const url of testUrls) {
            try {
                await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
                connected = true;
                break;
            } catch (e) {
                // Try next URL
            }
        }

        if (connected) {
            updateConnectionStatus('Connected');
            const badge = document.getElementById('c2-net-badge');
            if (badge) badge.textContent = '🟢 Online';
        } else {
            updateConnectionStatus('Limited');
            const badge = document.getElementById('c2-net-badge');
            if (badge) badge.textContent = '🟡 Limited';
        }

        return connected;
    }

    function updateNetworkStatus() {
        const networkEl = document.getElementById('network-speed');
        if (!networkEl) return;

        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn.downlink) {
                networkEl.textContent = `${conn.downlink}Mbps`;
            } else {
                networkEl.textContent = navigator.onLine ? 'Online' : 'Offline';
            }
        } else {
            networkEl.textContent = navigator.onLine ? 'Online' : 'Offline';
        }
    }

    function updateUptime() {
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            const elapsed = Date.now() - sessionStart;
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            uptimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    // ============================================
    // PUBLIC API FUNCTIONS
    // ============================================

    window.GRACEX_CORE2 = {
        // Core functions
        init: initCore2,
        sendMessage: sendMessage,
        clearChat: function () {
            const messagesContainer = document.getElementById('chat-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="message assistant">
                        <div>🚀 Chat cleared. I'm ready for your next question!</div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                `;
            }
            conversations = [];
            messageCount = 0;
            updateMessageCount();
        },

        // Voice functions
        toggleVoice: function () {
            if (!voiceRecognition) {
                console.warn('Voice recognition not available');
                return;
            }

            if (voiceRecognition.recognition && voiceRecognition.recognition.recognizing) {
                voiceRecognition.stop();
            } else {
                voiceRecognition.start();
            }
        },

        // Export functions
        exportChat: function () {
            const exportData = {
                timestamp: new Date().toISOString(),
                system: 'GRACE-X CORE 2.0™',
                conversations,
                stats: {
                    messageCount,
                    sessionStart: new Date(sessionStart).toISOString(),
                    sessionDuration: Date.now() - sessionStart
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gracex-core2-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        // Status functions
        getStatus: function () {
            return {
                initialized: isInitialized,
                messageCount,
                sessionDuration: Date.now() - sessionStart,
                conversationLength: conversations.length,
                voiceAvailable: !!voiceRecognition
            };
        }
    };

    // ============================================
    // AUTO-INITIALIZE ON MODULE LOAD
    // ============================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCore2);
    } else {
        // DOM already ready
        setTimeout(initCore2, 100);
    }

    console.log('🚀 GRACE-X CORE 2.0™ Module Loaded');

})();

// ============================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS
// ============================================

function sendMessage() {
    if (window.GRACEX_CORE2) {
        window.GRACEX_CORE2.sendMessage();
    }
}

function clearChat() {
    if (window.GRACEX_CORE2) {
        window.GRACEX_CORE2.clearChat();
    }
}

function exportChat() {
    if (window.GRACEX_CORE2) {
        window.GRACEX_CORE2.exportChat();
    }
}

function toggleVoiceInput() {
    if (window.GRACEX_CORE2) {
        window.GRACEX_CORE2.toggleVoice();
    }
}

function quickAction(action) {
    const actions = {
        weather: 'What\'s the current weather?',
        time: 'What time is it right now?',
        news: 'What are the latest news headlines?',
        system: 'Show me system information and performance',
        crypto: 'What are current Bitcoin and Ethereum prices?',
        maps: 'Show me nearby places or directions',
        help: 'Give me a quick tour of Core 2.0 and how to use it'
    };

    if (actions[action]) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = actions[action];
            sendMessage();
        }
    } else if (action === 'refresh-weather') {
        if (typeof window.loadWeather === 'function') window.loadWeather();
    } else if (action === 'refresh-news') {
        if (typeof window.loadNews === 'function') window.loadNews();
    }
}

function focusChat() {
    const input = document.getElementById('chat-input');
    if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function openModule(moduleId) {
    if (!moduleId) return;
    window.location.hash = '#/' + moduleId;
}
