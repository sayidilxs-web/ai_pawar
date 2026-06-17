/**
 * NEXUS AI - Auto Update System
 * ⚡ স্বয়ংক্রিয় আপডেট - চোখের পলকে
 * প্রতিদিন হাজার হাজার তথ্য নিজে ঢুকিয়ে নেবে
 */

class NEXUSAutoUpdate {
    constructor() {
        // Update intervals
        this.intervals = {
            news: 1000 * 60 * 10,      // ১০ মিনিট
            weather: 1000 * 60 * 30,    // ৩০ মিনিট
            crypto: 1000 * 60 * 5,      // ৫ মিনিট
            facts: 1000 * 60 * 60,      // ১ ঘণ্টা
            full: 1000 * 60 * 60 * 24   // ২৪ ঘণ্টা
        };
        
        // Active timers
        this.timers = {};
        
        // Status
        this.status = {
            running: false,
            lastUpdate: null,
            updatesCount: 0
        };
        
        // Callbacks
        this.callbacks = {
            onUpdate: [],
            onError: []
        };
        
        console.log('[NEXUS AutoUpdate] 🔄 Auto Update System চালু');
    }
    
    // ==================== START/STOP ====================
    
    start() {
        if (this.status.running) {
            console.log('[NEXUS AutoUpdate] ⚠️ Already running');
            return;
        }
        
        console.log('[NEXUS AutoUpdate] 🚀 Starting auto updates...');
        this.status.running = true;
        
        // Initial load
        this.updateAll();
        
        // Start intervals
        this.startIntervals();
        
        console.log('[NEXUS AutoUpdate] ✅ Auto updates started');
    }
    
    stop() {
        console.log('[NEXUS AutoUpdate] ⏹️ Stopping auto updates...');
        
        for (const key in this.timers) {
            clearInterval(this.timers[key]);
        }
        
        this.timers = {};
        this.status.running = false;
        
        console.log('[NEXUS AutoUpdate] ⏹️ Auto updates stopped');
    }
    
    // ==================== INTERVALS ====================
    
    startIntervals() {
        // News update every 10 minutes
        this.timers.news = setInterval(() => {
            this.updateNews();
        }, this.intervals.news);
        
        // Weather update every 30 minutes
        this.timers.weather = setInterval(() => {
            this.updateWeather();
        }, this.intervals.weather);
        
        // Crypto update every 5 minutes
        this.timers.crypto = setInterval(() => {
            this.updateCrypto();
        }, this.intervals.crypto);
        
        // Random facts every hour
        this.timers.facts = setInterval(() => {
            this.updateFacts();
        }, this.intervals.facts);
        
        // Full update every 24 hours
        this.timers.full = setInterval(() => {
            this.updateAll();
        }, this.intervals.full);
    }
    
    // ==================== UPDATE FUNCTIONS ====================
    
    async updateAll() {
        console.log('[NEXUS AutoUpdate] 📥 Updating all data...');
        
        const startTime = Date.now();
        
        try {
            await Promise.all([
                this.updateNews(),
                this.updateWeather(),
                this.updateCrypto(),
                this.updateFacts(),
                this.updateKnowledge()
            ]);
            
            this.status.lastUpdate = Date.now();
            this.status.updatesCount++;
            
            const timeTaken = Date.now() - startTime;
            console.log(`[NEXUS AutoUpdate] ✅ All updated in ${timeTaken}ms`);
            
            this.emit('onUpdate', { 
                type: 'all', 
                timeTaken,
                count: this.status.updatesCount 
            });
            
        } catch (e) {
            console.error('[NEXUS AutoUpdate] ❌ Update failed:', e);
            this.emit('onError', { type: 'all', error: e });
        }
    }
    
    async updateNews() {
        try {
            if (window.nexusScraper) {
                const news = await window.nexusScraper.getNews();
                console.log(`[NEXUS AutoUpdate] 📰 ${news.length} news updated`);
                return news;
            }
        } catch (e) {
            console.error('[NEXUS AutoUpdate] News update failed:', e);
        }
        return [];
    }
    
    async updateWeather() {
        try {
            if (window.nexusScraper) {
                const weather = await window.nexusScraper.getWeather();
                console.log(`[NEXUS AutoUpdate] 🌤️ Weather updated:`, weather?.temp_C + '°C');
                return weather;
            }
        } catch (e) {
            console.error('[NEXUS AutoUpdate] Weather update failed:', e);
        }
        return null;
    }
    
    async updateCrypto() {
        try {
            if (window.nexusScraper) {
                const crypto = await window.nexusScraper.getCrypto();
                console.log(`[NEXUS AutoUpdate] ₿ Crypto updated: BTC $${crypto?.bitcoin?.price}`);
                return crypto;
            }
        } catch (e) {
            console.error('[NEXUS AutoUpdate] Crypto update failed:', e);
        }
        return null;
    }
    
    async updateFacts() {
        try {
            if (window.nexusScraper) {
                const fact = await window.nexusScraper.getRandomFact();
                console.log(`[NEXUS AutoUpdate] 💡 Fact updated`);
                return fact;
            }
        } catch (e) {
            console.error('[NEXUS AutoUpdate] Facts update failed:', e);
        }
        return null;
    }
    
    async updateKnowledge() {
        // Knowledge Base refresh
        try {
            if (window.nexusKnowledge) {
                await window.nexusKnowledge.loadKnowledge();
                console.log('[NEXUS AutoUpdate] 🧠 Knowledge Base refreshed');
            }
        } catch (e) {
            console.error('[NEXUS AutoUpdate] Knowledge update failed:', e);
        }
    }
    
    // ==================== QUICK ANSWER ====================
    
    async getAnswer(query) {
        const q = query.toLowerCase();
        
        // Check cached data first
        if (q.includes('আবহাওয়া') || q.includes('weather')) {
            const cached = window.nexusCache?.getTagged('weather', 'Dhaka');
            if (cached) return cached;
            return await window.nexusScraper?.getWeather();
        }
        
        if (q.includes('নিউজ') || q.includes('খবর') || q.includes('news')) {
            const cached = window.nexusCache?.getTagged('news', 'bd');
            if (cached && cached.length > 0) return cached;
            return await window.nexusScraper?.getNews();
        }
        
        if (q.includes('বিটকয়েন') || q.includes('crypto')) {
            const cached = window.nexusCache?.getTagged('crypto', 'prices');
            if (cached) return cached;
            return await window.nexusScraper?.getCrypto();
        }
        
        // Fallback to scraper
        if (window.nexusScraper) {
            return await window.nexusScraper.quickAnswer(query);
        }
        
        return null;
    }
    
    // ==================== EVENTS ====================
    
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    emit(event, data) {
        if (this.callbacks[event]) {
            for (const callback of this.callbacks[event]) {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[NEXUS AutoUpdate] Callback error:', e);
                }
            }
        }
    }
    
    // ==================== STATUS ====================
    
    getStatus() {
        return {
            ...this.status,
            timers: Object.keys(this.timers).length,
            intervals: {
                news: this.intervals.news / 1000 / 60 + ' min',
                weather: this.intervals.weather / 1000 / 60 + ' min',
                crypto: this.intervals.crypto / 1000 / 60 + ' min',
                facts: this.intervals.facts / 1000 / 60 / 60 + ' hr',
                full: this.intervals.full / 1000 / 60 / 60 + ' hr'
            }
        };
    }
}

// Export
window.NEXUSAutoUpdate = NEXUSAutoUpdate;
window.nexusAutoUpdate = new NEXUSAutoUpdate();

console.log('[NEXUS] 🔄 Auto Update System Ready!');
