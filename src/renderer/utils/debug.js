/**
 * NEXUS AI - Debug Panel
 * ডিবাগ প্যানেল
 */

class DebugPanel {
    constructor() {
        this.isOpen = false;
        this.container = null;
        this.logs = [];
        this.maxLogs = 100;
        this.init();
    }
    
    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'debug-panel';
        this.container.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 400px;
            max-height: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00f0ff;
            border-radius: 10px;
            padding: 10px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            color: #00f0ff;
            overflow-y: auto;
            display: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(this.container);
        
        // Toggle with keyboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggle();
            }
        });
        
        console.log('[Debug Panel] Initialized');
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            this.render();
        }
    }
    
    log(level, message, data = null) {
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        
        this.logs.push(entry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        if (this.isOpen) {
            this.render();
        }
        
        // Also log to console
        const color = this.getColor(level);
        console.log(`%c[${level}] ${message}`, `color: ${color}`, data || '');
    }
    
    getColor(level) {
        const colors = {
            debug: '#888',
            info: '#00f0ff',
            warn: '#ffaa00',
            error: '#ff3366',
            success: '#00ff88'
        };
        return colors[level] || colors.info;
    }
    
    debug(message, data) {
        this.log('debug', message, data);
    }
    
    info(message, data) {
        this.log('info', message, data);
    }
    
    warn(message, data) {
        this.log('warn', message, data);
    }
    
    error(message, data) {
        this.log('error', message, data);
    }
    
    success(message, data) {
        this.log('success', message, data);
    }
    
    render() {
        const html = this.logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const dataStr = log.data ? ` <span style="color: #888">${JSON.stringify(log.data)}</span>` : '';
            return `<div style="margin-bottom: 5px;">
                <span style="color: #888">[${time}]</span>
                <span style="color: ${this.getColor(log.level)}">[${log.level.toUpperCase()}]</span>
                ${log.message}${dataStr}
            </div>`;
        }).join('');
        
        this.container.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Debug Panel (Ctrl+Shift+D)</strong>
                <button onclick="window.debugPanel?.clear()" style="background: none; border: none; color: #ff3366; cursor: pointer;">Clear</button>
            </div>
            ${html}
        `;
    }
    
    clear() {
        this.logs = [];
        this.render();
    }
    
    getLogs() {
        return this.logs;
    }
    
    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export
window.debugPanel = new DebugPanel();