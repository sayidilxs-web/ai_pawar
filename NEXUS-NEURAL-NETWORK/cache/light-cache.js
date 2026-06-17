/**
 * NEXUS AI - Light Cache System
 * ⚡ চোখের পলকে ডেটা - No Heavy Models
 * সরাসরি ডাটা দিয়ে কাজ করে, কোনো API কল ছাড়া
 */

class NEXUSLightCache {
    constructor() {
        // Memory Cache - ইনস্ট্যান্ট অ্যাক্সেস
        this.memoryCache = new Map();
        this.maxMemoryItems = 1000;
        
        // Cache expiry time (ms)
        this.defaultTTL = 1000 * 60 * 60; // 1 ঘণ্টা
        
        // Storage
        this.storageKey = 'nexus_light_cache';
        
        // Stats
        this.stats = {
            hits: 0,
            misses: 0,
            saves: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        console.log('[NEXUS Cache] ⚡ Light Cache চালু');
    }
    
    // ==================== BASIC CACHE ====================
    
    // সেট করা
    set(key, value, ttl = this.defaultTTL) {
        const item = {
            value: value,
            expiry: Date.now() + ttl,
            created: Date.now()
        };
        
        this.memoryCache.set(key, item);
        this.stats.saves++;
        
        // Storage এ সেভ
        this.saveToStorage();
        
        return true;
    }
    
    // পাওয়া
    get(key) {
        const item = this.memoryCache.get(key);
        
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        // যদি মেয়াদ শেষ হয়ে গিয়ে থাকে
        if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            this.stats.misses++;
            return null;
        }
        
        this.stats.hits++;
        return item.value;
    }
    
    // আছে কিনা চেক
    has(key) {
        return this.get(key) !== null;
    }
    
    // ডিলিট
    delete(key) {
        return this.memoryCache.delete(key);
    }
    
    // সব ক্লিয়ার
    clear() {
        this.memoryCache.clear();
        localStorage.removeItem(this.storageKey);
        console.log('[NEXUS Cache] 🗑️ Cache ক্লিয়ার');
    }
    
    // ==================== SMART CACHE ====================
    
    // সার্চ করা (ফাস্ট)
    search(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [key, item] of this.memoryCache) {
            if (Date.now() > item.expiry) continue;
            
            // Key match
            if (key.toLowerCase().includes(queryLower)) {
                results.push({ key, value: item.value, match: 'key' });
                continue;
            }
            
            // Value match
            if (typeof item.value === 'string' && item.value.toLowerCase().includes(queryLower)) {
                results.push({ key, value: item.value, match: 'value' });
            }
        }
        
        return results.sort((a, b) => a.key.length - b.key.length);
    }
    
    // ট্যাগ দিয়ে সেভ
    setTagged(tag, key, value) {
        return this.set(`tag:${tag}:${key}`, value);
    }
    
    // ট্যাগ দিয়ে পাওয়া
    getTagged(tag, key) {
        return this.get(`tag:${tag}:${key}`);
    }
    
    // ট্যাগ দিয়ে সব পাওয়া
    getAllByTag(tag) {
        const results = [];
        const prefix = `tag:${tag}:`;
        
        for (const [key, item] of this.memoryCache) {
            if (key.startsWith(prefix) && Date.now() <= item.expiry) {
                const realKey = key.replace(prefix, '');
                results.push({ key: realKey, value: item.value });
            }
        }
        
        return results;
    }
    
    // ==================== STORAGE ====================
    
    saveToStorage() {
        try {
            const data = {};
            
            for (const [key, item] of this.memoryCache) {
                if (Date.now() <= item.expiry) {
                    data[key] = item;
                }
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('[NEXUS Cache] Storage save failed:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                for (const [key, item] of Object.entries(data)) {
                    if (Date.now() <= item.expiry) {
                        this.memoryCache.set(key, item);
                    }
                }
                console.log(`[NEXUS Cache] 📦 ${this.memoryCache.size} আইটেম লোড হয়েছে`);
            }
        } catch (e) {
            console.warn('[NEXUS Cache] Storage load failed:', e);
        }
    }
    
    // ==================== STATS ====================
    
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
        
        return {
            ...this.stats,
            hitRate: hitRate + '%',
            itemsInMemory: this.memoryCache.size,
            storageUsed: JSON.stringify(Array.from(this.memoryCache.entries())).length
        };
    }
}

// ==================== PRELOADED DATA CACHE ====================

class NEXUSPreloadedCache {
    constructor() {
        this.data = {};
        this.loaded = false;
    }
    
    // প্রি-লোড করা
    preload(dataMap) {
        this.data = { ...this.data, ...dataMap };
        this.loaded = true;
        console.log(`[NEXUS Preload] ✅ ${Object.keys(this.data).length} প্রি-লোডেড আইটেম`);
    }
    
    // ইনস্ট্যান্ট গেট
    instant(key) {
        return this.data[key] || null;
    }
    
    // সব কী পাওয়া
    keys() {
        return Object.keys(this.data);
    }
    
    // সার্চ
    search(query) {
        const results = [];
        const q = query.toLowerCase();
        
        for (const [key, value] of Object.entries(this.data)) {
            if (key.toLowerCase().includes(q) || 
                (typeof value === 'string' && value.toLowerCase().includes(q))) {
                results.push({ key, value });
            }
        }
        
        return results;
    }
}

// Export
window.NEXUSLightCache = NEXUSLightCache;
window.NEXUSPreloadedCache = NEXUSPreloadedCache;
window.nexusCache = new NEXUSLightCache();
window.nexusPreload = new NEXUSPreloadedCache();

console.log('[NEXUS] ⚡ Light Cache System Ready!');
