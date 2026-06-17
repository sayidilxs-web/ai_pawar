/**
 * NEXUS AI - Brain Integration System
 * ⚡ সবকিছু একসাথে কানেক্ট - চোখের পলকে
 * No Heavy Models, সরাসরি ডাটা
 */

class NEXUSBrain {
    constructor() {
        // All systems
        this.cache = null;
        this.scraper = null;
        this.autoUpdate = null;
        this.search = null;
        this.knowledge = null;
        this.neural = null;
        this.smartLearning = null;
        
        // Response cache
        this.responseCache = new Map();
        this.maxCacheSize = 500;
        
        // Stats
        this.stats = {
            requests: 0,
            cacheHits: 0,
            processingTime: 0
        };
        
        // Ready state
        this.ready = false;
        
        console.log('[NEXUS Brain] 🧠 Brain System initializing...');
        this.init();
    }
    
    async init() {
        // Wait for dependencies
        await this.waitForDependencies();
        
        // Connect all systems
        this.connectSystems();
        
        // Preload essential data
        await this.preload();
        
        // Start auto updates
        if (this.autoUpdate) {
            this.autoUpdate.start();
        }
        
        this.ready = true;
        console.log('[NEXUS Brain] ✅ Brain System Ready!');
    }
    
    async waitForDependencies() {
        const maxWait = 5000;
        const start = Date.now();
        
        while (Date.now() - start < maxWait) {
            // Wait for cache
            if (!this.cache && window.nexusCache) {
                this.cache = window.nexusCache;
                console.log('[NEXUS Brain] 📦 Cache connected');
            }
            
            // Wait for scraper
            if (!this.scraper && window.nexusScraper) {
                this.scraper = window.nexusScraper;
                console.log('[NEXUS Brain] 🌐 Scraper connected');
            }
            
            // Wait for auto update
            if (!this.autoUpdate && window.nexusAutoUpdate) {
                this.autoUpdate = window.nexusAutoUpdate;
                console.log('[NEXUS Brain] 🔄 Auto Update connected');
            }
            
            // Wait for search
            if (!this.search && window.nexusSearch) {
                this.search = window.nexusSearch;
                console.log('[NEXUS Brain] 🔍 Search connected');
            }
            
            // Wait for knowledge
            if (!this.knowledge && window.nexusKnowledge) {
                this.knowledge = window.nexusKnowledge;
                console.log('[NEXUS Brain] 📚 Knowledge Base connected');
            }
            
            // Wait for neural
            if (!this.neural && window.NEXUSCore) {
                this.neural = window.NEXUSCore;
                console.log('[NEXUS Brain] 🧠 Neural Network connected');
            }
            
            // Wait for smart learning
            if (!this.smartLearning && window.smartLearning) {
                this.smartLearning = window.smartLearning;
                console.log('[NEXUS Brain] 🎯 Smart Learning connected');
            }
            
            // Check if all ready
            if (this.cache && this.scraper && this.search && this.knowledge) {
                break;
            }
            
            await new Promise(r => setTimeout(r, 100));
        }
    }
    
    connectSystems() {
        // Connect Knowledge Base to Search
        if (this.knowledge && this.search) {
            // Index all knowledge
            for (const [category, data] of Object.entries(this.knowledge.knowledge || {})) {
                if (data && typeof data === 'object') {
                    this.search.indexData(category, JSON.stringify(data));
                }
            }
            console.log('[NEXUS Brain] 📚 Knowledge indexed in search');
        }
        
        // Connect Cache to Search
        if (this.cache && this.search) {
            // Cache will auto-populate search
        }
        
        console.log('[NEXUS Brain] 🔗 All systems connected');
    }
    
    async preload() {
        console.log('[NEXUS Brain] 📥 Preloading essential data...');
        
        // Index knowledge base
        await this.indexKnowledgeBase();
        
        // Warm up cache
        this.warmCache();
        
        console.log('[NEXUS Brain] ✅ Preloading complete');
    }
    
    async indexKnowledgeBase() {
        if (!this.knowledge || !this.search) return;
        
        const categories = Object.keys(this.knowledge.knowledge || {});
        console.log(`[NEXUS Brain] 📑 Indexing ${categories.length} categories...`);
        
        for (const category of categories) {
            const data = this.knowledge.knowledge[category];
            if (data) {
                this.search.indexData(category, this.stringifySmart(data));
            }
        }
    }
    
    stringifySmart(obj, depth = 0) {
        if (depth > 5) return '[Object]';
        
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'number') return String(obj);
        if (typeof obj === 'boolean') return String(obj);
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.stringifySmart(item, depth + 1)).join(' ');
        }
        
        if (typeof obj === 'object' && obj !== null) {
            const parts = [];
            for (const [key, value] of Object.entries(obj)) {
                parts.push(key);
                parts.push(this.stringifySmart(value, depth + 1));
            }
            return parts.join(' ');
        }
        
        return '';
    }
    
    warmCache() {
        if (!this.cache) return;
        
        // Pre-populate with essential queries
        const essentials = [
            'hello', 'আসসালাম', 'কেমন আছ', 'সময়', 'তারিখ',
            'হ্যালো', 'হাই', 'হেল্প', 'সাহায্য'
        ];
        
        for (const q of essentials) {
            this.cache.set('warm:' + q, true, 1000 * 60 * 60);
        }
        
        console.log('[NEXUS Brain] 🔥 Cache warmed up');
    }
    
    // ==================== MAIN THINK FUNCTION ====================
    
    async think(input) {
        const startTime = Date.now();
        this.stats.requests++;
        
        // Check cache first
        const cached = this.responseCache.get(input);
        if (cached && Date.now() - cached.time < 60000) {
            this.stats.cacheHits++;
            return cached.response;
        }
        
        // Process input
        const response = await this.process(input);
        
        // Cache response
        this.cacheResponse(input, response);
        
        this.stats.processingTime = Date.now() - startTime;
        
        return response;
    }
    
    async process(input) {
        const lower = input.toLowerCase();
        
        // ১. Realtime data (সবার আগে)
        if (this.contains(lower, ['আবহাওয়া', 'weather', 'বৃষ্টি', 'temp'])) {
            const weather = await this.getWeather();
            if (weather) return this.formatWeather(weather);
        }
        
        if (this.contains(lower, ['নিউজ', 'খবর', 'news', 'সংবাদ'])) {
            const news = await this.getNews();
            if (news) return this.formatNews(news);
        }
        
        if (this.contains(lower, ['বিটকয়েন', 'crypto', 'বিটিসি', 'ইথারিয়াম'])) {
            const crypto = await this.getCrypto();
            if (crypto) return this.formatCrypto(crypto);
        }
        
        // ২. Knowledge Base search
        const kbResult = this.searchKnowledge(input);
        if (kbResult) return kbResult;
        
        // ৩. Smart Learning pattern
        const patternResult = this.searchPattern(input);
        if (patternResult) return patternResult;
        
        // ৪. Neural network context
        const contextResult = this.getNeuralContext(input);
        if (contextResult) return contextResult;
        
        // ৫. Fallback
        return this.getFallback(input);
    }
    
    contains(text, keywords) {
        return keywords.some(kw => text.includes(kw));
    }
    
    // ==================== DATA GETTERS ====================
    
    async getWeather() {
        if (this.scraper) {
            return await this.scraper.getWeather();
        }
        return this.cache?.getTagged('weather', 'Dhaka');
    }
    
    async getNews() {
        if (this.scraper) {
            return await this.scraper.getNews();
        }
        return this.cache?.getTagged('news', 'bd');
    }
    
    async getCrypto() {
        if (this.scraper) {
            return await this.scraper.getCrypto();
        }
        return this.cache?.getTagged('crypto', 'prices');
    }
    
    // ==================== SEARCH ====================
    
    searchKnowledge(input) {
        if (!this.search || !this.knowledge) return null;
        
        // Search in indexed knowledge
        const results = this.search.search(input, { limit: 3 });
        
        if (results.length > 0) {
            return results[0].data;
        }
        
        // Direct search in knowledge base
        const kbResults = this.knowledge.search(input);
        if (kbResults && kbResults.length > 0) {
            return kbResults[0];
        }
        
        return null;
    }
    
    searchPattern(input) {
        if (!this.smartLearning) return null;
        
        const pattern = this.smartLearning.recognizePattern(input);
        if (pattern.found && pattern.confidence > 0.5) {
            return pattern.pattern.output;
        }
        
        return null;
    }
    
    getNeuralContext(input) {
        if (!this.neural) return null;
        
        const context = this.neural.getContextEmbedding(input);
        if (context.score > 0.1) {
            return `[Context: ${context.category}] ${input}`;
        }
        
        return null;
    }
    
    // ==================== FORMATTERS ====================
    
    formatWeather(weather) {
        return `🌤️ আজকের আবহাওয়া (${weather.city}):

🌡️ তাপমাত্রা: ${weather.temp_C}°C (${weather.temp_F}°F)
💧 আর্দ্রতা: ${weather.humidity}%
💨 বাতাস: ${weather.wind}
🌡️ অনুভূত: ${weather.feelsLike}
☁️ অবস্থা: ${weather.condition}

-- সময়: ${new Date().toLocaleString('bn-BD')}`;
    }
    
    formatNews(news) {
        if (!news || news.length === 0) return 'আজকের খবর পাওয়া যায়নি।';
        
        let response = '📰 আজকের সংবাদ:\n\n';
        
        news.slice(0, 5).forEach((item, i) => {
            response += `${i + 1}. ${item.title}\n`;
        });
        
        response += '\n-- সময়: ' + new Date().toLocaleString('bn-BD');
        
        return response;
    }
    
    formatCrypto(crypto) {
        if (!crypto) return 'ক্রিপ্টো তথ্য পাওয়া যায়নি।';
        
        const btc = crypto.bitcoin;
        const eth = crypto.ethereum;
        
        return `₿ ক্রিপ্টো মার্কেট:\n\n` +
            `🟠 Bitcoin (BTC): $${btc.price?.toLocaleString()}\n` +
            `   ২৪ঘণ্টা পরিবর্তন: ${btc.change24h > 0 ? '📈' : '📉'} ${btc.change24h}%\n\n` +
            `🔷 Ethereum (ETH): $${eth.price?.toLocaleString()}\n` +
            `   ২৪ঘণ্টা পরিবর্তন: ${eth.change24h > 0 ? '📈' : '📉'} ${eth.change24h}%\n\n` +
            `-- আপডেট: ${new Date().toLocaleString('bn-BD')}`;
    }
    
    getFallback(input) {
        const lower = input.toLowerCase();
        
        // Greetings
        if (this.contains(lower, ['হ্যালো', 'হাই', 'আসসালাম', 'hello', 'hi'])) {
            return 'হ্যালো! আমি নেক্সাস। কিভাবে সাহায্য করতে পারি? 🤖';
        }
        
        // Time
        if (this.contains(lower, ['সময়', 'time', 'কতটা', 'কয়টা'])) {
            return `এখন সময়: ${new Date().toLocaleTimeString('bn-BD')}`;
        }
        
        // Date
        if (this.contains(lower, ['তারিখ', 'date', 'দিন', 'কোন দিন'])) {
            return `আজ: ${new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
        
        // Help
        if (this.contains(lower, ['হেল্প', 'সাহায্য', 'help', 'কি কর'])) {
            return `🤖 আমি নেক্সাস, আমি করতে পারি:\n\n` +
                `🌤️ আবহাওয়া জানাতে\n` +
                `📰 সংবাদ দেখাতে\n` +
                `₿ ক্রিপ্টো দাম বলতে\n` +
                `📚 যেকোনো বিষয়ে জানাতে\n` +
                `💻 কোডিং সাহায্য করতে\n` +
                `📝 লেখায় সাহায্য করতে\n\n` +
                `বলুন আপনি কি জানতে চান!`;
        }
        
        return 'আমি বুঝতে পেরেছি। আপনি কি জানতে চান? বলুন! 😊';
    }
    
    // ==================== CACHE ====================
    
    cacheResponse(input, response) {
        this.responseCache.set(input, {
            response,
            time: Date.now()
        });
        
        // Limit cache size
        if (this.responseCache.size > this.maxCacheSize) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }
    
    clearCache() {
        this.responseCache.clear();
        this.cache?.clear();
        console.log('[NEXUS Brain] 🗑️ All caches cleared');
    }
    
    // ==================== STATUS ====================
    
    getStatus() {
        return {
            ready: this.ready,
            stats: this.stats,
            cache: this.cache?.getStats(),
            search: this.search?.getStats(),
            autoUpdate: this.autoUpdate?.getStatus(),
            memoryUsage: this.responseCache.size
        };
    }
}

// Export
window.NEXUSBrain = NEXUSBrain;
window.nexusBrain = new NEXUSBrain();

console.log('[NEXUS] 🧠 Brain System Created - Light & Fast!');
