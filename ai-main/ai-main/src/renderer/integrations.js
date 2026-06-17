/**
 * 🔌 NEXUS AI - Integrations Manager
 * থার্ড-পার্টি সার্ভিস ইন্টিগ্রেশন
 */

class IntegrationsManager {
    constructor() {
        this.integrations = new Map();
        this.activeConnections = new Map();
        
        // Available integrations
        this.available = {
            github: {
                name: 'GitHub',
                icon: '🐙',
                description: 'GitHub repositories এবং PRs',
                fields: ['token', 'username']
            },
            gmail: {
                name: 'Gmail',
                icon: '📧',
                description: 'ইমেইল পাঠানো এবং পড়া',
                fields: ['email', 'apiKey']
            },
            telegram: {
                name: 'Telegram',
                icon: '✈️',
                description: 'বট এবং মেসেজ',
                fields: ['botToken', 'chatId']
            },
            whatsapp: {
                name: 'WhatsApp',
                icon: '📱',
                description: 'WhatsApp Business API',
                fields: ['phoneNumber', 'apiKey']
            },
            google_sheets: {
                name: 'Google Sheets',
                icon: '📊',
                description: 'স্প্রেডশিট অটোমেশন',
                fields: ['credentials', 'spreadsheetId']
            },
            notion: {
                name: 'Notion',
                icon: '📝',
                description: 'Notes এবং Database',
                fields: ['token', 'workspaceId']
            },
            slack: {
                name: 'Slack',
                icon: '💬',
                description: 'Slack workspace',
                fields: ['token', 'channel']
            },
            spotify: {
                name: 'Spotify',
                icon: '🎵',
                description: 'মিউজিক কন্ট্রোল',
                fields: ['clientId', 'clientSecret']
            },
            openweather: {
                name: 'OpenWeather',
                icon: '🌤️',
                description: 'আবহাওয়া তথ্য',
                fields: ['apiKey', 'city']
            },
            currency: {
                name: 'Currency API',
                icon: '💱',
                description: 'কারেন্সি রূপান্তর',
                fields: ['apiKey']
            }
        };
        
        this.loadConnections();
    }

    /**
     * Initialize integrations
     */
    init() {
        console.log('[Integrations] Initializing...');
        
        // Initialize saved connections
        this.activeConnections.forEach((config, id) => {
            this.initializeIntegration(id);
        });
        
        return true;
    }

    /**
     * Get available integrations
     */
    getAvailable() {
        return Object.entries(this.available).map(([id, data]) => ({
            id,
            ...data,
            connected: this.activeConnections.has(id)
        }));
    }

    /**
     * Connect integration
     */
    async connect(integrationId, credentials) {
        const integration = this.available[integrationId];
        if (!integration) {
            throw new Error('Unknown integration');
        }
        
        console.log(`[Integrations] Connecting ${integration.name}...`);
        
        try {
            // Validate credentials
            const isValid = await this.validateCredentials(integrationId, credentials);
            
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
            
            // Save connection
            const config = {
                id: integrationId,
                credentials,
                connectedAt: new Date().toISOString(),
                status: 'active'
            };
            
            this.activeConnections.set(integrationId, config);
            this.saveConnections();
            
            // Initialize
            await this.initializeIntegration(integrationId);
            
            console.log(`[Integrations] Connected: ${integration.name}`);
            return true;
            
        } catch (error) {
            console.error(`[Integrations] Connect error:`, error);
            return false;
        }
    }

    /**
     * Validate credentials
     */
    async validateCredentials(integrationId, credentials) {
        switch (integrationId) {
            case 'openweather':
                // Test API key
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?q=${credentials.city || 'Dhaka'}&appid=${credentials.apiKey}`
                    );
                    return response.ok;
                } catch {
                    return false;
                }
                
            case 'currency':
                // Test currency API
                return !!credentials.apiKey;
                
            case 'github':
                // Test token
                return !!credentials.token;
                
            default:
                // Assume valid for other integrations
                return true;
        }
    }

    /**
     * Initialize connected integration
     */
    async initializeIntegration(integrationId) {
        const config = this.activeConnections.get(integrationId);
        if (!config) return;
        
        switch (integrationId) {
            case 'openweather':
                this.integrations.set(integrationId, new WeatherIntegration(config));
                break;
            case 'currency':
                this.integrations.set(integrationId, new CurrencyIntegration(config));
                break;
            case 'github':
                this.integrations.set(integrationId, new GitHubIntegration(config));
                break;
            default:
                this.integrations.set(integrationId, new GenericIntegration(config));
        }
    }

    /**
     * Disconnect integration
     */
    disconnect(integrationId) {
        this.activeConnections.delete(integrationId);
        this.integrations.delete(integrationId);
        this.saveConnections();
        console.log(`[Integrations] Disconnected: ${integrationId}`);
    }

    /**
     * Get integration instance
     */
    get(integrationId) {
        return this.integrations.get(integrationId);
    }

    /**
     * Execute integration action
     */
    async execute(integrationId, action, params) {
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            throw new Error('Integration not connected');
        }
        
        if (typeof integration[action] !== 'function') {
            throw new Error(`Unknown action: ${action}`);
        }
        
        return await integration[action](params);
    }

    /**
     * Save connections to localStorage
     */
    saveConnections() {
        const data = Array.from(this.activeConnections.entries());
        localStorage.setItem('nexusIntegrations', JSON.stringify(data));
    }

    /**
     * Load connections from localStorage
     */
    loadConnections() {
        const saved = localStorage.getItem('nexusIntegrations');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                data.forEach(([id, config]) => {
                    this.activeConnections.set(id, config);
                });
            } catch (e) {
                console.error('[Integrations] Load error:', e);
            }
        }
    }

    /**
     * Get all connected integrations
     */
    getConnected() {
        return Array.from(this.activeConnections.entries()).map(([id, config]) => ({
            id,
            name: this.available[id]?.name || id,
            icon: this.available[id]?.icon || '🔌',
            connectedAt: config.connectedAt,
            status: config.status
        }));
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            total: Object.keys(this.available).length,
            connected: this.activeConnections.size,
            integrations: this.getConnected()
        };
    }
}

/**
 * Weather Integration
 */
class WeatherIntegration {
    constructor(config) {
        this.config = config;
    }
    
    async getCurrentWeather(city = 'Dhaka') {
        const { apiKey } = this.config.credentials;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        return response.json();
    }
    
    async getForecast(city = 'Dhaka', days = 5) {
        const { apiKey } = this.config.credentials;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        return response.json();
    }
}

/**
 * Currency Integration
 */
class CurrencyIntegration {
    constructor(config) {
        this.config = config;
    }
    
    async getExchangeRate(from, to) {
        const { apiKey } = this.config.credentials;
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`
        );
        const data = await response.json();
        return { from, to, rate: data.conversion_rates?.[to] };
    }
    
    async convert(amount, from, to) {
        const rate = await this.getExchangeRate(from, to);
        return amount * rate.rate;
    }
}

/**
 * GitHub Integration
 */
class GitHubIntegration {
    constructor(config) {
        this.config = config;
        this.token = config.credentials.token;
        this.username = config.credentials.username;
    }
    
    async getRepos() {
        const response = await fetch('https://api.github.com/user/repos', {
            headers: { 'Authorization': `token ${this.token}` }
        });
        return response.json();
    }
    
    async createIssue(owner, repo, title, body) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body })
        });
        return response.json();
    }
}

/**
 * Generic Integration
 */
class GenericIntegration {
    constructor(config) {
        this.config = config;
    }
    
    async call(action, params) {
        console.log(`[Generic] ${action}:`, params);
        return { success: true };
    }
}

// Export
window.IntegrationsManager = IntegrationsManager;
window.integrations = new IntegrationsManager();

console.log('[Integrations] Manager initialized');