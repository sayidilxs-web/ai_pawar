/**
 * NEXUS AI - API Handler
 * API হ্যান্ডলার
 */

class APIHandler {
    constructor() {
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.model = 'gemini-2.0-flash';
        this.apiKey = null;
        this.timeout = 30000;
        this.retries = 3;
        this.retryDelay = 1000;
    }
    
    setApiKey(key) {
        this.apiKey = key;
    }
    
    setModel(model) {
        this.model = model;
    }
    
    async request(endpoint, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }
        
        const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: this.timeout
        };
        
        const config = { ...defaultOptions, ...options };
        
        return this.fetchWithRetry(url, config);
    }
    
    async fetchWithRetry(url, config, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (attempt < this.retries && this.shouldRetry(error)) {
                console.log(`[API] Retry ${attempt}/${this.retries}...`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(url, config, attempt + 1);
            }
            throw error;
        }
    }
    
    shouldRetry(error) {
        // Retry on network errors or 5xx errors
        if (error.name === 'AbortError') return true;
        if (error.message?.includes('network') || error.message?.includes('fetch')) return true;
        return false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Generate content
    async generateContent(prompt, options = {}) {
        const {
            temperature = 0.9,
            maxTokens = 2048,
            topP = 0.95,
            topK = 40
        } = options;
        
        const response = await this.request(
            `${this.model}:generateContent`,
            {
                method: 'POST',
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens: maxTokens,
                        topP,
                        topK
                    }
                })
            }
        );
        
        if (response.candidates && response.candidates[0]) {
            return response.candidates[0].content.parts[0].text;
        }
        
        throw new Error('No response from API');
    }
    
    // Chat completion
    async chat(messages, options = {}) {
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        const response = await this.request(
            `${this.model}:generateContent`,
            {
                method: 'POST',
                body: JSON.stringify({
                    contents: formattedMessages,
                    generationConfig: {
                        temperature: options.temperature || 0.9,
                        maxOutputTokens: options.maxTokens || 2048
                    }
                })
            }
        );
        
        if (response.candidates && response.candidates[0]) {
            return response.candidates[0].content.parts[0].text;
        }
        
        throw new Error('No response from API');
    }
    
    // Count tokens
    async countTokens(text) {
        const response = await this.request(
            `${this.model}:countTokens`,
            {
                method: 'POST',
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text }]
                    }]
                })
            }
        );
        
        return response.totalTokens || 0;
    }
}

// Export
window.apiHandler = new APIHandler();