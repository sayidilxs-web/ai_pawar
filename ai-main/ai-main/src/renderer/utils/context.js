/**
 * NEXUS AI - Context Manager
 * কনটেক্সট ম্যানেজার
 */

class ContextManager {
    constructor() {
        this.context = {
            screen: null,
            lastAction: null,
            recentCommands: [],
            userInfo: {},
            systemState: {}
        };
        this.maxHistory = 10;
    }
    
    set(key, value) {
        this.context[key] = value;
    }
    
    get(key) {
        return this.context[key];
    }
    
    setScreen(description) {
        this.context.screen = {
            description,
            timestamp: Date.now()
        };
    }
    
    setLastAction(action) {
        this.context.lastAction = {
            ...action,
            timestamp: Date.now()
        };
        
        this.context.recentCommands.unshift(action);
        
        if (this.context.recentCommands.length > this.maxHistory) {
            this.context.recentCommands.pop();
        }
    }
    
    setUserInfo(info) {
        this.context.userInfo = {
            ...this.context.userInfo,
            ...info
        };
    }
    
    setSystemState(state) {
        this.context.systemState = {
            ...this.context.systemState,
            ...state,
            timestamp: Date.now()
        };
    }
    
    getContextString() {
        const parts = [];
        
        if (this.context.screen) {
            parts.push(`স্ক্রিন: ${this.context.screen.description}`);
        }
        
        if (this.context.lastAction) {
            parts.push(`সাম্প্রতিক অ্যাকশন: ${this.context.lastAction.type}`);
        }
        
        if (this.context.recentCommands.length > 0) {
            const commands = this.context.recentCommands
                .slice(0, 3)
                .map(c => c.type)
                .join(', ');
            parts.push(`ইতিহাস: ${commands}`);
        }
        
        return parts.join('\n');
    }
    
    clear() {
        this.context = {
            screen: null,
            lastAction: null,
            recentCommands: [],
            userInfo: {},
            systemState: {}
        };
    }
    
    export() {
        return { ...this.context };
    }
    
    import(data) {
        this.context = { ...this.context, ...data };
    }
}

// Export
window.contextManager = new ContextManager();