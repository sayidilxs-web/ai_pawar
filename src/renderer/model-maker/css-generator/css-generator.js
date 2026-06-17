/**
 * NEXUS AI - CSS Generator Module
 * CSS কোড জেনারেটর
 */

class CSSGenerator {
    constructor() {
        this.themes = new Map();
        this.components = new Map();
        this.init();
    }
    
    init() {
        this.loadThemes();
        this.loadComponents();
        console.log('[CSS Generator] Initialized');
    }
    
    loadThemes() {
        // Dark Theme
        this.themes.set('dark', {
            name: 'Dark Theme',
            description: 'গাঢ় বাদামী ডার্ক থিম',
            css: `/* Dark Theme - NEXUS AI */
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #16213e;
    --text-primary: #e8e8f0;
    --text-secondary: #a0a0b0;
    --accent: #00f0ff;
    --accent-secondary: #ff00ff;
    --success: #00ff88;
    --warning: #ffaa00;
    --danger: #ff3366;
    --border: rgba(0, 240, 255, 0.2);
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Segoe UI', 'Noto Sans Bengali', sans-serif;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}`
        });
        
        // Light Theme
        this.themes.set('light', {
            name: 'Light Theme',
            description: 'হালকা উজ্জ্বল থিম',
            css: `/* Light Theme - NEXUS AI */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f7;
    --bg-tertiary: #e8e8ea;
    --text-primary: #1d1d1f;
    --text-secondary: #6e6e73;
    --accent: #0071e3;
    --accent-secondary: #5e5ce6;
    --success: #34c759;
    --warning: #ff9500;
    --danger: #ff3b30;
    --border: rgba(0, 0, 0, 0.1);
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}`
        });
        
        // Cyberpunk Theme
        this.themes.set('cyber', {
            name: 'Cyberpunk Theme',
            description: 'সাইবারপাঙ্ক থিম',
            css: `/* Cyberpunk Theme - NEXUS AI */
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #12121a;
    --text-primary: #e0e0e0;
    --cyan: #00f0ff;
    --magenta: #ff00ff;
    --gold: #ffa500;
    --neon-green: #00ff88;
    --glow-cyan: 0 0 20px rgba(0, 240, 255, 0.5);
    --glow-magenta: 0 0 20px rgba(255, 0, 255, 0.5);
}

body {
    background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%);
    color: var(--text-primary);
    font-family: 'Orbitron', 'Rajdhani', sans-serif;
}

.cyber-text {
    color: var(--cyan);
    text-shadow: 0 0 10px var(--cyan);
    text-transform: uppercase;
    letter-spacing: 3px;
}`
        });
        
        // Nature Theme
        this.themes.set('nature', {
            name: 'Nature Theme',
            description: 'প্রকৃতি থিম',
            css: `/* Nature Theme - NEXUS AI */
:root {
    --bg-primary: #f0f7f4;
    --bg-secondary: #d4e5d8;
    --text-primary: #2d3a2e;
    --text-secondary: #5a6b5c;
    --accent: #4a7c59;
    --accent-secondary: #8fbc8f;
    --success: #228b22;
    --warning: #daa520;
    --earth: #8b4513;
    --sky: #87ceeb;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Georgia', serif;
}`
        });
        
        // Ocean Theme
        this.themes.set('ocean', {
            name: 'Ocean Theme',
            description: 'সমুদ্র থিম',
            css: `/* Ocean Theme - NEXUS AI */
:root {
    --bg-primary: #0a1628;
    --bg-secondary: #1a3a5c;
    --text-primary: #e0f4ff;
    --text-secondary: #a0c4e8;
    --ocean-blue: #0077b6;
    --deep-blue: #023e8a;
    --aqua: #00b4d8;
    --coral: #ff6b6b;
}

body {
    background: linear-gradient(180deg, #0a1628 0%, #1a3a5c 100%);
    color: var(--text-primary);
    font-family: 'Helvetica Neue', Arial, sans-serif;
}`
        });
    }
    
    loadComponents() {
        // Button Component
        this.components.set('button', {
            name: 'Button',
            description: 'সুন্দর বাটন',
            css: `/* Button Component - NEXUS AI */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 240, 255, 0.4);
}

.btn-secondary {
    background: transparent;
    border: 2px solid var(--accent);
    color: var(--accent);
}

.btn-secondary:hover {
    background: var(--accent);
    color: white;
}

.btn-ghost {
    background: transparent;
    color: var(--text-primary);
}

.btn-ghost:hover {
    background: rgba(255, 255, 255, 0.1);
}`
        });
        
        // Card Component
        this.components.set('card', {
            name: 'Card',
            description: 'কার্ড কম্পোনেন্ট',
            css: `/* Card Component - NEXUS AI */
.card {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text-primary);
}

.card-body {
    color: var(--text-secondary);
    line-height: 1.6;
}

.card-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
}`
        });
        
        // Input Component
        this.components.set('input', {
            name: 'Input',
            description: 'ইনপুট ফিল্ড',
            css: `/* Input Component - NEXUS AI */
.input-group {
    margin-bottom: 20px;
}

.input-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
}

.input-field {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;
}

.input-field:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.2);
}

.input-field::placeholder {
    color: var(--text-muted);
}

.input-error {
    border-color: var(--danger);
}

.input-error-message {
    color: var(--danger);
    font-size: 12px;
    margin-top: 4px;
}`
        });
        
        // Navbar Component
        this.components.set('navbar', {
            name: 'Navbar',
            description: 'নেভিগেশন বার',
            css: `/* Navbar Component - NEXUS AI */
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    background: var(--bg-secondary);
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent);
    text-decoration: none;
}

.nav-links {
    display: flex;
    gap: 24px;
    list-style: none;
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: var(--accent);
}

.nav-link.active {
    color: var(--accent);
}`
        });
        
        // Grid Component
        this.components.set('grid', {
            name: 'Grid System',
            description: 'গ্রিড সিস্টেম',
            css: `/* Grid System - NEXUS AI */
.grid {
    display: grid;
    gap: 20px;
}

.grid-2 {
    grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
    grid-template-columns: repeat(4, 1fr);
}

.grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

@media (max-width: 768px) {
    .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
    }
}`
        });
        
        // Modal Component
        this.components.set('modal', {
            name: 'Modal',
            description: 'পপআপ মডাল',
            css: `/* Modal Component - NEXUS AI */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.modal {
    background: var(--bg-secondary);
    border-radius: 20px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.active .modal {
    transform: scale(1);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-secondary);
}`
        });
    }
    
    /**
     * Generate CSS for a theme
     */
    generateTheme(themeName) {
        const theme = this.themes.get(themeName);
        return theme ? theme.css : null;
    }
    
    /**
     * Generate CSS for a component
     */
    generateComponent(componentName) {
        const component = this.components.get(componentName);
        return component ? component.css : null;
    }
    
    /**
     * Get all themes
     */
    getThemes() {
        return Array.from(this.themes.entries()).map(([key, value]) => ({
            key,
            name: value.name,
            description: value.description
        }));
    }
    
    /**
     * Get all components
     */
    getComponents() {
        return Array.from(this.components.entries()).map(([key, value]) => ({
            key,
            name: value.name,
            description: value.description
        }));
    }
    
    /**
     * Generate complete CSS
     */
    generateComplete(config) {
        let css = '';
        
        // Add reset
        css += `/* CSS Reset */\n`;
        css += `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n\n`;
        
        // Add themes
        if (config.includeThemes) {
            this.themes.forEach((theme, key) => {
                if (config.theme === key) {
                    css += `/* ${theme.name} */\n`;
                    css += theme.css;
                    css += '\n\n';
                }
            });
        }
        
        // Add components
        if (config.includeComponents) {
            css += `/* Components */\n`;
            config.components?.forEach(comp => {
                const component = this.components.get(comp);
                if (component) {
                    css += `/* ${component.name} */\n`;
                    css += component.css;
                    css += '\n\n';
                }
            });
        }
        
        return css;
    }
}

// Create global instance
window.cssGenerator = new CSSGenerator();