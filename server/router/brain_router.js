// GRACE-X Brain Router v1.0
// Orchestrates: task classification → brain selection → provider execution
// This is the new routing layer behind USE_BRAIN_ROUTER feature flag
// ---------------------------------------------------------------

'use strict';

const taskClassifier = require('./task_classifier');
const providerRegistry = require('../providers/provider_registry');

// Brain modules
const brains = {
    core: require('../brains/core_brain'),
    analysis: require('../brains/analysis_brain'),
    utility: require('../brains/utility_brain'),
    sovereign: require('../brains/sovereign_brain')
};

/**
 * Route a brain request through the new router pipeline.
 *
 * Flow:
 *   1. Classify module → brain
 *   2. Let the brain prepare/augment messages
 *   3. Call provider registry with failover
 *   4. Let the brain post-process the response
 *   5. Return structured result with metadata
 *
 * @param {object} params
 * @param {string} params.module - Module name (e.g. 'builder', 'core')
 * @param {Array}  params.messages - Chat messages array (already includes system prompt from server.js)
 * @param {number} params.temperature
 * @param {number} params.max_tokens
 * @param {string} [params.requestId]
 * @returns {Promise<object>} - { reply, brain_used, provider_used, latency_ms, request_id, error_state, failover }
 */
async function route(params) {
    const { module: moduleName, messages, temperature, max_tokens, requestId } = params;
    const startTime = Date.now();

    const result = {
        request_id: requestId || `gx-rt-${Date.now().toString(36)}`,
        module: moduleName || 'unknown',
        brain_used: null,
        provider_used: null,
        latency_ms: 0,
        error_state: null,
        failover: false,
        reply: null
    };

    try {
        // Step 1: Classify
        const classification = taskClassifier.classify(moduleName);
        result.brain_used = classification.brain;

        // Step 2: Get brain and prepare messages
        const brain = brains[classification.brain] || brains.sovereign;
        const preparedMessages = brain.prepareMessages(messages, moduleName);

        // Step 3: Call providers with failover
        const providerResult = await providerRegistry.callWithFailover(
            preparedMessages,
            temperature,
            max_tokens
        );

        result.provider_used = providerResult.provider;
        result.failover = providerResult.failover;

        // Step 4: Post-process
        result.reply = brain.postProcess(providerResult.reply, moduleName);

    } catch (err) {
        result.error_state = {
            code: err.code || 'ROUTER_ERROR',
            message: err.message
        };

        // Return a graceful error response instead of crashing
        result.reply = 'I\'m having difficulty processing that right now. The system is still operational — please try again or switch to legacy mode.';
    }

    result.latency_ms = Date.now() - startTime;

    // Log (lightweight)
    logRouterRequest(result);

    return result;
}

/**
 * Lightweight router logging.
 * @param {object} result - The route result object
 */
function logRouterRequest(result) {
    const status = result.error_state ? '❌' : '✅';
    console.log(
        `[BRAIN ROUTER] ${status} ` +
        `req=${result.request_id} ` +
        `module=${result.module} ` +
        `brain=${result.brain_used} ` +
        `provider=${result.provider_used || 'none'} ` +
        `latency=${result.latency_ms}ms` +
        (result.failover ? ' [FAILOVER]' : '') +
        (result.error_state ? ` error=${result.error_state.code}` : '')
    );
}

/**
 * Get router status for diagnostics.
 * @returns {object}
 */
function getStatus() {
    return {
        router: 'active',
        brains: Object.keys(brains),
        classifier: {
            modules: Object.keys(taskClassifier.MODULE_BRAIN_MAP),
            brains: taskClassifier.VALID_BRAINS
        },
        providers: providerRegistry.getStatus()
    };
}

module.exports = {
    route,
    getStatus
};
