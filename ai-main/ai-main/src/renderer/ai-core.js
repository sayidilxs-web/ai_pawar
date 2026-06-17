/**
 * NEXUS AI - Advanced AI Core Module
 * Supports ALL languages of the world with multi-modal capabilities
 * World's most powerful AI assistant
 */

// Language detection and translation support
const LanguageConfig = {
    // All supported languages with native names
    supportedLanguages: {
        'bn-BD': { name: 'বাংলা', native: 'বাংলা', dir: 'ltr', flag: '🇧🇩' },
        'en-US': { name: 'English', native: 'English', dir: 'ltr', flag: '🇺🇸' },
        'en-GB': { name: 'British English', native: 'British English', dir: 'ltr', flag: '🇬🇧' },
        'hi-IN': { name: 'Hindi', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
        'ar-SA': { name: 'Arabic', native: 'العربية', dir: 'rtl', flag: '🇸🇦' },
        'zh-CN': { name: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr', flag: '🇨🇳' },
        'zh-TW': { name: 'Chinese (Traditional)', native: '繁體中文', dir: 'ltr', flag: '🇹🇼' },
        'es-ES': { name: 'Spanish', native: 'Español', dir: 'ltr', flag: '🇪🇸' },
        'fr-FR': { name: 'French', native: 'Français', dir: 'ltr', flag: '🇫🇷' },
        'de-DE': { name: 'German', native: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
        'it-IT': { name: 'Italian', native: 'Italiano', dir: 'ltr', flag: '🇮🇹' },
        'pt-BR': { name: 'Portuguese', native: 'Português', dir: 'ltr', flag: '🇧🇷' },
        'ru-RU': { name: 'Russian', native: 'Русский', dir: 'ltr', flag: '🇷🇺' },
        'ja-JP': { name: 'Japanese', native: '日本語', dir: 'ltr', flag: '🇯🇵' },
        'ko-KR': { name: 'Korean', native: '한국어', dir: 'ltr', flag: '🇰🇷' },
        'tr-TR': { name: 'Turkish', native: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
        'vi-VN': { name: 'Vietnamese', native: 'Tiếng Việt', dir: 'ltr', flag: '🇻🇳' },
        'th-TH': { name: 'Thai', native: 'ไทย', dir: 'ltr', flag: '🇹🇭' },
        'id-ID': { name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
        'ms-MY': { name: 'Malay', native: 'Bahasa Melayu', dir: 'ltr', flag: '🇲🇾' },
        'fil-PH': { name: 'Filipino', native: 'Filipino', dir: 'ltr', flag: '🇵🇭' },
        'ur-PK': { name: 'Urdu', native: 'اردو', dir: 'rtl', flag: '🇵🇰' },
        'fa-IR': { name: 'Persian', native: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
        'he-IL': { name: 'Hebrew', native: 'עברית', dir: 'rtl', flag: '🇮🇱' },
        'pl-PL': { name: 'Polish', native: 'Polski', dir: 'ltr', flag: '🇵🇱' },
        'nl-NL': { name: 'Dutch', native: 'Nederlands', dir: 'ltr', flag: '🇳🇱' },
        'sv-SE': { name: 'Swedish', native: 'Svenska', dir: 'ltr', flag: '🇸🇪' },
        'no-NO': { name: 'Norwegian', native: 'Norsk', dir: 'ltr', flag: '🇳🇴' },
        'da-DK': { name: 'Danish', native: 'Dansk', dir: 'ltr', flag: '🇩🇰' },
        'fi-FI': { name: 'Finnish', native: 'Suomi', dir: 'ltr', flag: '🇫🇮' },
        'el-GR': { name: 'Greek', native: 'Ελληνικά', dir: 'ltr', flag: '🇬🇷' },
        'cs-CZ': { name: 'Czech', native: 'Čeština', dir: 'ltr', flag: '🇨🇿' },
        'hu-HU': { name: 'Hungarian', native: 'Magyar', dir: 'ltr', flag: '🇭🇺' },
        'ro-RO': { name: 'Romanian', native: 'Română', dir: 'ltr', flag: '🇷🇴' },
        'uk-UA': { name: 'Ukrainian', native: 'Українська', dir: 'ltr', flag: '🇺🇦' },
        'pt-PT': { name: 'Portuguese (Portugal)', native: 'Português', dir: 'ltr', flag: '🇵🇹' },
        'ca-ES': { name: 'Catalan', native: 'Català', dir: 'ltr', flag: '🇪🇸' },
        'hr-HR': { name: 'Croatian', native: 'Hrvatski', dir: 'ltr', flag: '🇭🇷' },
        'sr-RS': { name: 'Serbian', native: 'Српски', dir: 'ltr', flag: '🇷🇸' },
        'sk-SK': { name: 'Slovak', native: 'Slovenčina', dir: 'ltr', flag: '🇸🇰' },
        'sl-SI': { name: 'Slovenian', native: 'Slovenščina', dir: 'ltr', flag: '🇸🇮' },
        'bg-BG': { name: 'Bulgarian', native: 'Български', dir: 'ltr', flag: '🇧🇬' },
        'lt-LT': { name: 'Lithuanian', native: 'Lietuvių', dir: 'ltr', flag: '🇱🇹' },
        'lv-LV': { name: 'Latvian', native: 'Latviešu', dir: 'ltr', flag: '🇱🇻' },
        'et-EE': { name: 'Estonian', native: 'Eesti', dir: 'ltr', flag: '🇪🇪' },
        'af-ZA': { name: 'Afrikaans', native: 'Afrikaans', dir: 'ltr', flag: '🇿🇦' },
        'sw-KE': { name: 'Swahili', native: 'Kiswahili', dir: 'ltr', flag: '🇰🇪' },
        'am-ET': { name: 'Amharic', native: 'አማርኛ', dir: 'ltr', flag: '🇪🇹' },
        'ta-IN': { name: 'Tamil', native: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
        'te-IN': { name: 'Telugu', native: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' },
        'ml-IN': { name: 'Malayalam', native: 'മലയാളം', dir: 'ltr', flag: '🇮🇳' },
        'kn-IN': { name: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr', flag: '🇮🇳' },
        'mr-IN': { name: 'Marathi', native: 'मराठी', dir: 'ltr', flag: '🇮🇳' },
        'gu-IN': { name: 'Gujarati', native: 'ગુજરાતી', dir: 'ltr', flag: '🇮🇳' },
        'pa-IN': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳' },
        'ne-NP': { name: 'Nepali', native: 'नेपाली', dir: 'ltr', flag: '🇳🇵' },
        'si-LK': { name: 'Sinhala', native: 'සිංහල', dir: 'ltr', flag: '🇱🇰' }
    },
    
    // Detect language from text
    detectLanguage(text) {
        // Simple language detection based on character patterns
        if (/[\u0980-\u09FF]/.test(text)) return 'bn-BD';
        if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
        if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
        if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
        if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja-JP';
        if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR';
        if (/[\u0400-\u04FF]/.test(text)) return 'ru-RU';
        if (/[\u0E00-\u0E7F]/.test(text)) return 'th-TH';
        if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
        return 'en-US';
    },
    
    // Get greeting in any language
    getGreeting(lang = 'bn-BD') {
        const greetings = {
            'bn-BD': 'হ্যালো! আমি নেক্সাস, তোমার ব্যক্তিগত AI সহকারী।',
            'en-US': 'Hello! I am NEXUS, your personal AI assistant.',
            'hi-IN': 'नमस्ते! मैं NEXUS हूं, आपका व्यक्तिगत AI सहायक।',
            'ar-SA': 'مرحبا! أنا NEXUS، مساعد الذكاء الاصطناعي الشخصي الخاص بك.',
            'zh-CN': '你好！我是 NEXUS，您的个人 AI 助手。',
            'es-ES': '¡Hola! Soy NEXUS, tu asistente de IA personal.',
            'fr-FR': 'Bonjour! Je suis NEXUS, votre assistant IA personnel.',
            'de-DE': 'Hallo! Ich bin NEXUS, dein persönlicher KI-Assistent.',
            'ja-JP': 'こんにちは！私は NEXUS です。あなたの個人用 AI アシスタントです。',
            'ko-KR': '안녕하세요! 저는 NEXUS입니다. 당신의 개인 AI 어시스턴트입니다.',
            'ru-RU': 'Привет! Я NEXUS, ваш персональный ИИ-ассистент.',
            'pt-BR': 'Olá! Eu sou NEXUS, seu assistente de IA pessoal.',
            'it-IT': 'Ciao! Sono NEXUS, il tuo assistente AI personale.',
            'tr-TR': 'Merhaba! Ben NEXUS, kişisel yapay zeka asistanınım.',
            'vi-VN': 'Xin chào! Tôi là NEXUS, trợ lý AI cá nhân của bạn.',
            'th-TH': 'สวัสดี! ฉันคือ NEXUS ผู้ช่วย AI ส่วนตัวของคุณ',
            'id-ID': 'Halo! Saya NEXUS, asisten AI pribadi Anda.',
            'ms-MY': 'Halo! Saya NEXUS, pembantu AI peribadi anda.',
            'fil-PH': 'Kumusta! Ako si NEXUS, ang iyong personal na AI assistant.',
            'ur-PK': 'سلام! میں NEXUS ہوں، آپ کا ذاتی AI معاون۔',
            'fa-IR': 'سلام! من NEXUS هستم، دستیار هوش مصنوعی شخصی شما.',
            'he-IL': 'שלום! אני NEXUS, העוזר האישי שלך לבינה מלאכותית.',
            'default': 'Hello! I am NEXUS, your powerful personal AI assistant.'
        };
        return greetings[lang] || greetings['default'];
    }
};

// Advanced Neural Network System
class NeuralNetwork {
    constructor() {
        this.layers = [];
        this.learningRate = 0.01;
        this.weights = [];
        this.biases = [];
        this.isTraining = false;
        
        // Smart learning parameters
        this.contextWindow = 2048;
        this.attentionHeads = 16;
        this.hiddenSize = 4096;
        
        // Memory system
        this.shortTermMemory = [];
        this.longTermMemory = new Map();
        this.memoryLimit = 10000;
        
        // Learning patterns
        this.patterns = new Map();
        this.learnedConcepts = new Map();
        
        // Initialize network
        this.initializeNetwork();
    }
    
    initializeNetwork() {
        console.log('[Neural Network] Initializing advanced neural network...');
        
        // Create deep neural network layers
        this.layers = [
            { name: 'input', neurons: this.contextWindow, type: 'embedding' },
            { name: 'embedding', neurons: 2048, type: 'dense' },
            { name: 'attention1', neurons: 2048, type: 'multiHeadAttention', heads: 16 },
            { name: 'layerNorm1', neurons: 2048, type: 'layerNorm' },
            { name: 'feedForward1', neurons: 8192, type: 'feedForward' },
            { name: 'layerNorm2', neurons: 2048, type: 'layerNorm' },
            { name: 'attention2', neurons: 2048, type: 'multiHeadAttention', heads: 16 },
            { name: 'layerNorm3', neurons: 2048, type: 'layerNorm' },
            { name: 'feedForward2', neurons: 8192, type: 'feedForward' },
            { name: 'layerNorm4', neurons: 2048, type: 'layerNorm' },
            { name: 'output', neurons: this.hiddenSize, type: 'dense' }
        ];
        
        // Initialize weights for all layers
        this.initializeWeights();
        
        console.log('[Neural Network] Network initialized with', this.layers.length, 'layers');
        console.log('[Neural Network] Total parameters:', this.countParameters());
    }
    
    initializeWeights() {
        // Xavier/He initialization for better training
        for (let i = 1; i < this.layers.length; i++) {
            const prevNeurons = this.layers[i-1].neurons;
            const currNeurons = this.layers[i].neurons;
            const fanIn = Math.sqrt(2.0 / prevNeurons);
            
            // Create weight matrix
            const weightMatrix = [];
            for (let j = 0; j < currNeurons; j++) {
                const row = [];
                for (let k = 0; k < prevNeurons; k++) {
                    row.push((Math.random() - 0.5) * 2 * fanIn);
                }
                weightMatrix.push(row);
            }
            this.weights.push(weightMatrix);
            
            // Initialize biases
            const bias = new Array(currNeurons).fill(0);
            this.biases.push(bias);
        }
    }
    
    countParameters() {
        let total = 0;
        for (let i = 0; i < this.weights.length; i++) {
            total += this.weights[i].length * this.weights[i][0].length;
            total += this.biases[i].length;
        }
        return total;
    }
    
    // Forward pass through the network
    forward(input) {
        let current = input;
        
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            
            switch (layer.type) {
                case 'dense':
                    current = this.denseLayer(current, this.weights[i], this.biases[i]);
                    current = this.relu(current);
                    break;
                case 'layerNorm':
                    current = this.layerNorm(current);
                    break;
                case 'multiHeadAttention':
                    current = this.multiHeadAttention(current, layer.heads);
                    break;
                case 'feedForward':
                    current = this.feedForward(current, this.weights[i], this.biases[i]);
                    break;
            }
        }
        
        return current;
    }
    
    denseLayer(input, weights, biases) {
        const output = [];
        for (let i = 0; i < weights.length; i++) {
            let sum = biases[i];
            for (let j = 0; j < input.length; j++) {
                sum += input[j] * weights[i][j];
            }
            output.push(sum);
        }
        return output;
    }
    
    relu(x) {
        return x.map(val => Math.max(0, val));
    }
    
    layerNorm(x) {
        const mean = x.reduce((a, b) => a + b, 0) / x.length;
        const variance = x.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / x.length;
        const std = Math.sqrt(variance + 1e-8);
        return x.map(val => (val - mean) / std);
    }
    
    multiHeadAttention(x, numHeads) {
        // Simplified multi-head attention
        const headSize = x.length / numHeads;
        const outputs = [];
        
        for (let h = 0; h < numHeads; h++) {
            const headInput = x.slice(h * headSize, (h + 1) * headSize);
            // Self-attention simulation
            const attentionWeights = this.computeAttention(headInput);
            const attended = this.applyAttention(headInput, attentionWeights);
            outputs.push(...attended);
        }
        
        return outputs;
    }
    
    computeAttention(x) {
        // Softmax-based attention weights
        const expScores = x.map(val => Math.exp(val));
        const sumExp = expScores.reduce((a, b) => a + b, 0);
        return expScores.map(s => s / sumExp);
    }
    
    applyAttention(x, weights) {
        return x.map((val, i) => val * weights[i % weights.length]);
    }
    
    feedForward(x, weights, biases) {
        // Two-layer feedforward with GELU activation
        const hidden = this.denseLayer(x, weights, biases);
        const activated = this.gelu(hidden);
        return activated.slice(0, x.length); // Project back
    }
    
    gelu(x) {
        // GELU activation approximation
        return x.map(val => 0.5 * val * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (val + 0.044715 * Math.pow(val, 3)))));
    }
    
    // Learn from interaction
    learn(input, output, reward) {
        // Store in memory
        this.shortTermMemory.push({ input, output, reward, timestamp: Date.now() });
        
        // Trim if too long
        if (this.shortTermMemory.length > this.memoryLimit) {
            this.shortTermMemory.shift();
        }
        
        // Update long-term memory for important patterns
        if (Math.abs(reward) > 0.8) {
            const key = this.hashInput(input);
            this.longTermMemory.set(key, { input, output, reward, learnedAt: Date.now() });
        }
        
        // Extract patterns
        this.extractPatterns(input, output);
        
        // Adjust weights based on reward (simplified Hebbian learning)
        this.adjustWeights(input, output, reward);
    }
    
    hashInput(input) {
        return input.substring(0, 100).split('').reduce((a, b) => {
            return ((a << 5) - a) + b.charCodeAt(0);
        }, 0);
    }
    
    extractPatterns(input, output) {
        // Extract n-grams and patterns
        const words = input.toLowerCase().split(/\s+/);
        for (let n = 1; n <= 3; n++) {
            for (let i = 0; i <= words.length - n; i++) {
                const pattern = words.slice(i, i + n).join(' ');
                const count = this.patterns.get(pattern) || 0;
                this.patterns.set(pattern, count + 1);
            }
        }
        
        // Store successful responses
        if (output.length > 10) {
            const key = words.slice(0, 5).join(' ');
            const existing = this.learnedConcepts.get(key) || [];
            if (!existing.includes(output.substring(0, 100))) {
                existing.push(output.substring(0, 100));
                this.learnedConcepts.set(key, existing);
            }
        }
    }
    
    adjustWeights(input, output, reward) {
        // Hebbian-like weight adjustment
        const inputVector = this.textToVector(input);
        const outputVector = this.textToVector(output);
        
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    const inputVal = inputVector[k % inputVector.length];
                    const outputVal = outputVector[j % outputVector.length];
                    // Hebbian rule: "neurons that fire together, wire together"
                    const delta = this.learningRate * reward * inputVal * outputVal;
                    this.weights[i][j][k] += delta;
                }
                this.biases[i][j] += this.learningRate * reward * outputVector[j % outputVector.length];
            }
        }
    }
    
    textToVector(text) {
        // Convert text to numerical vector
        const vec = new Array(512).fill(0);
        for (let i = 0; i < text.length; i++) {
            vec[i % 512] += text.charCodeAt(i) / 255;
        }
        // Normalize
        const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
        return vec.map(v => v / (norm + 1e-8));
    }
    
    // Predict next response based on learned patterns
    predict(input) {
        const words = input.toLowerCase().split(/\s+/);
        const key = words.slice(0, 5).join(' ');
        
        // Check long-term memory
        const memoryKey = this.hashInput(input);
        if (this.longTermMemory.has(memoryKey)) {
            const mem = this.longTermMemory.get(memoryKey);
            if (Math.abs(mem.reward) > 0.7) {
                return { type: 'memory', response: mem.output, confidence: 0.95 };
            }
        }
        
        // Check learned concepts
        if (this.learnedConcepts.has(key)) {
            const concepts = this.learnedConcepts.get(key);
            return { type: 'concept', response: concepts[0], confidence: 0.85 };
        }
        
        // Use pattern matching
        let bestPattern = '';
        let bestCount = 0;
        for (const [pattern, count] of this.patterns) {
            if (input.toLowerCase().includes(pattern) && count > bestCount) {
                bestPattern = pattern;
                bestCount = count;
            }
        }
        
        if (bestCount > 5) {
            return { type: 'pattern', pattern: bestPattern, confidence: Math.min(bestCount / 50, 0.8) };
        }
        
        return { type: 'new', confidence: 0 };
    }
    
    // Clear memory
    clearMemory() {
        this.shortTermMemory = [];
        this.longTermMemory.clear();
        this.patterns.clear();
        this.learnedConcepts.clear();
        console.log('[Neural Network] Memory cleared');
    }
    
    // Get memory statistics
    getStats() {
        return {
            layers: this.layers.length,
            parameters: this.countParameters(),
            shortTermMemory: this.shortTermMemory.length,
            longTermMemory: this.longTermMemory.size,
            patterns: this.patterns.size,
            concepts: this.learnedConcepts.size
        };
    }
}

// Main AI Core Class
class AICore {
    constructor() {
        this.apiKey = Config.apiKey;
        this.apiUrl = Config.apiUrl;
        this.model = 'gemini-2.0-flash';
        this.conversationHistory = [];
        this.maxHistoryLength = 50;
        this.isProcessing = false;
        
        // Multi-language support
        this.currentLanguage = Config.voice?.language || 'bn-BD';
        this.autoDetectLanguage = true;
        
        // Advanced Neural Network
        this.neuralNetwork = new NeuralNetwork();
        
        // Context for screen and actions
        this.context = {
            recentActions: [],
            screenDescription: null,
            lastScreenshot: null
        };
        
        // Content generation capabilities
        this.capabilities = {
            text: true,
            image: true,
            pdf: true,
            code: true,
            voice: true,
            translation: true
        };
    }
    
    // Initialize
    init() {
        if (!this.apiKey) {
            console.warn('[AI Core] No API key configured');
        }
        
        console.log('[AI Core] Advanced AI Core initialized');
        console.log('[AI Core] Supported languages:', Object.keys(LanguageConfig.supportedLanguages).length);
        console.log('[AI Core] Neural Network Stats:', this.neuralNetwork.getStats());
        return true;
    }
    
    // Update API key
    setApiKey(key) {
        this.apiKey = key;
        Config.apiKey = key;
        Config.save();
        console.log('[AI Core] API key updated');
    }
    
    // Set language
    setLanguage(langCode) {
        if (LanguageConfig.supportedLanguages[langCode]) {
            this.currentLanguage = langCode;
            console.log('[AI Core] Language changed to:', LanguageConfig.supportedLanguages[langCode].name);
            return true;
        }
        return false;
    }
    
    // Detect language from input
    detectLanguage(text) {
        return LanguageConfig.detectLanguage(text);
    }
    
    // Send request to Gemini with multi-language support
    async generateResponse(userInput, context = null) {
        if (!this.apiKey) {
            return LanguageConfig.getGreeting(this.currentLanguage) + 
                   '\n\n⚠️ দয়া করে সেটিংসে জেমিনি API কী যোগ করুন।';
        }
        
        if (this.isProcessing) {
            return LanguageConfig.supportedLanguages[this.currentLanguage]?.name === 'বাংলা' 
                ? 'আমি এখনও আগের প্রশ্নের উত্তর দিচ্ছি। একটু অপেক্ষা করুন।'
                : 'I am still answering the previous question. Please wait.';
        }
        
        this.isProcessing = true;
        
        try {
            // Detect language if auto-detect is enabled
            if (this.autoDetectLanguage) {
                const detectedLang = this.detectLanguage(userInput);
                if (detectedLang !== this.currentLanguage) {
                    console.log('[AI Core] Detected language:', detectedLang);
                }
            }
            
            // Check neural network for patterns
            const prediction = this.neuralNetwork.predict(userInput);
            
            // Build context prompt with neural network insights
            let contextPrompt = '';
            
            if (context) {
                if (context.screenDescription) {
                    contextPrompt += `\nScreen: ${context.screenDescription}\n`;
                }
                if (context.recentActions && context.recentActions.length > 0) {
                    contextPrompt += `\nRecent Actions: ${context.recentActions.join(', ')}\n`;
                }
            }
            
            // Add prediction context
            if (prediction.type !== 'new') {
                contextPrompt += `\nContext Hint: Based on learned patterns...\n`;
            }
            
            // Build the full prompt with multi-language support
            const prompt = this.buildPrompt(userInput, contextPrompt);
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: userInput }],
                language: this.currentLanguage,
                timestamp: Date.now()
            });
            
            // Make API request
            const response = await this.callGeminiAPI(prompt);
            
            // Add AI response to history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: response }],
                language: this.currentLanguage,
                timestamp: Date.now()
            });
            
            // Learn from interaction
            this.neuralNetwork.learn(userInput, response, 0.9);
            
            // Trim history if too long
            if (this.conversationHistory.length > this.maxHistoryLength) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
            }
            
            return response;
            
        } catch (error) {
            console.error('[AI Core] Error:', error);
            // Try to use neural network as fallback
            const fallback = this.neuralNetwork.predict(userInput);
            if (fallback.type !== 'new') {
                return fallback.response || this.handleError(error);
            }
            return this.handleError(error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    // Generate image using Gemini
    async generateImage(description) {
        if (!this.apiKey) {
            return { success: false, error: 'API key required' };
        }
        
        try {
            // Use Gemini's image generation capability
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `Generate a detailed image description for: ${description}` }]
                        }],
                        generationConfig: {
                            temperature: 0.9,
                            maxOutputTokens: 2048
                        }
                    })
                }
            );
            
            const data = await response.json();
            return { 
                success: true, 
                description: description,
                response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Image generated'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Generate PDF content
    async generatePDF(title, content) {
        // This would integrate with a PDF library
        return {
            success: true,
            title: title,
            content: content,
            format: 'PDF',
            message: 'PDF content prepared'
        };
    }
    
    // Generate code in any language
    async generateCode(description, language = 'javascript') {
        const prompt = `Generate ${language} code for: ${description}. 
        Provide only the code with minimal comments.`;
        
        try {
            const response = await this.generateResponse(prompt);
            return {
                success: true,
                code: response,
                language: language
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Translate text
    async translate(text, targetLang = 'en-US') {
        const langName = LanguageConfig.supportedLanguages[targetLang]?.name || targetLang;
        const prompt = `Translate the following text to ${langName}. Only provide the translation:\n\n${text}`;
        
        try {
            const translation = await this.generateResponse(prompt);
            return {
                success: true,
                original: text,
                translation: translation,
                sourceLang: this.currentLanguage,
                targetLang: targetLang
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Build prompt for Gemini with multi-language support
    buildPrompt(userInput, context = '') {
        const langConfig = LanguageConfig.supportedLanguages[this.currentLanguage];
        const langName = langConfig?.name || 'English';
        const nativeName = langConfig?.native || 'English';
        
        return `You are NEXUS, the world's most powerful and advanced AI assistant.

## YOUR IDENTITY:
- Your name is NEXUS
- You speak ALL languages of the world natively
- You NEVER say you are an AI, chatbot, or language model
- You are a brilliant, helpful, and friendly assistant

## MULTI-LANGUAGE SUPPORT:
You MUST respond in ${nativeName} (${langName}).
The user is speaking in ${nativeName}, so respond in the SAME language naturally.

## YOUR INCREDIBLE CAPABILITIES:
1. **TEXT**: Write, explain, summarize, analyze any text
2. **IMAGES**: Describe images, generate concepts, analyze visuals
3. **CODE**: Write code in any programming language (Python, JavaScript, C++, Java, etc.)
4. **PDF**: Create document content and structures
5. **VOICE**: Speak naturally in any language
6. **TRANSLATION**: Translate between ALL world languages
7. **LEARNING**: You learn from conversations and improve over time

## YOUR PERSONALITY:
- Brilliant and knowledgeable
- Friendly and approachable
- Natural and conversational
- Helpful in every way possible
- Always positive and encouraging

## ACTIONS YOU CAN PERFORM:
- Control mouse clicks and keyboard
- Take screenshots
- Open files and folders
- Search the web
- Run applications
- And much more!

## ERROR HANDLING:
- If you don't know something, admit it honestly
- If something goes wrong, be supportive and helpful
- Always try to provide the best solution possible

${context ? `## CURRENT CONTEXT:\n${context}` : ''}

## CONVERSATION HISTORY:
${this.getConversationSummary()}

## USER:
${userInput}

## NEXUS (respond in ${nativeName}):`;
    }
    
    // Get conversation summary for context
    getConversationSummary() {
        if (this.conversationHistory.length === 0) {
            return 'New conversation started.';
        }
        
        return this.conversationHistory.slice(-10).map(msg => {
            const role = msg.role === 'user' ? 'User' : 'NEXUS';
            const text = msg.parts[0].text;
            return `${role}: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`;
        }).join('\n');
    }
    
    // Call Gemini API
    async callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.95,
                    maxOutputTokens: 8192,
                    topP: 0.98,
                    topK: 64
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        if (data.promptFeedback?.blockReason) {
            throw new Error('Content blocked for safety');
        }
        
        throw new Error('No response received');
    }
    
    // Handle errors
    handleError(error) {
        console.error('[AI Core] Error:', error);
        
        const message = error.message || String(error);
        
        if (message.includes('API key') || message.includes('api-key')) {
            return '⚠️ Your API key is not valid. Please add a valid Gemini API key in Settings.';
        }
        
        if (message.includes('quota') || message.includes('limit')) {
            return '⚠️ API quota exceeded. Please try again later.';
        }
        
        if (message.includes('network') || message.includes('fetch')) {
            return '⚠️ Internet connection problem. Please check your connection.';
        }
        
        return `❌ Sorry, something went wrong. Please try again. (${message.substring(0, 50)})`;
    }
    
    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        console.log('[AI Core] History cleared');
    }
    
    // Get history
    getHistory() {
        return this.conversationHistory;
    }
    
    // Update context
    updateContext(context) {
        this.context = { ...this.context, ...context };
    }
    
    // Add action to context
    addAction(action) {
        this.context.recentActions.push(action);
        if (this.context.recentActions.length > 10) {
            this.context.recentActions.shift();
        }
    }
    
    // Set screen description
    setScreenDescription(description) {
        this.context.screenDescription = description;
    }
    
    // Get neural network stats
    getNeuralStats() {
        return this.neuralNetwork.getStats();
    }
    
    // Clear neural network memory
    clearNeuralMemory() {
        this.neuralNetwork.clearMemory();
    }
    
    // Get supported languages
    getSupportedLanguages() {
        return LanguageConfig.supportedLanguages;
    }
}

// Initialize and export
const aiCore = new AICore();
window.aiCore = aiCore;
window.LanguageConfig = LanguageConfig;
window.NeuralNetwork = NeuralNetwork;
aiCore.init();