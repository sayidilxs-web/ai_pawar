/**
 * NEXUS AI - Main Entry Point
 * ⚡ চোখের পলকে - No Heavy Models
 * সব সিস্টেম কানেক্ট করে একটি শক্তিশালী AI সহকারী তৈরি
 */

class NEXUS {
    constructor() {
        // Core Systems
        this.aiCore = null;
        this.neuralNetwork = null;
        this.smartLearning = null;
        this.autoStart = null;
        this.smartRemind = null;
        this.objectDetection = null;
        this.transactionPipeline = null;
        this.knowledgeBase = null;
        
        // ⚡ NEW LIGHT SYSTEMS
        this.brain = null;           // 🧠 Brain Integration
        this.cache = null;            // 📦 Light Cache
        this.scraper = null;         // 🌐 Web Scraper
        this.autoUpdate = null;       // 🔄 Auto Update
        this.search = null;          // 🔍 Smart Search
        
        // State
        this.isInitialized = false;
        this.isRunning = false;
        this.isThinking = false;
        
        // Configuration
        this.config = {
            // API Settings (Optional - এখন লাগবে না!)
            apiKey: null,
            apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            model: 'gemini-2.0-flash',
            
            // AI Settings
            personality: {
                name: 'নেক্সাস',
                greeting: 'হ্যালো! আমি নেক্সাস, তোমার ব্যক্তিগত সহকারী। কিভাবে সাহায্য করতে পারি?',
                alwaysListen: false,
                respondInBengali: true,
                neverMentionAI: true
            },
            
            // System Settings
            autoStart: true,
            smartLearning: true,
            objectDetection: true,
            transactionPipeline: true,
            
            // ⚡ Light Mode Settings
            lightMode: true,           // No Heavy Models
            useCache: true,            // Cache ব্যবহার করো
            autoUpdateEnabled: true     // অটো আপডেট চালু
        };
        
        // History
        this.conversationHistory = [];
        this.maxHistoryLength = 50;
        
        // Callbacks
        this.callbacks = {
            onInit: [],
            onThink: [],
            onResponse: [],
            onError: []
        };
    }

    // ==================== INITIALIZATION ====================

    async init(options = {}) {
        console.log('[NEXUS] Initializing...');
        
        // Merge config
        this.config = { ...this.config, ...options };
        
        // Load saved settings
        this.loadSettings();
        
        try {
            // ⚡ Initialize LIGHT SYSTEMS FIRST (এগুলো দ্রুত)
            this.initLightSystems();
            
            // Initialize Neural Network Core
            await this.initNeuralNetwork();
            
            // Initialize Knowledge Base (JSON ফাইল লোড করা)
            this.initKnowledgeBase();
            
            // Initialize Smart Learning
            this.initSmartLearning();
            
            // Initialize Auto-Start System
            this.initAutoStart();
            
            // Initialize Smart Remind
            this.initSmartRemind();
            
            // Initialize Object Detection
            this.initObjectDetection();
            
            // Initialize Transaction Pipeline
            this.initTransactionPipeline();
            
            // Initialize AI Core (Optional - এখন লাগবে না)
            if (this.config.apiKey) {
                this.initAICore();
            }
            
            this.isInitialized = true;
            
            // Auto-start if enabled
            if (this.config.autoStart) {
                await this.start();
            }
            
            // Emit init event
            this.emit('onInit', { success: true });
            
            console.log('[NEXUS] ✅ Initialization complete - LIGHT MODE!');
            console.log('[NEXUS] ⚡ স্পিড: চোখের পলকে!');
            console.log('[NEXUS] 📊 জ্ঞান বিভাগ:', window.nexusKnowledge ? Object.keys(window.nexusKnowledge.knowledge || {}).length : 0);
            return true;
            
        } catch (error) {
            console.error('[NEXUS] Initialization failed:', error);
            this.emit('onError', { type: 'init', error });
            return false;
        }
    }
    
    // ⚡ LIGHT SYSTEMS INITIALIZATION
    initLightSystems() {
        console.log('[NEXUS] ⚡ Initializing Light Systems...');
        
        // Cache
        if (window.nexusCache) {
            this.cache = window.nexusCache;
            console.log('[NEXUS] ✅ Cache connected');
        }
        
        // Scraper
        if (window.nexusScraper) {
            this.scraper = window.nexusScraper;
            console.log('[NEXUS] ✅ Scraper connected');
        }
        
        // Search
        if (window.nexusSearch) {
            this.search = window.nexusSearch;
            console.log('[NEXUS] ✅ Search connected');
        }
        
        // Auto Update
        if (window.nexusAutoUpdate) {
            this.autoUpdate = window.nexusAutoUpdate;
            if (this.config.autoUpdateEnabled) {
                this.autoUpdate.start();
            }
            console.log('[NEXUS] ✅ Auto Update connected');
        }
        
        // Brain
        if (window.nexusBrain) {
            this.brain = window.nexusBrain;
            console.log('[NEXUS] ✅ Brain connected');
        }
        
        console.log('[NEXUS] ⚡ Light Systems Ready!');
    }
    
    initKnowledgeBase() {
        console.log('[NEXUS] Initializing Knowledge Base...');
        
        // Knowledge Base লোড হওয়ার জন্য অপেক্ষা করো
        const checkKnowledgeBase = () => {
            if (window.nexusKnowledge && window.nexusKnowledge.initialized) {
                this.knowledgeBase = window.nexusKnowledge;
                console.log('[NEXUS] ✅ Knowledge Base ready');
                console.log('[NEXUS] 📚 মোট ক্যাটাগরি:', Object.keys(this.knowledgeBase.knowledge || {}).length);
            } else {
                setTimeout(checkKnowledgeBase, 50);
            }
        };
        
        checkKnowledgeBase();
    }

    initNeuralNetwork() {
        console.log('[NEXUS] Initializing Neural Network...');
        
        this.neuralNetwork = window.NEXUSCore;
        this.neuralNetwork.init();
        
        console.log('[NEXUS] Neural Network ready');
    }

    initSmartLearning() {
        console.log('[NEXUS] Initializing Smart Learning...');
        
        this.smartLearning = window.smartLearning;
        
        // Register learning callbacks
        this.smartLearning.on('learn', (data) => {
            console.log('[NEXUS] Learned pattern:', data);
        });
        
        console.log('[NEXUS] Smart Learning ready');
    }

    initAutoStart() {
        console.log('[NEXUS] Initializing Auto-Start...');
        
        this.autoStart = window.autoStart;
        
        // Register auto-start callbacks
        this.autoStart.on('startup', () => {
            console.log('[NEXUS] Auto-Start system running');
        });
        
        this.autoStart.on('crash', (info) => {
            this.emit('onError', { type: 'crash', info });
        });
        
        console.log('[NEXUS] Auto-Start ready');
    }

    initSmartRemind() {
        console.log('[NEXUS] Initializing Smart Remind...');
        
        this.smartRemind = window.smartRemind;
        
        // Register remind callbacks
        this.smartRemind.on('remind', (reminder) => {
            console.log('[NEXUS] Reminder triggered:', reminder.title);
        });
        
        this.smartRemind.on('complete', (reminder) => {
            console.log('[NEXUS] Reminder completed:', reminder.title);
        });
        
        console.log('[NEXUS] Smart Remind ready');
    }

    initObjectDetection() {
        console.log('[NEXUS] Initializing Object Detection...');
        
        this.objectDetection = window.objectDetection;
        
        console.log('[NEXUS] Object Detection ready');
    }

    initTransactionPipeline() {
        console.log('[NEXUS] Initializing Transaction Pipeline...');
        
        this.transactionPipeline = window.transactionPipeline;
        
        // Add custom stages for NEXUS
        this.transactionPipeline.registerStage('ai-process', {
            handler: async (data) => {
                // AI processing stage
                return {
                    ...data,
                    aiProcessed: true,
                    aiProcessedAt: Date.now()
                };
            },
            dependencies: ['transform'],
            priority: 5
        });
        
        // Register pipeline callbacks
        this.transactionPipeline.on('complete', (tx) => {
            console.log('[NEXUS] Transaction complete:', tx.id);
        });
        
        console.log('[NEXUS] Transaction Pipeline ready');
    }

    initAICore() {
        console.log('[NEXUS] Initializing AI Core...');
        
        this.aiCore = window.aiCore;
        
        if (this.aiCore) {
            if (this.config.apiKey) {
                this.aiCore.setApiKey(this.config.apiKey);
            }
        }
        
        console.log('[NEXUS] AI Core ready');
    }

    // ==================== START/STOP ====================

    async start() {
        if (this.isRunning) {
            console.log('[NEXUS] Already running');
            return true;
        }
        
        console.log('[NEXUS] Starting...');
        
        try {
            // Start Auto-Start system
            await this.autoStart.start();
            
            // Start Smart Remind system
            this.smartRemind.startChecking();
            
            this.isRunning = true;
            
            // Speak greeting
            this.speak(this.config.personality.greeting);
            
            console.log('[NEXUS] Started');
            return true;
            
        } catch (error) {
            console.error('[NEXUS] Start failed:', error);
            return false;
        }
    }

    async stop() {
        if (!this.isRunning) {
            return true;
        }
        
        console.log('[NEXUS] Stopping...');
        
        await this.autoStart.stop();
        this.smartRemind.stopChecking();
        this.transactionPipeline.pause();
        
        this.isRunning = false;
        
        console.log('[NEXUS] Stopped');
        return true;
    }

    // ==================== THINK & RESPOND ====================

    async think(input) {
        if (this.isThinking) {
            return null;
        }
        
        this.isThinking = true;
        this.emit('onThink', { input });
        
        try {
            // Add to conversation history
            this.addToHistory('user', input);
            
            // Get AI response - ⚡ প্রায়োরিটি অনুযায়ী
            let response;
            
            // ১. ⚡ Brain ব্যবহার করো (সবচেয়ে দ্রুত)
            if (this.brain && this.brain.ready) {
                response = await this.brain.think(input);
            }
            // ২. API ব্যবহার করো (যদি কী থাকে)
            else if (this.aiCore && this.config.apiKey) {
                response = await this.aiCore.generateResponse(input, this.getContext());
            }
            // ৩. Smart Response (ফলব্যাক)
            else {
                response = this.generateSmartResponse(input);
            }
            
            // Add to history
            this.addToHistory('assistant', response);
            
            // Learn from interaction
            if (this.config.smartLearning) {
                this.smartLearning.learnPattern(input, response, this.evaluateResponse(response));
            }
            
            this.isThinking = false;
            this.emit('onResponse', { input, response });
            
            return response;
            
        } catch (error) {
            console.error('[NEXUS] Think error:', error);
            this.isThinking = false;
            this.emit('onError', { type: 'think', error });
            
            return 'দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
        }
    }

    // ⚡ Smart Response Generator (চোখের পলকে)
    generateSmartResponse(input) {
        const lowerInput = input.toLowerCase();
        
        // Time queries
        if (lowerInput.includes('সময়') || lowerInput.includes('time') || lowerInput.includes('কতটা')) {
            return `⏰ এখন সময়: ${new Date().toLocaleTimeString('bn-BD')}`;
        }
        
        // Date queries
        if (lowerInput.includes('তারিখ') || lowerInput.includes('date') || lowerInput.includes('কোন দিন')) {
            return `📅 আজ: ${new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
        
        // Greetings
        if (lowerInput.includes('হ্যালো') || lowerInput.includes('আসসালাম') || lowerInput.includes('hello') || lowerInput.includes('হাই')) {
            return '👋 হ্যালো! আমি নেক্সাস। কেমন আছেন? কিভাবে সাহায্য করতে পারি? 🤖';
        }
        
        // Weather
        if (lowerInput.includes('আবহাওয়া') || lowerInput.includes('weather') || lowerInput.includes('বৃষ্টি')) {
            const weather = this.cache?.getTagged('weather', 'Dhaka');
            if (weather) {
                return `🌤️ আবহাওয়া: ${weather.city}\n🌡️ তাপমাত্রা: ${weather.temp_C}°C\n💧 আর্দ্রতা: ${weather.humidity}%\n☁️ ${weather.condition}`;
            }
            return '🌤️ আবহাওয়া লোড হচ্ছে...';
        }
        
        // Help
        if (lowerInput.includes('সাহায্য') || lowerInput.includes('help') || lowerInput.includes('কি কর')) {
            return `🤖 আমি নেক্সাস! আমি করতে পারি:\n\n🌤️ আবহাওয়া জানাতে\n📰 সংবাদ দেখাতে\n₿ ক্রিপ্টো দাম বলতে\n📚 যেকোনো বিষয়ে জানাতে\n💻 কোডিং সাহায্য করতে\n\nবলুন কি জানতে চান!`;
        }
        
        // Knowledge Base সার্চ করা
        if (this.knowledgeBase) {
            const kbResults = this.knowledgeBase.search(input);
            if (kbResults && kbResults.length > 0) {
                return kbResults[0];
            }
        }
        
        // Neural Network Context
        if (window.NEXUSCore && window.NEXUSCore.embeddings) {
            const context = window.NEXUSCore.getContextEmbedding(input);
            if (context.score > 0.1) {
                console.log(`[NEXUS] Context: ${context.category} (${context.score.toFixed(3)})`);
            }
        }
        
        // Default
        return 'আমি বুঝতে পেরেছি। বলুন কি জানতে চান? 😊';
    }

    evaluateResponse(response) {
        // Simple evaluation based on response characteristics
        let score = 0.5;
        
        if (response && response.length > 20) score += 0.1;
        if (response && response.length < 500) score += 0.1;
        if (response && !response.includes('দুঃখিত')) score += 0.2;
        
        return Math.min(1, Math.max(0, score));
    }

    // ==================== CONTEXT ====================

    getContext() {
        return {
            recentActions: this.conversationHistory.slice(-5).map(h => h.content.substring(0, 50)),
            learningStats: this.smartLearning?.getStats(),
            systemStatus: this.getStatus()
        };
    }

    // ==================== COMMANDS ====================

    async execute(command) {
        console.log('[NEXUS] Executing command:', command);
        
        // Parse command
        const parsed = this.parseCommand(command);
        
        switch (parsed.type) {
            case 'remind':
                return this.smartRemind.createSmartReminder(parsed.content);
                
            case 'search':
                return await this.search(parsed.content);
                
            case 'calculate':
                return this.calculate(parsed.expression);
                
            case 'detect':
                return await this.objectDetection.detect(parsed.image);
                
            case 'learn':
                return this.smartLearning.learnPattern(parsed.input, parsed.output, parsed.reward);
                
            default:
                return await this.think(command);
        }
    }

    parseCommand(command) {
        const lower = command.toLowerCase();
        
        // Remind command
        if (lower.startsWith('রিমাইন্ডার') || lower.startsWith('মনে করিয়ে দাও') || lower.startsWith('remind')) {
            return {
                type: 'remind',
                content: command.replace(/^(রিমাইন্ডার|মনে করিয়ে দাও|remind)\s*/i, '')
            };
        }
        
        // Search command
        if (lower.startsWith('সার্চ') || lower.startsWith('খুঁজে দাও') || lower.startsWith('search')) {
            return {
                type: 'search',
                content: command.replace(/^(সার্চ|খুঁজে দাও|search)\s*/i, '')
            };
        }
        
        // Calculate command
        if (lower.startsWith('গণনা') || lower.startsWith('হিসাব') || lower.startsWith('calculate')) {
            return {
                type: 'calculate',
                expression: command.replace(/^(গণনা|হিসাব|calculate)\s*/i, '')
            };
        }
        
        // Detect command
        if (lower.startsWith('শনাক্ত') || lower.startsWith('detect')) {
            return {
                type: 'detect',
                image: parsed.image
            };
        }
        
        // Default
        return { type: 'think', content: command };
    }

    async search(query) {
        console.log('[NEXUS] Searching:', query);
        
        // Open search in new tab or navigate
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        
        if (window.nexusAutomation) {
            await window.nexusAutomation.openUrl(searchUrl);
        }
        
        return `খুঁজছি: ${query}`;
    }

    calculate(expression) {
        try {
            // Simple math evaluation (be careful with eval)
            const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
            const result = Function('"use strict"; return (' + sanitized + ')')();
            return `ফলাফল: ${result}`;
        } catch (e) {
            return 'গণনা করতে পারিনি।';
        }
    }

    // ==================== SPEECH ====================

    speak(text) {
        if (!text) return;
        
        if (window.voiceSynthesis) {
            window.voiceSynthesis.speak(text);
        } else if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'bn-BD';
            utterance.rate = 0.95;
            speechSynthesis.speak(utterance);
        }
    }

    listen() {
        if (window.voiceRecognition) {
            window.voiceRecognition.start();
        }
    }

    stopListening() {
        if (window.voiceRecognition) {
            window.voiceRecognition.stop();
        }
    }

    // ==================== HISTORY ====================

    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
        
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory.shift();
        }
        
        this.saveHistory();
    }

    saveHistory() {
        try {
            localStorage.setItem('nexus_conversation_history', JSON.stringify(this.conversationHistory));
        } catch (e) {
            console.error('[NEXUS] History save failed:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('nexus_conversation_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('[NEXUS] History load failed:', e);
        }
    }

    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('nexus_conversation_history');
    }

    // ==================== SETTINGS ====================

    loadSettings() {
        try {
            const saved = localStorage.getItem('nexus_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings };
            }
        } catch (e) {
            console.error('[NEXUS] Settings load failed:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('nexus_settings', JSON.stringify(this.config));
        } catch (e) {
            console.error('[NEXUS] Settings save failed:', e);
        }
    }

    setApiKey(key) {
        this.config.apiKey = key;
        if (this.aiCore) {
            this.aiCore.setApiKey(key);
        }
        this.saveSettings();
    }

    // ==================== STATUS ====================

    getStatus() {
        return {
            initialized: this.isInitialized,
            running: this.isRunning,
            thinking: this.isThinking,
            
            smartLearning: this.smartLearning?.getStats(),
            autoStart: this.autoStart?.getStatus(),
            smartRemind: this.smartRemind?.getStats(),
            objectDetection: this.objectDetection?.getStats(),
            transactionPipeline: this.transactionPipeline?.getStats(),
            
            conversationLength: this.conversationHistory.length
        };
    }

    // ==================== EVENTS ====================

    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            for (const callback of this.callbacks[event]) {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`[NEXUS] Callback error: ${event}`, e);
                }
            }
        }
    }

    // ==================== UTILITIES ====================

    reset() {
        this.stop();
        
        this.conversationHistory = [];
        this.smartLearning?.reset();
        this.objectDetection?.reset();
        this.transactionPipeline?.reset();
        
        localStorage.removeItem('nexus_settings');
        localStorage.removeItem('nexus_conversation_history');
        
        console.log('[NEXUS] Reset complete');
    }
}

// Create global instance
window.NEXUS = NEXUS;
window.nexus = new NEXUS();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NEXUS] Document ready, use nexus.init() to start');
});

console.log('[NEXUS] Main module loaded. Version 1.0.0');
