/**
 * NEXUS AI - Network Monitor
 * নেটওয়ার্ক মনিটর
 */

class NetworkMonitor {
    constructor() {
        this.online = navigator.onLine;
        this.latency = 0;
        this.lastCheck = null;
        
        this.init();
    }
    
    init() {
        window.addEventListener('online', () => {
            this.online = true;
            this.onStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.online = false;
            this.onStatusChange(false);
        });
        
        // Check periodically
        setInterval(() => this.checkConnection(), 30000);
        
        console.log('[Network Monitor] Initialized, online:', this.online);
    }
    
    async checkConnection() {
        this.lastCheck = Date.now();
        
        try {
            const start = Date.now();
            const response = await fetch('https://www.google.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-store'
            });
            
            this.latency = Date.now() - start;
            this.online = true;
            
            return true;
        } catch (error) {
            this.online = false;
            this.latency = 0;
            return false;
        }
    }
    
    onStatusChange(online) {
        console.log('[Network] Status changed:', online ? 'Online' : 'Offline');
        
        if (window.App) {
            const message = online ? 'ইন্টারনেট সংযুক্ত হয়েছে' : 'ইন্টারনেট সংযোগ বিচ্ছিন্ন';
            window.App.showNotification(message);
        }
    }
    
    isOnline() {
        return this.online;
    }
    
    getLatency() {
        return this.latency;
    }
    
    async measureLatency() {
        await this.checkConnection();
        return this.latency;
    }
}

// Export
window.networkMonitor = new NetworkMonitor();