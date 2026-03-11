// GRACE-X Core Brain v1.0
// Handles: core, uplift, guardian, family, callassist modules
// Adds brain-specific system prompt augmentation
// ---------------------------------------------------------------

'use strict';

const BRAIN_NAME = 'core';

// Modules this brain handles
const HANDLED_MODULES = ['core', 'uplift', 'guardian', 'family', 'callassist'];

// Brain-level system prompt augmentation
const BRAIN_PROMPT = `
You are operating through the GRACE-X Core Brain — the primary intelligence layer.
This brain handles the most critical user-facing interactions: system control, wellbeing, safety, and family.
Maintain the highest standard of care, clarity, and emotional awareness.
Never rush. Always be present.
`;

/**
 * Prepare messages for the core brain.
 * Augments the system prompt with brain-level context.
 * @param {Array} messages - Original message array
 * @param {string} moduleName - The module making the request
 * @returns {Array} - Augmented messages
 */
function prepareMessages(messages, moduleName) {
    // Find existing system message and augment it
    const augmented = messages.map(m => {
        if (m.role === 'system') {
            return {
                ...m,
                content: m.content + '\n\n## Brain Layer\n' + BRAIN_PROMPT.trim()
            };
        }
        return { ...m };
    });

    return augmented;
}

/**
 * Post-process the response if needed.
 * Core brain currently passes through unchanged.
 * @param {string} reply - Raw provider response
 * @param {string} moduleName
 * @returns {string}
 */
function postProcess(reply, moduleName) {
    return reply;
}

module.exports = {
    name: BRAIN_NAME,
    handledModules: HANDLED_MODULES,
    prepareMessages,
    postProcess
};
