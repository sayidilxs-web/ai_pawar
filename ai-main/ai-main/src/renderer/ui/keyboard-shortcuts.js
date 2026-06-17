/**
 * NEXUS Keyboard Shortcuts Module
 * Keyboard shortcut management
 */

class KeyboardShortcuts {
    constructor(options = {}) {
        this.shortcuts = new Map();
        this.enabled = true;
        this.preventDefault = options.preventDefault !== false;
        this.listeners = new Map();
        
        this.init();
        this.registerDefaultShortcuts();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        if (!this.enabled) return;

        const shortcut = this.getShortcutFromEvent(event);
        const handler = this.shortcuts.get(shortcut);
        
        if (handler) {
            if (this.preventDefault) {
                event.preventDefault();
            }
            
            const result = handler.callback(event, handler.data);
            
            this.emit('execute', {
                shortcut,
                name: handler.name,
                event
            });

            return result;
        }
    }

    handleKeyUp(event) {
        this.emit('keyup', {
            shortcut: this.getShortcutFromEvent(event),
            event
        });
    }

    getShortcutFromEvent(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        
        const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
        parts.push(key);
        
        return parts.join('+');
    }

    register(shortcut, callback, options = {}) {
        const id = options.name || shortcut;
        
        this.shortcuts.set(shortcut, {
            id,
            callback,
            data: options.data,
            description: options.description,
            category: options.category || 'general',
            scope: options.scope || 'global'
        });

        return () => this.unregister(shortcut);
    }

    unregister(shortcut) {
        return this.shortcuts.delete(shortcut);
    }

    registerDefaultShortcuts() {
        // Navigation
        this.register('Ctrl+K', () => ({ action: 'openCommandPalette' }), {
            name: 'commandPalette',
            description: 'Open command palette',
            category: 'navigation'
        });

        this.register('Ctrl+/', () => ({ action: 'toggleHelp' }), {
            name: 'toggleHelp',
            description: 'Toggle help dialog',
            category: 'navigation'
        });

        this.register('Escape', () => ({ action: 'closeModal' }), {
            name: 'closeModal',
            description: 'Close modal or dialog',
            category: 'navigation'
        });

        // Chat
        this.register('Ctrl+Enter', () => ({ action: 'sendMessage' }), {
            name: 'sendMessage',
            description: 'Send message',
            category: 'chat'
        });

        this.register('Ctrl+Shift+C', () => ({ action: 'copyLastMessage' }), {
            name: 'copyLastMessage',
            description: 'Copy last message',
            category: 'chat'
        });

        this.register('Ctrl+L', () => ({ action: 'clearChat' }), {
            name: 'clearChat',
            description: 'Clear chat history',
            category: 'chat'
        });

        // Voice
        this.register('Ctrl+M', () => ({ action: 'toggleVoice' }), {
            name: 'toggleVoice',
            description: 'Toggle voice input',
            category: 'voice'
        });

        this.register('Ctrl+Shift+V', () => ({ action: 'toggleVoiceOutput' }), {
            name: 'toggleVoiceOutput',
            description: 'Toggle voice output',
            category: 'voice'
        });

        // Editor
        this.register('Ctrl+S', () => ({ action: 'save' }), {
            name: 'save',
            description: 'Save current work',
            category: 'editor'
        });

        this.register('Ctrl+Z', () => ({ action: 'undo' }), {
            name: 'undo',
            description: 'Undo last action',
            category: 'editor'
        });

        this.register('Ctrl+Y', () => ({ action: 'redo' }), {
            name: 'redo',
            description: 'Redo last action',
            category: 'editor'
        });

        // Theme
        this.register('Ctrl+Shift+D', () => ({ action: 'toggleDarkMode' }), {
            name: 'toggleDarkMode',
            description: 'Toggle dark mode',
            category: 'appearance'
        });

        // Navigation keys
        this.register('g h', () => ({ action: 'goHome' }), {
            name: 'goHome',
            description: 'Go to home',
            category: 'navigation'
        });

        this.register('g s', () => ({ action: 'goSettings' }), {
            name: 'goSettings',
            description: 'Go to settings',
            category: 'navigation'
        });

        this.register('g p', () => ({ action: 'goProfile' }), {
            name: 'goProfile',
            description: 'Go to profile',
            category: 'navigation'
        });

        // Search
        this.register('Ctrl+F', () => ({ action: 'openSearch' }), {
            name: 'openSearch',
            description: 'Open search',
            category: 'search'
        });

        this.register('Ctrl+Shift+F', () => ({ action: 'searchAll' }), {
            name: 'searchAll',
            description: 'Search everywhere',
            category: 'search'
        });
    }

    enable() {
        this.enabled = true;
        this.emit('enabled');
    }

    disable() {
        this.enabled = false;
        this.emit('disabled');
    }

    toggle() {
        this.enabled = !this.enabled;
        this.emit(this.enabled ? 'enabled' : 'disabled');
    }

    isEnabled() {
        return this.enabled;
    }

    getAll() {
        const shortcuts = {};
        
        for (const [shortcut, handler] of this.shortcuts) {
            const category = handler.category || 'general';
            if (!shortcuts[category]) {
                shortcuts[category] = [];
            }
            shortcuts[category].push({
                shortcut,
                name: handler.name,
                description: handler.description
            });
        }
        
        return shortcuts;
    }

    getByCategory(category) {
        const results = [];
        
        for (const [shortcut, handler] of this.shortcuts) {
            if (handler.category === category) {
                results.push({
                    shortcut,
                    name: handler.name,
                    description: handler.description
                });
            }
        }
        
        return results;
    }

    getByName(name) {
        for (const [shortcut, handler] of this.shortcuts) {
            if (handler.name === name) {
                return { shortcut, ...handler };
            }
        }
        return null;
    }

    hasShortcut(shortcut) {
        return this.shortcuts.has(shortcut);
    }

    getShortcutFor(name) {
        for (const [shortcut, handler] of this.shortcuts) {
            if (handler.name === name) {
                return shortcut;
            }
        }
        return null;
    }

    updateShortcut(oldShortcut, newShortcut) {
        const handler = this.shortcuts.get(oldShortcut);
        if (!handler) return false;

        this.shortcuts.delete(oldShortcut);
        this.shortcuts.set(newShortcut, { ...handler });
        
        return true;
    }

    export() {
        const shortcuts = {};
        
        for (const [shortcut, handler] of this.shortcuts) {
            shortcuts[handler.name] = {
                shortcut,
                description: handler.description,
                category: handler.category
            };
        }
        
        return JSON.stringify(shortcuts, null, 2);
    }

    import(jsonData) {
        try {
            const shortcuts = JSON.parse(jsonData);
            
            for (const [name, data] of Object.entries(shortcuts)) {
                this.register(data.shortcut, () => {}, {
                    name,
                    description: data.description,
                    category: data.category
                });
            }
            
            return { success: true, count: Object.keys(shortcuts).length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    formatShortcut(shortcut) {
        const parts = shortcut.split('+');
        return parts.map(p => {
            switch (p) {
                case 'Ctrl': return '⌃';
                case 'Alt': return '⌥';
                case 'Shift': return '⇧';
                case 'Enter': return '↵';
                case 'Escape': return '⎋';
                case 'Backspace': return '⌫';
                case 'ArrowUp': return '↑';
                case 'ArrowDown': return '↓';
                case 'ArrowLeft': return '←';
                case 'ArrowRight': return '→';
                default: return p;
            }
        }).join('');
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

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.shortcuts.clear();
    }
}

export { KeyboardShortcuts };