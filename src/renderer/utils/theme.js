/**
 * NEXUS AI - Theme Manager
 * থিম ম্যানেজার
 */

class ThemeManager {
    constructor() {
        this.themes = {
            cyber: {
                name: 'সাইবার',
                colors: {
                    primary: '#00f0ff',
                    secondary: '#ff00ff',
                    accent: '#00ff88',
                    background: '#0a0a0f',
                    text: '#e0e0e0'
                }
            },
            neon: {
                name: 'নিয়ন',
                colors: {
                    primary: '#ff3366',
                    secondary: '#00ff88',
                    accent: '#ffff00',
                    background: '#1a0a1a',
                    text: '#ffffff'
                }
            },
            matrix: {
                name: 'ম্যাট্রিক্স',
                colors: {
                    primary: '#00ff00',
                    secondary: '#008800',
                    accent: '#88ff88',
                    background: '#000000',
                    text: '#00ff00'
                }
            }
        };
        
        this.currentTheme = 'cyber';
        this.load();
    }
    
    load() {
        const saved = localStorage.getItem('nexusTheme');
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        }
        this.apply();
    }
    
    save() {
        localStorage.setItem('nexusTheme', this.currentTheme);
    }
    
    apply() {
        const theme = this.themes[this.currentTheme];
        
        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.colors.primary);
        root.style.setProperty('--secondary', theme.colors.secondary);
        root.style.setProperty('--accent', theme.colors.accent);
        root.style.setProperty('--bg-dark', theme.colors.background);
        root.style.setProperty('--text-primary', theme.colors.text);
        
        // Add theme class to body
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim();
        document.body.classList.add(`theme-${this.currentTheme}`);
        
        console.log('[Theme] Applied:', this.currentTheme);
    }
    
    setTheme(name) {
        if (this.themes[name]) {
            this.currentTheme = name;
            this.apply();
            this.save();
            return true;
        }
        return false;
    }
    
    getTheme() {
        return this.currentTheme;
    }
    
    getThemes() {
        return Object.entries(this.themes).map(([key, value]) => ({
            id: key,
            name: value.name,
            colors: value.colors
        }));
    }
    
    toggle() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.setTheme(themeNames[nextIndex]);
    }
}

// Export
window.themeManager = new ThemeManager();