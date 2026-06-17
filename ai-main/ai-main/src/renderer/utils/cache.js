/**
 * NEXUS AI - Cache Manager
 * ক্যাশ ম্যানেজার
 */

class CacheManager {
    constructor(options = {}) {
        this.prefix = options.prefix || 'nexus_cache_';
        this.defaultTTL = options.ttl || 3600000; // 1 hour default
        this.maxSize = options.maxSize || 50;
    }
    
    set(key, value, ttl = this.defaultTTL) {
        const fullKey = this.prefix + key;
        const item = {
            value,
            expiry: Date.now() + ttl
        };
        
        try {
            localStorage.setItem(fullKey, JSON.stringify(item));
            this.cleanup();
            return true;
        } catch (error) {
            console.error('[Cache] Set error:', error);
            this.cleanup();
            try {
                localStorage.setItem(fullKey, JSON.stringify(item));
                return true;
            } catch {
                return false;
            }
        }
    }
    
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;
        
        try {
            const item = JSON.parse(localStorage.getItem(fullKey));
            
            if (!item) return defaultValue;
            
            // Check expiry
            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key);
                return defaultValue;
            }
            
            return item.value;
        } catch (error) {
            console.error('[Cache] Get error:', error);
            return defaultValue;
        }
    }
    
    has(key) {
        const value = this.get(key);
        return value !== null;
    }
    
    remove(key) {
        const fullKey = this.prefix + key;
        localStorage.removeItem(fullKey);
    }
    
    clear() {
        const keys = this.keys();
        keys.forEach(key => this.remove(key));
    }
    
    keys() {
        const result = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                result.push(key.substring(this.prefix.length));
            }
        }
        
        return result;
    }
    
    cleanup() {
        const keys = this.keys();
        
        if (keys.length > this.maxSize) {
            // Remove oldest items
            const toRemove = keys.slice(0, keys.length - this.maxSize);
            toRemove.forEach(key => this.remove(key));
        }
        
        // Remove expired items
        keys.forEach(key => {
            const fullKey = this.prefix + key;
            try {
                const item = JSON.parse(localStorage.getItem(fullKey));
                if (item && item.expiry && Date.now() > item.expiry) {
                    this.remove(key);
                }
            } catch {
                // Invalid item, remove it
                this.remove(key);
            }
        });
    }
    
    size() {
        return this.keys().length;
    }
}

// Export
window.cacheManager = new CacheManager();