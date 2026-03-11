// GRACE-X Sovereign Brain v1.0
// Catch-all brain for unrecognised or future modules
// Provides sensible defaults without crashing
// ---------------------------------------------------------------

'use strict';

const BRAIN_NAME = 'sovereign';

// Sovereign handles everything not explicitly mapped
const HANDLED_MODULES = [];

const BRAIN_PROMPT = `
You are operating through the GRACE-X Sovereign Brain — the adaptive intelligence layer.
This brain handles requests from new, experimental, or unrecognised modules.
Adapt your tone to the context of the request.
Be helpful and clear. If you're unsure about the module context, ask for clarification.
`;

function prepareMessages(messages, moduleName) {
    return messages.map(m => {
        if (m.role === 'system') {
            return {
                ...m,
                content: m.content + '\n\n## Brain Layer\n' + BRAIN_PROMPT.trim() +
                    `\n\nNote: This request came from module "${moduleName}" which is not yet mapped to a specific brain.`
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
