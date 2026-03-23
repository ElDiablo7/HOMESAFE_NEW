/**
 * Web Search Utility for GRACE-X
 * Fetches real-time DuckDuckGo HTML results to fulfill user internet requests.
 */

async function searchWeb(query) {
    try {
        console.log(`[WEB SEARCH] Fetching real-time data for: "${query}"`);
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        if (!response.ok) {
            console.warn(`[WEB SEARCH] Failed to fetch: HTTP ${response.status}`);
            return null;
        }

        const html = await response.text();
        
        // Extract basic snippets using regex to avoid heavy DOM parsers
        const results = [];
        const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        let count = 0;
        
        while ((match = snippetRegex.exec(html)) !== null && count < 3) {
            // Clean HTML tags and decode common entities
            let text = match[1].replace(/<[^>]*>?/gm, '').trim();
            text = text.replace(/&quot;/g, '"')
                       .replace(/&#x27;/g, "'")
                       .replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/<b>/g, '')
                       .replace(/<\/b>/g, '');
            
            if (text && text.length > 20) {
                results.push(`- ${text}`);
                count++;
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
