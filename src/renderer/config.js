/**
 * NEXUS AI - Configuration
 * কনফিগারেশন সেটিংস
 */

const Config = {
    // Gemini API - প্রদত্ত API Key
    apiKey: 'AIzaSyAb8RN6LckFne4zHemjwbBhZtwAfKhLAgols',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
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
