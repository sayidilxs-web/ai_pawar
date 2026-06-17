/**
 * NEXUS AI - Session Manager
 * সেশন ম্যানেজার
 */

class SessionManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.data = {};
        this.listeners = new Map();
    }
    
    generateSessionId() {
        return 'sess_' + Date.now().toString(36) + '_' + 
               Math.random().toString(36).substr(2, 9);
    }
    
    set(key, value) {
        this.data[key] = value;
        this.notify('change', { key, value });
    }
    
    get(key, defaultValue = null) {
        return this.data[key] ?? defaultValue;
    }
    
    remove(key) {
        delete this.data[key];
        this.notify('change', { key, value: null });
    }
    
    clear() {
        this.data = {};
        this.notify('clear', {});
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    notify(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('[Session] Listener error:', error);
                }
            });
        }
    }
    
    getDuration() {
        return Date.now() - this.startTime;
    }
    
    getInfo() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            duration: this.getDuration(),
            dataKeys: Object.keys(this.data)
        };
    }
    
    export() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            data: this.data
        };
    }
}

// Export
window.sessionManager = new SessionManager();