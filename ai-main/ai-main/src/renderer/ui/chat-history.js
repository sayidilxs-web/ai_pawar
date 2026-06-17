/**
 * NEXUS Chat History Module
 * Conversation storage and management
 */

class ChatHistory {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'nexus_chat_history';
        this.maxConversations = options.maxConversations || 100;
        this.maxMessagesPerConversation = options.maxMessagesPerConversation || 1000;
        this.conversations = new Map();
        this.currentConversationId = null;
        this.listeners = new Map();
        
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                for (const conv of parsed.conversations || []) {
                    conv.createdAt = new Date(conv.createdAt);
                    conv.updatedAt = new Date(conv.updatedAt);
                    for (const msg of conv.messages || []) {
                        msg.timestamp = new Date(msg.timestamp);
                    }
                    this.conversations.set(conv.id, conv);
                }
                this.currentConversationId = parsed.currentConversationId;
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    save() {
        try {
            const data = {
                conversations: Array.from(this.conversations.values()),
                currentConversationId: this.currentConversationId
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    createConversation(title = null, metadata = {}) {
        const id = this.generateId();
        const now = new Date();
        
        const conversation = {
            id,
            title: title || `Conversation ${this.conversations.size + 1}`,
            messages: [],
            metadata,
            createdAt: now,
            updatedAt: now,
            messageCount: 0
        };

        this.conversations.set(id, conversation);
        this.currentConversationId = id;
        
        this.pruneOldConversations();
        this.save();
        this.emit('conversationCreated', conversation);

        return conversation;
    }

    deleteConversation(id) {
        if (!this.conversations.has(id)) {
            return { success: false, error: 'Conversation not found' };
        }

        const conversation = this.conversations.get(id);
        this.conversations.delete(id);

        if (this.currentConversationId === id) {
            const remaining = Array.from(this.conversations.keys());
            this.currentConversationId = remaining[remaining.length - 1] || null;
        }

        this.save();
        this.emit('conversationDeleted', { id, title: conversation.title });

        return { success: true };
    }

    addMessage(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return { success: false, error: 'Conversation not found' };
        }

        const msg = {
            id: this.generateId(),
            role: message.role || 'user',
            content: message.content,
            attachments: message.attachments || [],
            metadata: message.metadata || {},
            timestamp: new Date()
        };

        conversation.messages.push(msg);
        conversation.messageCount++;
        conversation.updatedAt = new Date();

        this.pruneMessages(conversation);
        this.save();
        this.emit('messageAdded', { conversationId, message: msg });

        return { success: true, message: msg };
    }

    updateMessage(conversationId, messageId, updates) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return { success: false, error: 'Conversation not found' };
        }

        const message = conversation.messages.find(m => m.id === messageId);
        if (!message) {
            return { success: false, error: 'Message not found' };
        }

        Object.assign(message, updates, { editedAt: new Date() });
        conversation.updatedAt = new Date();
        this.save();
        this.emit('messageUpdated', { conversationId, messageId, updates });

        return { success: true, message };
    }

    deleteMessage(conversationId, messageId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return { success: false, error: 'Conversation not found' };
        }

        const index = conversation.messages.findIndex(m => m.id === messageId);
        if (index === -1) {
            return { success: false, error: 'Message not found' };
        }

        const message = conversation.messages.splice(index, 1)[0];
        conversation.messageCount--;
        conversation.updatedAt = new Date();
        this.save();
        this.emit('messageDeleted', { conversationId, messageId });

        return { success: true, message };
    }

    setCurrentConversation(id) {
        if (id && !this.conversations.has(id)) {
            return { success: false, error: 'Conversation not found' };
        }

        this.currentConversationId = id;
        this.save();
        this.emit('currentConversationChanged', { id });

        return { success: true };
    }

    getConversation(id) {
        return this.conversations.get(id);
    }

    getCurrentConversation() {
        return this.conversations.get(this.currentConversationId);
    }

    getAllConversations(options = {}) {
        let convs = Array.from(this.conversations.values());

        if (options.sortBy === 'updated') {
            convs.sort((a, b) => b.updatedAt - a.updatedAt);
        } else if (options.sortBy === 'created') {
            convs.sort((a, b) => b.createdAt - a.createdAt);
        }

        if (options.search) {
            const query = options.search.toLowerCase();
            convs = convs.filter(c => 
                c.title.toLowerCase().includes(query) ||
                c.messages.some(m => m.content.toLowerCase().includes(query))
            );
        }

        if (options.limit) {
            convs = convs.slice(0, options.limit);
        }

        return convs.map(c => ({
            id: c.id,
            title: c.title,
            messageCount: c.messageCount,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            preview: c.messages[c.messages.length - 1]?.content?.substring(0, 100) || ''
        }));
    }

    getMessages(conversationId, options = {}) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            return [];
        }

        let messages = [...conversation.messages];

        if (options.role) {
            messages = messages.filter(m => m.role === options.role);
        }

        if (options.fromDate) {
            const from = new Date(options.fromDate);
            messages = messages.filter(m => m.timestamp >= from);
        }

        if (options.toDate) {
            const to = new Date(options.toDate);
            messages = messages.filter(m => m.timestamp <= to);
        }

        if (options.search) {
            const query = options.search.toLowerCase();
            messages = messages.filter(m => m.content.toLowerCase().includes(query));
        }

        if (options.limit) {
            messages = messages.slice(-options.limit);
        }

        return messages;
    }

    search(query, options = {}) {
        const results = [];
        const q = query.toLowerCase();

        for (const conversation of this.conversations.values()) {
            const matches = [];

            if (conversation.title.toLowerCase().includes(q)) {
                matches.push({
                    type: 'title',
                    conversationId: conversation.id,
                    title: conversation.title,
                    content: conversation.title
                });
            }

            for (const message of conversation.messages) {
                if (message.content.toLowerCase().includes(q)) {
                    matches.push({
                        type: 'message',
                        conversationId: conversation.id,
                        messageId: message.id,
                        title: conversation.title,
                        content: message.content,
                        timestamp: message.timestamp,
                        role: message.role
                    });
                }
            }

            if (matches.length > 0) {
                results.push(...matches);
            }
        }

        if (options.limit) {
            return results.slice(0, options.limit);
        }

        return results;
    }

    exportConversation(id, format = 'json') {
        const conversation = this.conversations.get(id);
        if (!conversation) {
            return { success: false, error: 'Conversation not found' };
        }

        if (format === 'json') {
            return {
                success: true,
                data: JSON.stringify(conversation, null, 2),
                filename: `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json`
            };
        }

        if (format === 'markdown') {
            let md = `# ${conversation.title}\n\n`;
            md += `Created: ${conversation.createdAt.toISOString()}\n\n`;
            md += `---\n\n`;

            for (const msg of conversation.messages) {
                const role = msg.role === 'assistant' ? '🤖' : '👤';
                md += `## ${role} ${msg.role}\n\n`;
                md += `${msg.content}\n\n`;
                md += `*${msg.timestamp.toISOString()}*\n\n`;
                md += `---\n\n`;
            }

            return {
                success: true,
                data: md,
                filename: `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.md`
            };
        }

        return { success: false, error: 'Unsupported format' };
    }

    importConversation(data, format = 'json') {
        try {
            let conversation;

            if (format === 'json') {
                conversation = JSON.parse(data);
                conversation.id = this.generateId();
                conversation.createdAt = new Date(conversation.createdAt);
                conversation.updatedAt = new Date();
                for (const msg of conversation.messages || []) {
                    msg.timestamp = new Date(msg.timestamp);
                }
            } else {
                return { success: false, error: 'Unsupported format' };
            }

            this.conversations.set(conversation.id, conversation);
            this.pruneOldConversations();
            this.save();
            this.emit('conversationImported', conversation);

            return { success: true, conversation };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    clearAll() {
        this.conversations.clear();
        this.currentConversationId = null;
        this.save();
        this.emit('allCleared');
    }

    pruneOldConversations() {
        if (this.conversations.size <= this.maxConversations) return;

        const sorted = Array.from(this.conversations.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);

        const toDelete = sorted.slice(this.maxConversations);
        for (const conv of toDelete) {
            this.conversations.delete(conv.id);
        }
    }

    pruneMessages(conversation) {
        if (conversation.messages.length <= this.maxMessagesPerConversation) return;

        conversation.messages = conversation.messages.slice(-this.maxMessagesPerConversation);
    }

    generateId() {
        return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(data);
            }
        }
    }

    getStats() {
        let totalMessages = 0;
        let userMessages = 0;
        let assistantMessages = 0;

        for (const conv of this.conversations.values()) {
            totalMessages += conv.messages.length;
            for (const msg of conv.messages) {
                if (msg.role === 'user') userMessages++;
                else if (msg.role === 'assistant') assistantMessages++;
            }
        }

        return {
            conversations: this.conversations.size,
            totalMessages,
            userMessages,
            assistantMessages,
            avgMessagesPerConversation: this.conversations.size > 0 
                ? (totalMessages / this.conversations.size).toFixed(1) 
                : 0
        };
    }
}

export { ChatHistory };