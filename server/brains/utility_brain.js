// GRACE-X Utility Brain v1.0
// Handles: fit, yoga, chef, beauty, artist, gamer
// Lighter, creative/lifestyle oriented
// ---------------------------------------------------------------

'use strict';

const BRAIN_NAME = 'utility';

const HANDLED_MODULES = ['fit', 'yoga', 'chef', 'beauty', 'artist', 'gamer'];

const BRAIN_PROMPT = `
You are operating through the GRACE-X Utility Brain — the lifestyle and creative intelligence layer.
This brain handles personal wellbeing, creativity, and lifestyle modules.
Be warm, encouraging, and practical without being patronising.
Keep advice actionable and grounded in reality.
`;

function prepareMessages(messages, moduleName) {
    return messages.map(m => {
        if (m.role === 'system') {
            return {
                ...m,
                content: m.content + '\n\n## Brain Layer\n' + BRAIN_PROMPT.trim()
            };
        }
        return { ...m };
    });
}

function postProcess(reply, moduleName) {
    return reply;
}

module.exports = {
    name: BRAIN_NAME,
    handledModules: HANDLED_MODULES,
    prepareMessages,
    postProcess
};
