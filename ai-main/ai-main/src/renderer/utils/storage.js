/**
 * NEXUS AI - Storage Manager
 * স্টোরেজ ম্যানেজার
 */

class StorageManager {
    constructor(prefix = 'nexus_') {
        this.prefix = prefix;
        this.memory = new Map();
    }
    
    getKey(key) {
        return this.prefix + key;
    }
    
    set(key, value) {
        const fullKey = this.getKey(key);
        
        try {
            // Try localStorage first
            const serialized = JSON.stringify(value);
            localStorage.setItem(fullKey, serialized);
            this.memory.set(key, value);
            return true;
        } catch (error) {
            console.error('[Storage] Set error:', error);
            
            // Fallback to memory only
            this.memory.set(key, value);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        const fullKey = this.getKey(key);
        
        // Check memory first
        if (this.memory.has(key)) {
            return this.memory.get(key);
        }
        
        try {
            const value = localStorage.getItem(fullKey);
            if (value !== null) {
                const parsed = JSON.parse(value);
                this.memory.set(key, parsed);
                return parsed;
            }
        } catch (error) {
            console.error('[Storage] Get error:', error);
        }
        
        return defaultValue;
    }
    
    has(key) {
        if (this.memory.has(key)) return true;
        
        const fullKey = this.getKey(key);
        return localStorage.getItem(fullKey) !== null;
    }
    
    remove(key) {
        const fullKey = this.getKey(key);
        this.memory.delete(key);
        
        try {
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error('[Storage] Remove error:', error);
        }
    }
    
    clear() {
        this.memory.clear();
        
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keys.push(key);
                }
            }
            
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('[Storage] Clear error:', error);
        }
    }
    
    keys() {
        const allKeys = new Set(this.memory.keys());
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    allKeys.add(key.substring(this.prefix.length));
                }
            }
        } catch (error) {
            console.error('[Storage] Keys error:', error);
        }
        
        return Array.from(allKeys);
    }
    
    size() {
        return this.keys().length;
    }
}

// Export
window.storageManager = new StorageManager();