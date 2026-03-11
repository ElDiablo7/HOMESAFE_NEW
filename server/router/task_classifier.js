// GRACE-X Task Classifier v1.0
// Deterministic module → brain routing
// Part of GRACE-X Brain Router architecture
// -------------------------------------------

'use strict';

// Module → Brain mapping (deterministic, no ML)
const MODULE_BRAIN_MAP = {
    // Core brain — primary system modules
    core: 'core',
    uplift: 'core',
    guardian: 'core',
    family: 'core',
    callassist: 'core',

    // Analysis brain — professional/analytical modules
    builder: 'analysis',
    siteops: 'analysis',
    sport: 'analysis',
    tradelink: 'analysis',
    osint: 'analysis',
    accounting: 'analysis',
    forge: 'analysis',

    // Utility brain — lifestyle/creative modules
    fit: 'utility',
    yoga: 'utility',
    chef: 'utility',
    beauty: 'utility',
    artist: 'utility',
    gamer: 'utility',
};

// Valid brain names
const VALID_BRAINS = ['core', 'analysis', 'utility', 'sovereign'];

/**
 * Classify a module into a brain category.
 * @param {string} moduleName - The module identifier from the request
 * @returns {{ brain: string, confidence: string }} - The brain assignment
 */
function classify(moduleName) {
    const mod = (moduleName || '').toLowerCase().trim();

    if (!mod) {
        return { brain: 'core', confidence: 'default' };
    }

    const mapped = MODULE_BRAIN_MAP[mod];
    if (mapped) {
        return { brain: mapped, confidence: 'exact' };
    }

    // Unknown module → sovereign brain (catch-all)
    return { brain: 'sovereign', confidence: 'fallback' };
}

/**
 * Get all registered modules for a given brain.
 * @param {string} brainName
 * @returns {string[]}
 */
function getModulesForBrain(brainName) {
    return Object.entries(MODULE_BRAIN_MAP)
        .filter(([, brain]) => brain === brainName)
        .map(([mod]) => mod);
}

module.exports = {
    classify,
    getModulesForBrain,
    MODULE_BRAIN_MAP,
    VALID_BRAINS
};
