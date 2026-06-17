/**
 * NEXUS AI - Configuration
 * কনফিগারেশন সেটিংস - সিকিউর API Key
 */

const Config = {
    // Gemini API - API Key Environment থেকে বা localStorage থেকে লোড হবে
    // ⚠️ কখনো কোডে সরাসরি API Key রাখবেন না!
    _apiKey: null,
    _apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // API Key গেট/সেট - সিকিউর ওয়ে
    get apiKey() {
        if (this._apiKey) return this._apiKey;
        // localStorage থেকে লোড করুন
        this._apiKey = localStorage.getItem('nexus_api_key');
        return this._apiKey;
    },
    
    set apiKey(value) {
        this._apiKey = value;
        if (value) {
            localStorage.setItem('nexus_api_key', value);
        } else {
            localStorage.removeItem('nexus_api_key');
        }
    },
    
    get apiUrl() {
        return this._apiUrl;
    },
    
    // API Key সেট করার সহজ ফাংশন
    setApiKey(key) {
        if (!key || key.trim() === '') {
            console.warn('[Config] Empty API key provided');
            return false;
        }
        this.apiKey = key.trim();
        console.log('[Config] API key saved securely');
        return true;
    },
    
    // API Key আছে কিনা চেক করুন
    hasApiKey() {
        return !!(this.apiKey && this.apiKey.length > 10);
    },
    
    // Voice Settings
    voice: {
        language: localStorage.getItem('voiceLanguage') || 'bn-BD',
        outputLanguage: localStorage.getItem('outputLanguage') || 'bn',
        wakeWord: localStorage.getItem('wakeWord') || 'হ্যালো নেক্সাস',
        recognitionLang: 'bn-BD',
        synthesisLang: 'bn-BD'
    },
    
    // AI Personality - কখনো AI বলবে না
    personality: {
        name: 'নেক্সাস',
        realName: 'আমি নেক্সাস, তোমার ব্যক্তিগত সহকারী',
        greeting: 'হ্যালো! আমি নেক্সাস, তোমার ব্যক্তিগত সহকারী। কিভাবে সাহায্য করতে পারি তোমার?',
        alwaysListen: false,
        respondInBengali: true,
        isHuman: true, // নিজেকে মানুষ মনে করে
        neverMentionAI: true
    },
    
    // Screen Capture
    screenCapture: {
        enabled: true,
        autoCapture: false,
        captureInterval: 5000
    },
    
    // Face Recognition
    faceRecognition: {
        enabled: true,
        confidenceThreshold: 0.7
    },
    
    // Automation
    automation: {
        enabled: true,
        confirmActions: false
    },
    
    // UI Settings
    ui: {
        theme: 'cyber',
        animationSpeed: 'normal',
        showCamera: true
    },
    
    // Load saved settings
    load() {
        const saved = localStorage.getItem('nexusConfig');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this, parsed);
            } catch (e) {
                console.error('Failed to load config:', e);
            }
        }
    },
    
    // Save settings
    save() {
        localStorage.setItem('nexusConfig', JSON.stringify(this));
    },
    
    // Update specific setting
    set(key, value) {
        const keys = key.split('.');
        let obj = this;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        this.save();
    }
};

// Load config on init
Config.load();
