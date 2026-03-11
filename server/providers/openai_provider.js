// GRACE-X OpenAI Provider v1.0
// Extracted from server.js inline callOpenAI — real API call, not scaffold
// Supports timeout, retry, clean error handling
// ---------------------------------------------------------------

'use strict';

const PROVIDER_NAME = 'openai';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Call OpenAI chat completions API.
 * @param {Array} messages - Chat messages array
 * @param {number} temperature - Sampling temperature
 * @param {number} max_tokens - Max response tokens
 * @param {object} [opts] - Optional overrides { model, apiKey, timeout }
 * @returns {Promise<string>} - The response text
 */
async function call(messages, temperature, max_tokens, opts = {}) {
    const apiKey = opts.apiKey || process.env.OPENAI_API_KEY || process.env.API_KEY;
    const model = opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const timeoutMs = opts.timeout || parseInt(process.env.REQUEST_TIMEOUT) || 60000;

    if (!apiKey) {
        const err = new Error('OpenAI API key not configured');
        err.code = 'API_KEY_MISSING';
        err.provider = PROVIDER_NAME;
        throw err;
    }

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens
                }),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const err = new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
                err.code = 'OPENAI_ERROR';
                err.statusCode = response.status === 401 ? 401 : 502;
                err.provider = PROVIDER_NAME;
                throw err;
            }

            const data = await response.json();

            if (!data.choices?.[0]?.message?.content) {
                const err = new Error('Invalid response from OpenAI API');
                err.code = 'INVALID_RESPONSE';
                err.provider = PROVIDER_NAME;
                throw err;
            }

            return data.choices[0].message.content;

        } catch (err) {
            lastError = err;

            if (err.name === 'AbortError') {
                lastError = new Error(`OpenAI request timed out after ${timeoutMs / 1000}s`);
                lastError.code = 'OPENAI_TIMEOUT';
                lastError.provider = PROVIDER_NAME;
            }

            // Don't retry auth errors
            if (err.statusCode === 401) throw err;

            // Retry on transient errors
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
                continue;
            }
        }
    }

    throw lastError;
}

/**
 * Check whether this provider is available (has key configured).
 * @returns {boolean}
 */
function isAvailable() {
    return !!(process.env.OPENAI_API_KEY || process.env.API_KEY);
}

module.exports = {
    name: PROVIDER_NAME,
    call,
    isAvailable
};
