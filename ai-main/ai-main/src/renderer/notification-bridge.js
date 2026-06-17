/**
 * 🔗 NEXUS AI - Cross-Device Notification Bridge
 * ফোন এবং PC-র মধ্যে নোটিফিকেশন শেয়ারিং
 */

class NotificationBridge {
    constructor() {
        this.connectedDevices = new Map();
        this.messageQueue = [];
        this.isConnected = false;
        this.bridgeType = 'local'; // local, wifi, bluetooth
        this.lastSync = null;
        this.syncInterval = 5000;
        
        // Notification templates
        this.templates = {
            incoming_call: {
                title: '📞 আগত কল',
                body: '${caller} কল করছেন',
                icon: 'phone'
            },
            message: {
                title: '💬 নতুন মেসেজ',
                body: '${sender}: ${message}',
                icon: 'message'
            },
            whatsapp: {
                title: '📱 WhatsApp',
                body: '${sender}: ${message}',
                icon: 'whatsapp'
            },
            alarm: {
                title: '⏰ অ্যালার্ম',
                body: '${message}',
                icon: 'alarm'
            },
            reminder: {
                title: '📝 রিমাইন্ডার',
                body: '${message}',
                icon: 'reminder'
            }
        };
    }

    /**
     * Initialize notification bridge
     */
    async init() {
        console.log('[Bridge] Initializing notification bridge...');
        
        // Load saved connections
        await this.loadConnections();
        
        // Set up message listener
        this.setupMessageListener();
        
        // Start sync
        this.startSync();
        
        return true;
    }

    /**
     * Set up message listener for notifications
     */
    setupMessageListener() {
        // In a real implementation, this would listen to system notifications
        // or use ADB to get notifications from connected phone
        
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                console.log('[Bridge] Notification permission:', permission);
            });
        }
    }

    /**
     * Start synchronization
     */
    startSync() {
        console.log('[Bridge] Starting sync...');
        
        this.syncIntervalId = setInterval(async () => {
            await this.syncNotifications();
        }, this.syncInterval);
    }

    /**
     * Stop synchronization
     */
    stopSync() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
    }

    /**
     * Sync notifications between devices
     */
    async syncNotifications() {
        try {
            // Get phone notifications via ADB
            if (window.phoneConnection && window.phoneConnection.currentDevice) {
                const phoneNotifications = await this.getPhoneNotifications();
                
                // Process and display
                phoneNotifications.forEach(notification => {
                    this.displayNotification(notification);
                });
            }
            
            this.lastSync = new Date();
            
        } catch (error) {
            console.error('[Bridge] Sync error:', error);
        }
    }

    /**
     * Get notifications from phone
     */
    async getPhoneNotifications() {
        // In real implementation, use ADB to get notifications
        // adb shell dumpsys notification --noredact
        return [];
    }

    /**
     * Display notification
     */
    displayNotification(data) {
        const { title, body, icon, url } = data;
        
        // Check if we should show notification
        if (!this.shouldShowNotification(data)) {
            return;
        }
        
        // Use browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: this.getIconUrl(icon),
                tag: data.id || title
            });
        }
        
        // Also show in app
        if (window.App) {
            window.App.showNotification(`${title}: ${body}`);
        }
        
        // Update UI
        this.updateNotificationPanel(data);
    }

    /**
     * Check if notification should be shown
     */
    shouldShowNotification(notification) {
        // Filter rules
        const filters = this.getFilters();
        
        // Check if app is filtered
        if (filters.excludeApps.includes(notification.app)) {
            return false;
        }
        
        // Check keywords
        if (filters.excludeKeywords.some(kw => 
            notification.body.toLowerCase().includes(kw.toLowerCase())
        )) {
            return false;
        }
        
        return true;
    }

    /**
     * Get notification filters
     */
    getFilters() {
        const saved = localStorage.getItem('nexusNotificationFilters');
        return saved ? JSON.parse(saved) : {
            excludeApps: [],
            excludeKeywords: [],
            quietHours: { start: '22:00', end: '07:00' }
        };
    }

    /**
     * Get icon URL for notification
     */
    getIconUrl(iconType) {
        const icons = {
            phone: '📞',
            message: '💬',
            whatsapp: '📱',
            alarm: '⏰',
            reminder: '📝',
            email: '📧',
            default: '🔔'
        };
        return icons[iconType] || icons.default;
    }

    /**
     * Update notification panel UI
     */
    updateNotificationPanel(notification) {
        const container = document.getElementById('notificationList');
        if (!container) return;
        
        const item = document.createElement('div');
        item.className = 'bridge-notification';
        item.innerHTML = `
            <div class="bridge-notif-icon">${this.getIconUrl(notification.icon)}</div>
            <div class="bridge-notif-content">
                <div class="bridge-notif-title">${notification.title}</div>
                <div class="bridge-notif-body">${notification.body}</div>
                <div class="bridge-notif-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        container.insertBefore(item, container.firstChild);
        
        // Limit items
        while (container.children.length > 20) {
            container.removeChild(container.lastChild);
        }
    }

    /**
     * Send notification to phone
     */
    async sendToPhone(title, message) {
        if (!window.phoneConnection || !window.phoneConnection.currentDevice) {
            console.warn('[Bridge] No phone connected');
            return false;
        }
        
        try {
            await window.phoneConnection.sendNotification(title, message);
            return true;
        } catch (error) {
            console.error('[Bridge] Send error:', error);
            return false;
        }
    }

    /**
     * Send notification to specific device
     */
    async sendToDevice(deviceId, notification) {
        const device = this.connectedDevices.get(deviceId);
        if (!device) return false;
        
        // In real implementation, send via appropriate protocol
        console.log(`[Bridge] Sending to ${device.name}:`, notification);
        
        return true;
    }

    /**
     * Add connected device
     */
    addDevice(device) {
        this.connectedDevices.set(device.id, device);
        this.saveConnections();
        console.log(`[Bridge] Added device: ${device.name}`);
    }

    /**
     * Remove connected device
     */
    removeDevice(deviceId) {
        this.connectedDevices.delete(deviceId);
        this.saveConnections();
        console.log(`[Bridge] Removed device: ${deviceId}`);
    }

    /**
     * Save connections to localStorage
     */
    saveConnections() {
        const data = Array.from(this.connectedDevices.values());
        localStorage.setItem('nexusBridgeConnections', JSON.stringify(data));
    }

    /**
     * Load connections from localStorage
     */
    async loadConnections() {
        const saved = localStorage.getItem('nexusBridgeConnections');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                data.forEach(d => this.connectedDevices.set(d.id, d));
                console.log(`[Bridge] Loaded ${data.length} connections`);
            } catch (e) {
                console.error('[Bridge] Load error:', e);
            }
        }
    }

    /**
     * Create notification template
     */
    createTemplate(type, data) {
        const template = this.templates[type];
        if (!template) return null;
        
        let title = template.title;
        let body = template.body;
        
        // Replace placeholders
        Object.entries(data).forEach(([key, value]) => {
            title = title.replace(`\${${key}}`, value);
            body = body.replace(`\${${key}}`, value);
        });
        
        return { title, body, icon: template.icon };
    }

    /**
     * Get bridge status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            deviceCount: this.connectedDevices.size,
            devices: Array.from(this.connectedDevices.values()),
            lastSync: this.lastSync
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopSync();
        this.connectedDevices.clear();
        console.log('[Bridge] Notification bridge destroyed');
    }
}

// Export
window.NotificationBridge = NotificationBridge;
window.notificationBridge = new NotificationBridge();

console.log('[Bridge] Notification bridge initialized');