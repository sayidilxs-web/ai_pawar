/**
 * NEXUS AI - Keyboard Shortcuts
 * কীবোর্ড শর্টকাট হ্যান্ডলার
 */

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.init();
    }
    
    init() {
        // Built-in shortcuts
        this.register('ctrl+shift+n', this.toggleNexus.bind(this), 'NEXUS AI টগল করুন');
        this.register('ctrl+shift+l', this.toggleListening.bind(this), 'শোনা টগল করুন');
        this.register('ctrl+shift+s', this.takeScreenshot.bind(this), 'স্ক্রিনশট নিন');
        this.register('ctrl+shift+,', this.openSettings.bind(this), 'সেটিংস খুলুন');
        this.register('escape', this.closeModals.bind(this), 'মডাল বন্ধ করুন');
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        console.log('[Keyboard Shortcuts] Initialized');
    }
    
    register(combination, handler, description) {
        this.shortcuts.set(combination.toLowerCase(), { handler, description });
    }
    
    handleKeyDown(event) {
        if (!this.enabled) return;
        
        // Build key combination string
        let combo = [];
        
        if (event.ctrlKey) combo.push('ctrl');
        if (event.shiftKey) combo.push('shift');
        if (event.altKey) combo.push('alt');
        if (event.metaKey) combo.push('meta');
        
        const key = event.key.toLowerCase();
        if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
            combo.push(key);
        }
        
        const combination = combo.join('+');
        
        // Check if shortcut exists
        const shortcut = this.shortcuts.get(combination);
        
        if (shortcut) {
            event.preventDefault();
            event.stopPropagation();
            
            try {
                shortcut.handler();
            } catch (error) {
                console.error('[Keyboard Shortcuts] Error:', error);
            }
        }
    }
    
    toggleNexus() {
        if (window.nexusAI) {
            window.nexusAI.maximizeWindow();
        }
    }
    
    toggleListening() {
        if (typeof toggleListening === 'function') {
            toggleListening();
        }
    }
    
    takeScreenshot() {
        if (typeof captureScreen === 'function') {
            captureScreen();
        }
    }
    
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    closeModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([combo, data]) => ({
            combination: combo,
            description: data.description
        }));
    }
}

// Export
window.keyboardShortcuts = new KeyboardShortcuts();