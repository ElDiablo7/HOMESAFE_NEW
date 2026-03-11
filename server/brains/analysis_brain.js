// GRACE-X Analysis Brain v1.0
// Handles: builder, siteops, sport, tradelink, osint, accounting, forge
// Adds analytical focus to system prompts
// ---------------------------------------------------------------

'use strict';

const BRAIN_NAME = 'analysis';

const HANDLED_MODULES = ['builder', 'siteops', 'sport', 'tradelink', 'osint', 'accounting', 'forge'];

const BRAIN_PROMPT = `
You are operating through the GRACE-X Analysis Brain — the professional intelligence layer.
This brain handles analytical, technical, and data-driven modules.
Prioritise accuracy, structured output, and measured analysis.
Avoid speculation. Back claims with reasoning.
When dealing with financial or safety matters, always include appropriate disclaimers.
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
