/**
 * NEXUS AI - State Manager
 * স্টেট ম্যানেজার
 */

class StateManager {
    constructor() {
        this.state = {
            app: {
                initialized: false,
                ready: false
            },
            voice: {
                listening: false,
                speaking: false,
                language: 'bn-BD'
            },
            ai: {
                processing: false,
                apiKey: null,
                model: 'gemini-2.0-flash'
            },
            ui: {
                theme: 'cyber',
                orbActive: false,
                modalOpen: null
            },
            system: {
                online: true,
                cameraEnabled: false,
                screenCaptureEnabled: false
            }
        };
        
        this.listeners = new Map();
        this.prevState = this.cloneState();
    }
    
    cloneState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    get(path) {
        const keys = path.split('.');
        let value = this.state;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    set(path, value) {
        const keys = path.split('.');
        let obj = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in obj)) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = obj[lastKey];
        obj[lastKey] = value;
        
        // Notify listeners
        this.notify(path, value, oldValue);
        
        // Track changes
        this.prevState = this.cloneState();
    }
    
    update(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.set(path, value);
        }
    }
    
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
    
    notify(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error('[State] Listener error:', error);
                }
            });
        }
        
        // Wildcard listeners
        const wildcardPath = path.split('.')[0] + '.*';
        if (this.listeners.has(wildcardPath)) {
            this.listeners.get(wildcardPath).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('[State] Wildcard listener error:', error);
                }
            });
        }
    }
    
    getState() {
        return this.cloneState();
    }
    
    reset() {
        this.state = this.cloneState();
        this.prevState = this.cloneState();
    }
}

// Export
window.stateManager = new StateManager();