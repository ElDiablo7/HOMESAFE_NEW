// GRACE-X Ollama Provider v1.0
// Extracted from server.js inline callOllama — real local HTTP call
// Supports timeout, retry, safe failure if Ollama unavailable
// ---------------------------------------------------------------

'use strict';

const PROVIDER_NAME = 'ollama';
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;

/**
 * Call Ollama local LLM.
 * @param {Array} messages - Chat messages array
 * @param {number} temperature - Sampling temperature
 * @param {number} max_tokens - Max response tokens
 * @param {object} [opts] - Optional overrides { model, host, timeout }
 * @returns {Promise<string>} - The response text
 */
async function call(messages, temperature, max_tokens, opts = {}) {
    const baseUrl = opts.host || process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const model = opts.model || process.env.OLLAMA_MODEL || 'llama3.2';
    const timeoutMs = opts.timeout || parseInt(process.env.REQUEST_TIMEOUT) || 120000;

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: false,
                    options: {
                        temperature,
                        num_predict: max_tokens
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const err = new Error(`Ollama API error: ${response.status} - ${errorData.error || response.statusText}`);
                err.code = 'OLLAMA_ERROR';
                err.provider = PROVIDER_NAME;
                throw err;
            }

            const data = await response.json();

            if (!data.message?.content) {
                const err = new Error('Invalid response from Ollama');
                err.code = 'INVALID_RESPONSE';
                err.provider = PROVIDER_NAME;
                throw err;
            }

            return data.message.content;

        } catch (err) {
            lastError = err;

            if (err.name === 'AbortError') {
                lastError = new Error(`Ollama request timed out after ${timeoutMs / 1000}s — is Ollama running on ${baseUrl}?`);
                lastError.code = 'OLLAMA_TIMEOUT';
                lastError.provider = PROVIDER_NAME;
            }

            if (err.cause?.code === 'ECONNREFUSED') {
                lastError = new Error(`Cannot connect to Ollama at ${baseUrl} — is Ollama running? Start with: ollama serve`);
                lastError.code = 'OLLAMA_CONNECTION_REFUSED';
                lastError.provider = PROVIDER_NAME;
                // Don't retry connection refused — Ollama is down
                break;
            }

            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                continue;
            }
        }
    }

    throw lastError;
}

/**
 * Check whether Ollama is potentially available (host configured or default).
 * Does NOT ping — just checks config.
 * @returns {boolean}
 */
function isAvailable() {
    // Ollama is always "potentially" available since it runs locally
    return true;
}

module.exports = {
    name: PROVIDER_NAME,
    call,
    isAvailable
};
