/**
 * Web Search Utility for GRACE-X
 * Fetches real-time data using duck-duck-scrape for robust, deep search context.
 */
const { search } = require('duck-duck-scrape');

async function searchWeb(query) {
    try {
        console.log(`[WEB SEARCH] Fetching deep data for: "${query}"`);
        const searchResults = await search(query, {
            safeSearch: 'strict'
        });
        
        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            console.warn(`[WEB SEARCH] No results found.`);
            return null;
        }

        const results = [];
        // Get up to 10 results for deep context
        const limit = Math.min(10, searchResults.results.length);
        
        for (let i = 0; i < limit; i++) {
            const res = searchResults.results[i];
            // Include Title, Snippet, and URL to give the LLM maximum surface area
            if (res.title && res.description) {
                // Strip HTML tags from description just in case
                let text = res.description.replace(/<[^>]*>?/gm, '').trim();
                text = text.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
                results.push(`[Result ${i+1}] ${res.title}\nDetails: ${text}\nSource: ${res.url}\n`);
            }
        }
        
        if (results.length > 0) {
            return results.join('\n');
        }
        
        return null;
    } catch (e) {
        console.error('[WEB SEARCH] Error:', e.message);
        return null;
    }
}

module.exports = {
    searchWeb
};
