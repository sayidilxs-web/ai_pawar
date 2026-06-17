/**
 * NEXUS AI - Security Utils
 * সিকিউরিটি ইউটিলিটি
 */

const Security = {
    // Sanitize input
    sanitize(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    },
    
    // Escape HTML
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    // Validate API key format
    validateApiKey(key) {
        if (!key) return { valid: false, message: 'API কী প্রয়োজন' };
        if (!key.startsWith('AIza')) return { valid: false, message: 'সঠিক API কী নয়' };
        if (key.length < 30) return { valid: false, message: 'API কী খুব ছোট' };
        return { valid: true };
    },
    
    // Generate random ID
    generateId(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Hash string (simple)
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },
    
    // Secure local storage
    secureSet(key, value) {
        try {
            const encrypted = btoa(encodeURIComponent(JSON.stringify(value)));
            localStorage.setItem(key, encrypted);
            return true;
        } catch {
            return false;
        }
    },
    
    // Secure local storage get
    secureGet(key, defaultValue = null) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return defaultValue;
            return JSON.parse(decodeURIComponent(atob(encrypted)));
        } catch {
            return defaultValue;
        }
    },
    
    // Mask sensitive data
    mask(str, visibleChars = 4) {
        if (!str || str.length <= visibleChars) return str;
        return str.substring(0, visibleChars) + '•'.repeat(str.length - visibleChars);
    },
    
    // Check for XSS
    containsXSS(str) {
        const patterns = [
            /<script/i,
            /javascript:/gi,
            /on\w+=/gi,
            /expression\s*\(/gi,
            /url\s*\(/gi
        ];
        return patterns.some(pattern => pattern.test(str));
    }
};

// Export
window.Security = Security;