/**
 * NEXUS AI - Light Smart Search
 * ⚡ চোখের পলকে সার্চ - No Heavy Models
 * সরাসরি প্যাটার্ন ম্যাচিং
 */

class NEXUSLightSearch {
    constructor() {
        // Search index
        this.index = new Map();
        
        // Recent searches
        this.recent = [];
        this.maxRecent = 20;
        
        // Cache
        this.cache = window.nexusCache;
        
        // Stats
        this.stats = {
            searches: 0,
            hits: 0,
            misses: 0
        };
        
        console.log('[NEXUS Search] 🔍 Light Smart Search চালু');
    }
    
    // ==================== INDEXING ====================
    
    // ইনডেক্স তৈরি
    indexData(key, data) {
        const tokens = this.tokenize(data);
        const keyLower = key.toLowerCase();
        
        for (const token of tokens) {
            if (!this.index.has(token)) {
                this.index.set(token, []);
            }
            this.index.get(token).push({
                key: keyLower,
                keyOriginal: key,
                data: data
            });
        }
        
        console.log(`[NEXUS Search] 📑 Indexed: ${key} (${tokens.length} tokens)`);
    }
    
    // টোকেনাইজ
    tokenize(text) {
        if (!text) return [];
        
        // Convert to string
        let str = String(text);
        
        // Bengali + English + Numbers
        const tokens = [];
        
        // Bengali words
        const bengali = str.match(/[\u0980-\u09FF]+/g) || [];
        tokens.push(...bengali.map(t => t.toLowerCase()));
        
        // English words
        const english = str.match(/[a-zA-Z]+/g) || [];
        tokens.push(...english.map(t => t.toLowerCase()));
        
        // Numbers
        const numbers = str.match(/\d+/g) || [];
        tokens.push(...numbers);
        
        // Remove duplicates
        return [...new Set(tokens)].filter(t => t.length > 1);
    }
    
    // ==================== SEARCHING ====================
    
    // দ্রুত সার্চ ⚡
    search(query, options = {}) {
        const {
            limit = 10,
            fuzzy = true,
            useCache = true
        } = options;
        
        this.stats.searches++;
        
        // Check cache
        if (useCache) {
            const cached = this.cache?.get('search:' + query);
            if (cached) {
                this.stats.hits++;
                return cached;
            }
        }
        
        const startTime = Date.now();
        const queryTokens = this.tokenize(query);
        
        if (queryTokens.length === 0) {
            return [];
        }
        
        // Score results
        const results = new Map();
        
        for (const token of queryTokens) {
            // Exact match
            const matches = this.index.get(token) || [];
            
            for (const match of matches) {
                const key = match.key;
                
                if (!results.has(key)) {
                    results.set(key, {
                        key: match.keyOriginal,
                        data: match.data,
                        score: 0,
                        matches: []
                    });
                }
                
                const result = results.get(key);
                result.score += 10; // Exact token match
                result.matches.push(token);
            }
            
            // Fuzzy match (if enabled)
            if (fuzzy) {
                for (const [indexToken, indexMatches] of this.index) {
                    if (indexToken === token) continue;
                    
                    const similarity = this.calculateSimilarity(token, indexToken);
                    
                    if (similarity > 0.6) {
                        for (const match of indexMatches) {
                            const key = match.key;
                            
                            if (!results.has(key)) {
                                results.set(key, {
                                    key: match.keyOriginal,
                                    data: match.data,
                                    score: 0,
                                    matches: []
                                });
                            }
                            
                            const result = results.get(key);
                            result.score += similarity * 5;
                            result.matches.push(indexToken + ' (similar)');
                        }
                    }
                }
            }
        }
        
        // Sort by score
        const sortedResults = Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => ({
                ...r,
                time: Date.now() - startTime
            }));
        
        // Cache
        if (useCache && sortedResults.length > 0) {
            this.cache?.set('search:' + query, sortedResults, 1000 * 60 * 5);
        }
        
        // Update stats
        if (sortedResults.length > 0) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        
        // Add to recent
        this.addRecent(query);
        
        return sortedResults;
    }
    
    // ইনস্ট্যান্ট সার্চ (আরও দ্রুত)
    instant(query) {
        const results = this.search(query, { limit: 5, fuzzy: false });
        return results;
    }
    
    // ==================== SIMILARITY ====================
    
    // সিমিলারিটি গণনা
    calculateSimilarity(a, b) {
        if (!a || !b) return 0;
        
        a = String(a).toLowerCase();
        b = String(b).toLowerCase();
        
        if (a === b) return 1;
        
        // Levenshtein-based similarity
        const distance = this.levenshteinDistance(a, b);
        const maxLen = Math.max(a.length, b.length);
        
        return 1 - (distance / maxLen);
    }
    
    // Levenshtein distance
    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }
    
    // ==================== RECENT ====================
    
    addRecent(query) {
        this.recent.unshift({
            query,
            time: Date.now()
        });
        
        if (this.recent.length > this.maxRecent) {
            this.recent.pop();
        }
    }
    
    getRecent() {
        return this.recent;
    }
    
    clearRecent() {
        this.recent = [];
    }
    
    // ==================== AUTOCOMPLETE ====================
    
    autocomplete(query) {
        if (!query || query.length < 2) return [];
        
        const q = query.toLowerCase();
        const suggestions = new Set();
        
        // From index
        for (const token of this.index.keys()) {
            if (token.startsWith(q)) {
                suggestions.add(token);
            }
        }
        
        // From recent
        for (const item of this.recent) {
            if (item.query.toLowerCase().startsWith(q)) {
                suggestions.add(item.query);
            }
        }
        
        return Array.from(suggestions).slice(0, 5);
    }
    
    // ==================== STATS ====================
    
    getStats() {
        return {
            ...this.stats,
            indexSize: this.index.size,
            recentCount: this.recent.length,
            hitRate: this.stats.searches > 0 
                ? (this.stats.hits / this.stats.searches * 100).toFixed(2) + '%' 
                : '0%'
        };
    }
    
    // Clear
    clearIndex() {
        this.index.clear();
        console.log('[NEXUS Search] 📑 Index cleared');
    }
}

// Export
window.NEXUSLightSearch = NEXUSLightSearch;
window.nexusSearch = new NEXUSLightSearch();

console.log('[NEXUS] 🔍 Light Smart Search Ready!');
