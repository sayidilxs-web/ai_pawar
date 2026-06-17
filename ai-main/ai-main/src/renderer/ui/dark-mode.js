/**
 * NEXUS Dark Mode Module
 * Theme management with system preference support
 */

class DarkModeManager {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'nexus_theme';
        this.listeners = new Map();
        this.transitionDuration = options.transitionDuration || 300;
        
        this.themes = {
            light: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f5f5f5',
                '--bg-tertiary': '#e8e8e8',
                '--text-primary': '#1a1a1a',
                '--text-secondary': '#666666',
                '--text-muted': '#999999',
                '--border-color': '#e0e0e0',
                '--accent-color': '#2196F3',
                '--accent-hover': '#1976D2',
                '--success-color': '#4CAF50',
                '--warning-color': '#FF9800',
                '--error-color': '#F44336',
                '--shadow': '0 2px 8px rgba(0,0,0,0.1)'
            },
            dark: {
                '--bg-primary': '#1a1a1a',
                '--bg-secondary': '#2d2d2d',
                '--bg-tertiary': '#3d3d3d',
                '--text-primary': '#ffffff',
                '--text-secondary': '#b0b0b0',
                '--text-muted': '#808080',
                '--border-color': '#404040',
                '--accent-color': '#64B5F6',
                '--accent-hover': '#42A5F5',
                '--success-color': '#81C784',
                '--warning-color': '#FFB74D',
                '--error-color': '#E57373',
                '--shadow': '0 2px 8px rgba(0,0,0,0.3)'
            },
            auto: null // Uses system preference
        };

        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupSystemPreferenceListener();
        this.setupTransition();
    }

    setupSystemPreferenceListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.applyTheme('auto');
                this.emit('change', { theme: 'auto', isDark: e.matches });
            }
        });
    }

    setupTransition() {
        document.documentElement.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);
    }

    setTheme(theme) {
        if (!this.themes.hasOwnProperty(theme)) {
            console.error('Invalid theme:', theme);
            return false;
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.applyTheme(theme);
        this.emit('change', { theme, isDark: this.isDark() });

        return true;
    }

    toggle() {
        const newTheme = this.isDark() ? 'light' : 'dark';
        return this.setTheme(newTheme);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        let cssVars;

        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            cssVars = prefersDark ? this.themes.dark : this.themes.light;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            cssVars = this.themes[theme];
            root.setAttribute('data-theme', theme);
        }

        if (cssVars) {
            for (const [variable, value] of Object.entries(cssVars)) {
                root.style.setProperty(variable, value);
            }
        }

        this.updateBodyClass();
    }

    updateBodyClass() {
        const body = document.body;
        
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${this.isDark() ? 'dark' : 'light'}`);
    }

    isDark() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return this.currentTheme === 'dark';
    }

    getTheme() {
        return this.currentTheme;
    }

    loadTheme() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && this.themes.hasOwnProperty(saved)) {
            return saved;
        }
        return 'auto';
    }

    saveTheme(theme) {
        localStorage.setItem(this.storageKey, theme);
    }

    createToggleButton(container) {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.innerHTML = this.isDark() 
            ? '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
            : '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>';
        
        button.addEventListener('click', () => this.toggle());
        
        this.on('change', ({ theme, isDark }) => {
            button.innerHTML = isDark 
                ? '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
                : '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>';
        });

        if (container) {
            container.appendChild(button);
        }

        return button;
    }

    addCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary);
                transition: all var(--transition-duration) ease;
            }
            
            .theme-toggle:hover {
                background: var(--bg-tertiary);
            }
            
            [data-theme="dark"] .theme-toggle svg path,
            [data-theme="dark"] .theme-toggle svg circle {
                color: #FFD54F;
            }
            
            [data-theme="light"] .theme-toggle svg path {
                color: #333;
            }
            
            [data-theme="light"] .theme-toggle svg circle {
                color: #333;
            }
        `;
        document.head.appendChild(style);
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

    getAllThemes() {
        return Object.keys(this.themes).filter(t => t !== 'auto' || this.currentTheme === 'auto');
    }
}

export { DarkModeManager };