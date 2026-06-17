/**
 * NEXUS AI - Conversation History
 * কথোপকথন ইতিহাস
 */

class ConversationHistory {
    constructor() {
        this.history = [];
        this.maxEntries = 100;
        this.storageKey = 'nexusConversationHistory';
        this.load();
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.error('[History] Load error:', error);
            this.history = [];
        }
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('[History] Save error:', error);
        }
    }
    
    add(role, content, metadata = {}) {
        const entry = {
            id: this.generateId(),
            role, // 'user' or 'ai'
            content,
            timestamp: Date.now(),
            metadata
        };
        
        this.history.push(entry);
        
        // Trim if too long
        if (this.history.length > this.maxEntries) {
            this.history = this.history.slice(-this.maxEntries);
        }
        
        this.save();
        return entry;
    }
    
    getAll() {
        return this.history;
    }
    
    getRecent(count = 10) {
        return this.history.slice(-count);
    }
    
    getByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return this.history.filter(entry => {
            return entry.timestamp >= startOfDay.getTime() && 
                   entry.timestamp <= endOfDay.getTime();
        });
    }
    
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.history.filter(entry => 
            entry.content.toLowerCase().includes(lowerQuery)
        );
    }
    
    clear() {
        this.history = [];
        this.save();
    }
    
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.history, null, 2);
        } else if (format === 'text') {
            return this.history.map(entry => {
                const time = new Date(entry.timestamp).toLocaleString('bn-BD');
                const role = entry.role === 'user' ? '👤' : '🤖';
                return `[${time}] ${role} ${entry.content}`;
            }).join('\n');
        }
        return '';
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getStats() {
        return {
            totalEntries: this.history.length,
            userMessages: this.history.filter(e => e.role === 'user').length,
            aiResponses: this.history.filter(e => e.role === 'ai').length,
            firstEntry: this.history.length > 0 ? 
                new Date(this.history[0].timestamp) : null,
            lastEntry: this.history.length > 0 ? 
                new Date(this.history[this.history.length - 1].timestamp) : null
        };
    }
}

// Export
window.conversationHistory = new ConversationHistory();