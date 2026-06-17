/**
 * 🛡️ NEXUS AI - Error Handler
 * কম্প্রিহেন্সিভ এরর হ্যান্ডলিং
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.listeners = [];
        
        this.setupGlobalHandler();
    }

    setupGlobalHandler() {
        // JavaScript Errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        });
    }

    handleError(error) {
        const errorObj = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: error.type || 'unknown',
            message: error.message || String(error),
            stack: error.stack || new Error().stack,
            context: this.getContext()
        };

        // লগ করুন
        console.error('❌ [Error]', errorObj.message);
        if (errorObj.stack) {
            console.error('Stack:', errorObj.stack);
        }

        // সেভ করুন
        this.errors.unshift(errorObj);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }

        // নোটিফাই করুন
        this.notifyListeners(errorObj);

        // UI তে দেখান
        this.showErrorToast(errorObj);

        return errorObj;
    }

    getContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            online: navigator.onLine
        };
    }

    showErrorToast(error) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-content">
                <div class="error-title">সমস্যা হয়েছে</div>
                <div class="error-message">${this.sanitize(error.message)}</div>
            </div>
            <button class="error-dismiss" onclick="this.parentElement.remove()">✕</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    sanitize(str) {
        if (!str) return '';
        return String(str)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .substring(0, 200);
    }

    // ==================== ERROR RECOVERY ====================

    async tryRecover(error) {
        const recoveryStrategies = {
            'network': () => this.recoverNetwork(),
            'permission': () => this.recoverPermission(),
            'memory': () => this.recoverMemory(),
            'default': () => this.recoverDefault()
        };

        const strategy = recoveryStrategies[error.type] || recoveryStrategies['default'];
        return await strategy();
    }

    async recoverNetwork() {
        console.log('[ErrorHandler] Attempting network recovery...');
        
        // Retry কানেকশন
        if (!navigator.onLine) {
            if (window.App) {
                window.App.showNotification('📡 নেটওয়ার্ক চেক করুন...');
            }
            return false;
        }

        // API retry
        if (window.aiCore) {
            // কিছুক্ষণ অপেক্ষা করুন
            await new Promise(r => setTimeout(r, 2000));
            return true;
        }

        return false;
    }

    async recoverPermission() {
        console.log('[ErrorHandler] Attempting permission recovery...');
        
        if (window.App) {
            window.App.showNotification('🔒 অনুমতি প্রয়োজন হতে পারে');
        }
        
        return false;
    }

    async recoverMemory() {
        console.log('[ErrorHandler] Attempting memory recovery...');
        
        // Cache clear করুন
        if (window.caches) {
            try {
                const names = await caches.keys();
                await Promise.all(names.map(name => caches.delete(name)));
            } catch (e) {
                console.warn('[ErrorHandler] Cache clear failed:', e);
            }
        }

        if (window.App) {
            window.App.showNotification('🧹 মেমোরি ক্লিয়ার করা হচ্ছে...');
        }

        return true;
    }

    async recoverDefault() {
        console.log('[ErrorHandler] Default recovery...');
        return true;
    }

    // ==================== LISTENERS ====================

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners(error) {
        this.listeners.forEach(callback => {
            try {
                callback(error);
            } catch (e) {
                console.error('[ErrorHandler] Listener error:', e);
            }
        });
    }

    // ==================== ERROR LOGS ====================

    getErrors(filter = {}) {
        let filtered = [...this.errors];

        if (filter.type) {
            filtered = filtered.filter(e => e.type === filter.type);
        }
        if (filter.since) {
            filtered = filtered.filter(e => new Date(e.timestamp) > new Date(filter.since));
        }

        return filtered;
    }

    clearErrors() {
        this.errors = [];
    }

    exportErrors() {
        return JSON.stringify({
            exportedAt: new Date().toISOString(),
            errors: this.errors
        }, null, 2);
    }

    // ==================== USER FEEDBACK ====================

    reportUserIssue(message, severity = 'medium') {
        const report = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userMessage: message,
            severity: severity,
            recentErrors: this.errors.slice(0, 5),
            context: this.getContext()
        };

        // localStorage তে সেভ করুন
        const reports = JSON.parse(localStorage.getItem('nexus_error_reports') || '[]');
        reports.unshift(report);
        localStorage.setItem('nexus_error_reports', JSON.stringify(reports.slice(0, 50)));

        return report;
    }
}

// Export
window.ErrorHandler = ErrorHandler;
window.errorHandler = new ErrorHandler();
console.log('[ErrorHandler] Initialized');
