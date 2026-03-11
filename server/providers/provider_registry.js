// GRACE-X Provider Registry v1.0
// Manages provider selection and failover for the brain router
// Priority: OpenAI → Ollama (as specified)
// ---------------------------------------------------------------

'use strict';

const openaiProvider = require('./openai_provider');
const ollamaProvider = require('./ollama_provider');

// All registered providers in priority order
const PROVIDERS = {
    openai: openaiProvider,
    ollama: ollamaProvider
};

// Default priority order
const DEFAULT_PRIORITY = ['openai', 'ollama'];

/**
 * Get a provider by name.
 * @param {string} name
 * @returns {object|null}
 */
function getProvider(name) {
    return PROVIDERS[name] || null;
}

/**
 * Get list of available providers (those with config present).
 * @returns {string[]}
 */
function getAvailableProviders() {
    return DEFAULT_PRIORITY.filter(name => PROVIDERS[name]?.isAvailable());
}

/**
 * Execute a request with failover across providers.
 * @param {Array} messages - Chat messages
 * @param {number} temperature
 * @param {number} max_tokens
 * @param {object} [opts] - { preferredProvider }
 * @returns {Promise<{ reply: string, provider: string, failover: boolean }>}
 */
async function callWithFailover(messages, temperature, max_tokens, opts = {}) {
    const preferred = opts.preferredProvider || 'openai';

    // Build priority list: preferred first, then others
    const priority = [preferred, ...DEFAULT_PRIORITY.filter(p => p !== preferred)];
    const unique = [...new Set(priority)];

    let lastError = null;
    const startProvider = preferred;

    for (const providerName of unique) {
        const provider = PROVIDERS[providerName];
        if (!provider) continue;

        try {
            const reply = await provider.call(messages, temperature, max_tokens);
            return {
                reply,
                provider: providerName,
                failover: providerName !== startProvider
            };
        } catch (err) {
            lastError = err;
            // Log but don't print secrets
            console.warn(`[PROVIDER REGISTRY] ${providerName} failed: ${err.code || err.message}`);
        }
    }

    // All providers failed
    const err = new Error('All providers failed — neither OpenAI nor Ollama could respond');
    err.code = 'ALL_PROVIDERS_FAILED';
    err.lastProviderError = lastError?.message;
    throw err;
}

/**
 * Get status of all providers.
 * @returns {object}
 */
function getStatus() {
    const status = {};
    for (const [name, provider] of Object.entries(PROVIDERS)) {
        status[name] = {
            available: provider.isAvailable(),
            name: provider.name
        };
    }
    return status;
}

module.exports = {
    getProvider,
    getAvailableProviders,
    callWithFailover,
    getStatus,
    PROVIDERS
};
