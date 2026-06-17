/**
 * NEXUS AI - JavaScript Generator Module
 * JavaScript কোড জেনারেটর
 */

class JSGenerator {
    constructor() {
        this.templates = new Map();
        this.init();
    }
    
    init() {
        // API Handler
        this.templates.set('api', {
            name: 'API Handler',
            description: 'API হ্যান্ডলার ক্লাস',
            code: `// API Handler - NEXUS AI
class APIHandler {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    async request(endpoint, options = {}) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        
        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: { ...this.headers, ...options.headers },
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    get(endpoint) {
        return this.request(endpoint);
    }
    
    post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: data });
    }
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Usage
const api = new APIHandler('https://api.example.com');
api.get('/users').then(users => console.log(users));`
        });
        
        // Form Handler
        this.templates.set('form', {
            name: 'Form Handler',
            description: 'ফর্ম ভ্যালিডেশন ও হ্যান্ডলার',
            code: `// Form Handler - NEXUS AI
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    }
    
    validateField(field) {
        const rules = field.dataset.rules?.split('|') || [];
        const value = field.value.trim();
        
        for (const rule of rules) {
            const [ruleName, ruleValue] = rule.split(':');
            
            switch (ruleName) {
                case 'required':
                    if (!value) {
                        this.setError(field, 'এই field আবশ্যক');
                        return false;
                    }
                    break;
                    
                case 'email':
                    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                        this.setError(field, 'সঠিক ইমেইল দিন');
                        return false;
                    }
                    break;
                    
                case 'minlength':
                    if (value.length < parseInt(ruleValue)) {
                        this.setError(field, \`কমপক্ষে \${ruleValue} অক্ষর\`);
                        return false;
                    }
                    break;
                    
                case 'phone':
                    if (!/^01[3-9]\\d{8}$/.test(value)) {
                        this.setError(field, 'সঠিক মোবাইল নম্বর দিন');
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }
    
    validate() {
        let isValid = true;
        this.errors = {};
        
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    setError(field, message) {
        this.errors[field.name] = message;
        field.classList.add('error');
        field.classList.remove('success');
        
        let errorEl = field.nextElementSibling;
        if (!errorEl?.classList.contains('error-message')) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            field.parentNode.insertBefore(errorEl, field.nextSibling);
        }
        errorEl.textContent = message;
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorEl = field.nextElementSibling;
        if (errorEl?.classList.contains('error-message')) {
            errorEl.remove();
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validate()) {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            console.log('Form submitted:', data);
            // Send to server
        }
    }
}

// Usage
const form = new FormHandler('myForm');`
        });
        
        // Storage Manager
        this.templates.set('storage', {
            name: 'Storage Manager',
            description: 'লোকাল স্টোরেজ ম্যানেজার',
            code: `// Storage Manager - NEXUS AI
class StorageManager {
    constructor(prefix = 'app_') {
        this.prefix = prefix;
    }
    
    set(key, value) {
        try {
            const data = {
                value,
                timestamp: Date.now()
            };
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            return data.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
    
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }
    
    keys() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    }
}

// Usage
const storage = new StorageManager('nexus_');
storage.set('theme', 'dark');
storage.set('user', { name: 'John', age: 25 });
const theme = storage.get('theme');
const user = storage.get('user');`
        });
        
        // Router
        this.templates.set('router', {
            name: 'Simple Router',
            description: 'সিঙ্গেল পেজ অ্যাপ রাউটার',
            code: `// Simple Router - NEXUS AI
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }
    
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }
    
    navigate(path) {
        history.pushState(null, '', path);
        this.handleRoute();
    }
    
    handleRoute() {
        const path = window.location.pathname;
        
        // Try exact match
        let handler = this.routes.get(path);
        
        // Try pattern match
        if (!handler) {
            for (const [route, h] of this.routes) {
                const pattern = this.routeToRegex(route);
                const match = path.match(pattern);
                if (match) {
                    handler = h;
                    break;
                }
            }
        }
        
        // Default route
        if (!handler) {
            handler = this.routes.get('/404') || (() => {
                document.getElementById('app').innerHTML = '<h1>404 Not Found</h1>';
            });
        }
        
        handler();
        this.currentRoute = path;
    }
    
    routeToRegex(route) {
        const params = route.match(/:\\w+/g) || [];
        let regex = route;
        params.forEach(param => {
            regex = regex.replace(param, '([^/]+)');
        });
        return new RegExp('^' + regex + '$');
    }
    
    getParam(param) {
        const match = this.currentRoute.match(/:\\w+/);
        if (match) {
            const index = match.index;
            const pathParts = window.location.pathname.split('/');
            const paramParts = match[0].split(':');
            return pathParts[index + 1];
        }
        return null;
    }
}

// Usage
const router = new Router();

router.addRoute('/', () => {
    document.getElementById('app').innerHTML = '<h1>Home</h1>';
});

router.addRoute('/about', () => {
    document.getElementById('app').innerHTML = '<h1>About</h1>';
});

router.addRoute('/user/:id', (params) => {
    document.getElementById('app').innerHTML = \`<h1>User: \${params.id}</h1>\`;
});

router.handleRoute();`
        });
        
        // Event Manager
        this.templates.set('event', {
            name: 'Event Manager',
            description: 'ইভেন্ট ম্যানেজার',
            code: `// Event Manager - NEXUS AI
class EventManager {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const handler = context ? callback.bind(context) : callback;
        this.events.get(event).push(handler);
        
        // Return unsubscribe function
        return () => this.off(event, handler);
    }
    
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events.has(event)) return;
        
        this.events.get(event).forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(\`Event \${event} error:\`, error);
            }
        });
    }
    
    once(event, callback, context = null) {
        const handler = (...args) => {
            callback(...args);
            this.off(event, handler);
        };
        return this.on(event, handler, context);
    }
    
    clear(event = null) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}

// Usage
const events = new EventManager();

// Subscribe
const unsubscribe = events.on('user:login', (user) => {
    console.log('User logged in:', user.name);
});

// Emit
events.emit('user:login', { name: 'John', email: 'john@example.com' });

// Unsubscribe
unsubscribe();

// One-time event
events.once('app:ready', () => {
    console.log('App is ready!');
});`
        });
        
        // State Manager
        this.templates.set('state', {
            name: 'State Manager',
            description: 'স্টেট ম্যানেজার',
            code: `// State Manager - NEXUS AI
class StateManager {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Map();
        this.prevState = { ...initialState };
    }
    
    get(path) {
        const keys = path.split('.');
        let value = this.state;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let obj = this.state;
        
        for (const key of keys) {
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        const oldValue = obj[lastKey];
        obj[lastKey] = value;
        
        this.notify(path, value, oldValue);
        this.prevState = { ...this.state };
    }
    
    update(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value);
        });
    }
    
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
    
    notify(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
        
        // Notify wildcard subscribers
        const wildcard = path.split('.')[0] + '.*';
        if (this.listeners.has(wildcard)) {
            this.listeners.get(wildcard).forEach(callback => {
                callback(newValue, oldValue, path);
            });
        }
    }
    
    getState() {
        return { ...this.state };
    }
    
    reset() {
        this.state = { ...this.prevState };
    }
}

// Usage
const state = new StateManager({ user: null, theme: 'dark', notifications: [] });

// Subscribe
state.subscribe('user', (newUser, oldUser) => {
    console.log('User changed:', oldUser, '->', newUser);
});

// Update
state.set('user', { name: 'John', email: 'john@example.com' });
state.set('theme', 'light');
state.set('notifications', ['New message', 'Order shipped']);`
        });
        
        console.log('[JS Generator] Templates loaded:', this.templates.size);
    }
    
    generate(templateKey) {
        const template = this.templates.get(templateKey);
        return template || null;
    }
    
    getTemplates() {
        return Array.from(this.templates.entries()).map(([key, value]) => ({
            key,
            name: value.name,
            description: value.description
        }));
    }
}

// Create global instance
window.jsGenerator = new JSGenerator();