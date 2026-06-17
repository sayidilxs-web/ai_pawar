/**
 * NEXUS AI - Notification System
 * নোটিফিকেশন সিস্টেম
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }
    
    init() {
        // Create notification container if not exists
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }
        
        console.log('[Notification System] Initialized');
    }
    
    show(message, options = {}) {
        const {
            type = 'info', // info, success, warning, error
            duration = 3000,
            icon = null
        } = options;
        
        const notification = document.createElement('div');
        notification.className = `nexus-notification ${type}`;
        notification.style.cssText = `
            padding: 15px 20px;
            background: ${this.getBackgroundColor(type)};
            border: 1px solid ${this.getBorderColor(type)};
            border-radius: 10px;
            color: #e0e0e0;
            font-family: 'Noto Sans Bengali', sans-serif;
            font-size: 0.95rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            pointer-events: auto;
            max-width: 350px;
        `;
        
        const iconMap = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">${icon || iconMap[type]}</span>
                <span>${message}</span>
            </div>
        `;
        
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Limit notifications
        while (this.notifications.length > this.maxNotifications) {
            const old = this.notifications.shift();
            this.removeNotification(old);
        }
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    removeNotification(notification) {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    getBackgroundColor(type) {
        const colors = {
            info: 'rgba(0, 240, 255, 0.15)',
            success: 'rgba(0, 255, 136, 0.15)',
            warning: 'rgba(255, 170, 0, 0.15)',
            error: 'rgba(255, 51, 102, 0.15)'
        };
        return colors[type] || colors.info;
    }
    
    
    getBorderColor(type) {
        const colors = {
            info: '#00f0ff',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff3366'
        };
        return colors[type] || colors.info;
    }
    
    info(message, duration) {
        return this.show(message, { type: 'info', duration });
    }
    
    success(message, duration) {
        return this.show(message, { type: 'success', duration });
    }
    
    warning(message, duration) {
        return this.show(message, { type: 'warning', duration });
    }
    
    error(message, duration) {
        return this.show(message, { type: 'error', duration });
    }
    
    clear() {
        this.notifications.forEach(n => {
            if (n.parentNode) n.parentNode.removeChild(n);
        });
        this.notifications = [];
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Export
window.notificationSystem = new NotificationSystem();