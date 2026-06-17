/**
 * NEXUS AI - Event Bus
 * ইভেন্ট বাস
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }
    
    on(event, callback, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const handler = context ? callback.bind(context) : callback;
        this.events.get(event).push(handler);
        
        return () => this.off(event, handler);
    }
    
    once(event, callback, context = null) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        
        const handler = context ? callback.bind(context) : callback;
        this.onceEvents.get(event).push(handler);
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    emit(event, ...args) {
        // Regular handlers
        if (this.events.has(event)) {
            this.events.get(event).forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error('[EventBus] Handler error:', error);
                }
            });
        }
        
        // Once handlers
        if (this.onceEvents.has(event)) {
            this.onceEvents.get(event).forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error('[EventBus] Once handler error:', error);
                }
            });
            this.onceEvents.set(event, []);
        }
    }
    
    clear(event = null) {
        if (event) {
            this.events.delete(event);
            this.onceEvents.delete(event);
        } else {
            this.events.clear();
            this.onceEvents.clear();
        }
    }
    
    listenerCount(event) {
        const regular = this.events.get(event)?.length || 0;
        const once = this.onceEvents.get(event)?.length || 0;
        return regular + once;
    }
}

// Create global event bus
window.eventBus = new EventBus();

// Add convenience methods
window.Events = {
    // Voice events
    VOICE_START: 'voice:start',
    VOICE_END: 'voice:end',
    VOICE_RESULT: 'voice:result',
    VOICE_ERROR: 'voice:error',
    
    // AI events
    AI_REQUEST: 'ai:request',
    AI_RESPONSE: 'ai:response',
    AI_ERROR: 'ai:error',
    
    // UI events
    UI_READY: 'ui:ready',
    UI_CLICK: 'ui:click',
    ORB_CLICK: 'orb:click',
    
    // System events
    SYSTEM_READY: 'system:ready',
    SYSTEM_ERROR: 'system:error'
};