/**
 * NEXUS AI - Smart Learning System
 * Adaptive Learning Rate, Pattern Recognition, Self-Improvement
 * স্মার্ট লার্নিং সিস্টেম
 */

class SmartLearningSystem {
    constructor() {
        this.learningRate = 0.001;
        this.baseLearningRate = 0.001;
        this.minLearningRate = 0.00001;
        this.maxLearningRate = 0.1;
        
        this.gradientHistory = [];
        this.lossHistory = [];
        this.patternBuffer = [];
        this.patternThreshold = 5;
        
        // Adaptive parameters
        this.momentum = 0.9;
        this.adaptivityEnabled = true;
        this.warmupSteps = 100;
        this.totalSteps = 0;
        
        // Learning rate scheduler
        this.schedulerType = 'cosine'; // cosine, exponential, step, polynomial
        this.schedulerConfig = {
            decaySteps: 1000,
            decayRate: 0.96,
            staircase: false
        };
        
        // Pattern detection
        this.patterns = new Map();
        this.anomalies = [];
        this.learningMode = 'online'; // online, batch, reinforcement
        
        // Experience replay buffer
        this.replayBuffer = [];
        this.replayBufferSize = 10000;
        this.batchSize = 32;
        
        // Meta-learning
        this.metaLearningRate = 0.001;
        this.innerLoopSteps = 5;
        this.outerLoopSteps = 100;
        
        // Knowledge Base Integration
        this.knowledgeBase = null;
        this.knowledgePatterns = new Map();
        
        // Statistics
        this.stats = {
            totalUpdates: 0,
            improvements: 0,
            degradations: 0,
            patternsLearned: 0,
            anomaliesDetected: 0,
            knowledgePatternsLoaded: 0
        };
        
        this.initialize();
    }

    initialize() {
        console.log('[Smart Learning] System initialized');
        this.loadFromStorage();
        this.connectToKnowledgeBase();
    }
    
    // Knowledge Base এ কানেক্ট করা
    connectToKnowledgeBase() {
        // Knowledge Base লোড হওয়ার জন্য অপেক্ষা করো
        const checkKnowledgeBase = () => {
            if (window.nexusKnowledge && window.nexusKnowledge.initialized) {
                this.knowledgeBase = window.nexusKnowledge;
                this.loadPatternsFromKnowledgeBase();
                console.log('[Smart Learning] ✅ Knowledge Base এ কানেক্টেড');
            } else {
                setTimeout(checkKnowledgeBase, 100);
            }
        };
        
        checkKnowledgeBase();
    }
    
    // Knowledge Base থেকে প্যাটার্ন লোড করা
    loadPatternsFromKnowledgeBase() {
        if (!this.knowledgeBase || !this.knowledgeBase.knowledge) return;
        
        console.log('[Smart Learning] 📚 Knowledge Base থেকে প্যাটার্ন লোড হচ্ছে...');
        
        for (const [category, data] of Object.entries(this.knowledgeBase.knowledge)) {
            if (data && typeof data === 'object') {
                this.extractPatternsRecursive(category, data, '');
            }
        }
        
        console.log(`[Smart Learning] ✅ ${this.stats.knowledgePatternsLoaded} টি জ্ঞান-ভিত্তিক প্যাটার্ন লোড হয়েছে`);
    }
    
    // রিকার্সিভলি প্যাটার্ন বের করা
    extractPatternsRecursive(category, obj, path) {
        if (typeof obj === 'string') {
            // স্ট্রিং থেকে প্যাটার্ন তৈরি
            if (obj.length > 5 && obj.length < 500) {
                const patternKey = this.hashPattern(path + '_' + category);
                this.knowledgePatterns.set(patternKey, {
                    input: path,
                    output: obj,
                    category: category,
                    confidence: 0.9, // Knowledge Base থেকে তাই উচ্চ confidence
                    source: 'knowledge_base'
                });
                this.stats.knowledgePatternsLoaded++;
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                this.extractPatternsRecursive(
                    category, 
                    obj[key], 
                    path ? `${path}.${key}` : key
                );
            }
        }
    }
    
    // Knowledge Base থেকে প্রাসঙ্গিক প্যাটার্ন খুঁজে বের করা
    findPatternFromKnowledge(input) {
        const inputLower = input.toLowerCase();
        
        // সব Knowledge Pattern এ খুঁজো
        for (const [key, pattern] of this.knowledgePatterns) {
            if (inputLower.includes(pattern.input.toLowerCase()) || 
                pattern.input.toLowerCase().includes(inputLower)) {
                return {
                    found: true,
                    pattern: pattern,
                    confidence: pattern.confidence,
                    source: 'knowledge_base'
                };
            }
        }
        
        return { found: false };
    }
    
    // Knowledge Base থেকে সার্চ করা
    searchKnowledgeBase(query) {
        if (!this.knowledgeBase) return [];
        
        try {
            const results = this.knowledgeBase.search(query);
            return results || [];
        } catch (e) {
            console.error('[Smart Learning] Knowledge Base সার্চ এরর:', e);
            return [];
        }
    }

    // ==================== ADAPTIVE LEARNING RATE ====================
    
    // Update learning rate based on gradient history
    adaptLearningRate(gradient, currentLoss, previousLoss) {
        if (!this.adaptivityEnabled) return this.learningRate;
        
        this.totalSteps++;
        
        // Warmup phase
        if (this.totalSteps < this.warmupSteps) {
            this.learningRate = this.baseLearningRate * (this.totalSteps / this.warmupSteps);
            return this.learningRate;
        }
        
        // Store gradient magnitude
        const gradientMagnitude = this.computeGradientMagnitude(gradient);
        this.gradientHistory.push(gradientMagnitude);
        
        // Store loss
        this.lossHistory.push(currentLoss);
        
        // Detect gradient explosion/vanishing
        if (gradientMagnitude > 100) {
            console.warn('[Smart Learning] Gradient explosion detected, reducing learning rate');
            this.learningRate *= 0.5;
            this.stats.degradations++;
        } else if (gradientMagnitude < 0.001) {
            console.warn('[Smart Learning] Gradient vanishing detected, increasing learning rate');
            this.learningRate *= 1.1;
            this.stats.degradations++;
        }
        
        // Check loss improvement
        if (previousLoss !== undefined) {
            if (currentLoss < previousLoss) {
                // Loss improved - can increase learning rate
                this.learningRate = Math.min(this.learningRate * 1.05, this.maxLearningRate);
                this.stats.improvements++;
            } else {
                // Loss degraded - reduce learning rate
                this.learningRate = Math.max(this.learningRate * 0.7, this.minLearningRate);
                this.stats.degradations++;
            }
        }
        
        // Apply scheduler
        this.learningRate = this.applyScheduler(this.learningRate);
        
        // Clamp learning rate
        this.learningRate = Math.max(this.minLearningRate, Math.min(this.maxLearningRate, this.learningRate));
        
        // Save state
        this.saveToStorage();
        
        return this.learningRate;
    }

    // Apply learning rate scheduler
    applyScheduler(lr) {
        const { decaySteps, decayRate, staircase } = this.schedulerConfig;
        
        switch (this.schedulerType) {
            case 'cosine':
                const progress = this.totalSteps / decaySteps;
                const cosineDecay = 0.5 * (1 + Math.cos(Math.PI * progress));
                return lr * cosineDecay;
            
            case 'exponential':
                const exp = staircase ? 
                    Math.floor(this.totalSteps / decaySteps) : 
                    this.totalSteps / decaySteps;
                return lr * Math.pow(decayRate, exp);
            
            case 'step':
                const floor = staircase ? 
                    Math.floor(this.totalSteps / decaySteps) : 
                    this.totalSteps / decaySteps;
                return lr * Math.pow(decayRate, Math.floor(floor));
            
            case 'polynomial':
                const poly = Math.max(0, 1 - (this.totalSteps / decaySteps));
                return lr * Math.pow(poly, 0.5);
            
            case 'cyclic':
                const cycle = Math.sin(this.totalSteps / 100) * 0.5 + 0.5;
                return lr * (0.5 + 0.5 * cycle);
            
            default:
                return lr;
        }
    }

    computeGradientMagnitude(gradient) {
        if (!gradient) return 0;
        
        let sum = 0;
        let count = 0;
        
        const flatten = (arr) => {
            for (const item of arr) {
                if (typeof item === 'number') {
                    sum += item * item;
                    count++;
                } else if (Array.isArray(item)) {
                    flatten(item);
                }
            }
        };
        
        flatten(gradient);
        return Math.sqrt(sum / Math.max(1, count));
    }

    // ==================== PATTERN RECOGNITION ====================

    // Learn patterns from data
    learnPattern(input, output, reward) {
        const patternKey = this.hashPattern(input);
        
        if (!this.patterns.has(patternKey)) {
            this.patterns.set(patternKey, {
                input,
                output,
                reward,
                count: 1,
                confidence: 0.1,
                lastSeen: Date.now()
            });
        } else {
            const pattern = this.patterns.get(patternKey);
            pattern.count++;
            pattern.reward = pattern.reward * 0.9 + reward * 0.1;
            pattern.confidence = Math.min(1, pattern.count / 10);
            pattern.lastSeen = Date.now();
        }
        
        this.stats.patternsLearned++;
        return patternKey;
    }

    // Recognize pattern from input
    recognizePattern(input) {
        const patternKey = this.hashPattern(input);
        const pattern = this.patterns.get(patternKey);
        
        if (pattern && pattern.confidence > 0.5) {
            return {
                found: true,
                pattern,
                confidence: pattern.confidence,
                source: 'learned'
            };
        }
        
        // প্রথমে Knowledge Base থেকে খুঁজো (এটি সরাসরি ডাটা দিচ্ছি তাই)
        const knowledgeMatch = this.findPatternFromKnowledge(input);
        if (knowledgeMatch.found) {
            return knowledgeMatch;
        }
        
        // Try partial matching
        return this.findSimilarPattern(input);
    }

    // Find similar pattern
    findSimilarPattern(input) {
        let bestMatch = null;
        let bestScore = 0;
        
        // Learned patterns থেকে খুঁজো
        for (const [key, pattern] of this.patterns) {
            const score = this.calculateSimilarity(input, pattern.input);
            if (score > bestScore && score > 0.7) {
                bestScore = score;
                bestMatch = pattern;
            }
        }
        
        // Knowledge Base patterns থেকেও খুঁজো
        for (const [key, pattern] of this.knowledgePatterns) {
            const score = this.calculateSimilarity(input, pattern.input);
            if (score > bestScore && score > 0.5) { // Knowledge Base এ lower threshold
                bestScore = score;
                bestMatch = pattern;
            }
        }
        
        return {
            found: bestMatch !== null,
            pattern: bestMatch,
            confidence: bestScore,
            source: bestMatch?.source || 'similarity'
        };
    }

    // Calculate similarity between two inputs
    calculateSimilarity(a, b) {
        if (!a || !b) return 0;
        
        if (typeof a === 'number' && typeof b === 'number') {
            return 1 - Math.min(1, Math.abs(a - b) / Math.max(1, Math.abs(b)));
        }
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return 0;
            
            let sum = 0;
            for (let i = 0; i < a.length; i++) {
                sum += this.calculateSimilarity(a[i], b[i]);
            }
            return sum / a.length;
        }
        
        if (typeof a === 'string' && typeof b === 'string') {
            const distance = this.levenshteinDistance(a, b);
            return 1 - distance / Math.max(a.length, b.length);
        }
        
        return 0;
    }

    // Hash pattern for storage
    hashPattern(input) {
        if (typeof input === 'number') {
            return `num_${input.toFixed(3)}`;
        }
        if (typeof input === 'string') {
            return `str_${input.substring(0, 50)}`;
        }
        if (Array.isArray(input)) {
            const hash = input.slice(0, 10).reduce((acc, val, idx) => {
                return acc + (typeof val === 'number' ? val.toFixed(2) : String(val).substring(0, 5));
            }, '');
            return `arr_${hash}`;
        }
        return 'unknown';
    }

    // Levenshtein distance for string similarity
    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }

    // ==================== ANOMALY DETECTION ====================

    // Detect anomalies in data
    detectAnomaly(data) {
        const recentLosses = this.lossHistory.slice(-20);
        
        if (recentLosses.length < 10) return false;
        
        // Calculate mean and standard deviation
        const mean = recentLosses.reduce((a, b) => a + b, 0) / recentLosses.length;
        const variance = recentLosses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentLosses.length;
        const stdDev = Math.sqrt(variance);
        
        // Check if current data is anomalous
        if (typeof data === 'number') {
            const zScore = Math.abs(data - mean) / stdDev;
            
            if (zScore > 3) {
                this.anomalies.push({
                    type: 'outlier',
                    data,
                    zScore,
                    timestamp: Date.now()
                });
                this.stats.anomaliesDetected++;
                return true;
            }
        }
        
        return false;
    }

    // ==================== EXPERIENCE REPLAY ====================

    // Add experience to replay buffer
    addExperience(state, action, reward, nextState, done) {
        this.replayBuffer.push({ state, action, reward, nextState, done, timestamp: Date.now() });
        
        if (this.replayBuffer.length > this.replayBufferSize) {
            this.replayBuffer.shift();
        }
    }

    // Sample random batch from replay buffer
    sampleBatch(batchSize) {
        const size = Math.min(batchSize, this.replayBuffer.length);
        const batch = [];
        
        for (let i = 0; i < size; i++) {
            const idx = Math.floor(Math.random() * this.replayBuffer.length);
            batch.push(this.replayBuffer[idx]);
        }
        
        return batch;
    }

    // Prioritized experience replay
    samplePrioritizedBatch(batchSize) {
        const size = Math.min(batchSize, this.replayBuffer.length);
        
        // Calculate priorities based on TD error
        const priorities = this.replayBuffer.map(exp => Math.abs(exp.reward) + 0.01);
        const totalPriority = priorities.reduce((a, b) => a + b, 0);
        
        const batch = [];
        for (let i = 0; i < size; i++) {
            let random = Math.random() * totalPriority;
            for (let j = 0; j < this.replayBuffer.length; j++) {
                random -= priorities[j];
                if (random <= 0) {
                    batch.push(this.replayBuffer[j]);
                    break;
                }
            }
        }
        
        return batch;
    }

    // ==================== META LEARNING ====================

    // Meta-learning update (MAML-inspired)
    metaUpdate(fastWeights, taskBatch) {
        // Inner loop: compute fast weights
        let fastWeightsClone = this.cloneWeights(fastWeights);
        
        for (let step = 0; step < this.innerLoopSteps; step++) {
            const grad = this.computeGradient(fastWeightsClone, taskBatch);
            fastWeightsClone = this.applyGradient(fastWeightsClone, grad, this.metaLearningRate);
        }
        
        // Compute meta-gradient
        const metaGrad = this.computeGradient(fastWeightsClone, taskBatch);
        
        // Outer loop: update base weights
        return this.applyGradient(fastWeights, metaGrad, this.metaLearningRate * 0.1);
    }

    cloneWeights(weights) {
        return JSON.parse(JSON.stringify(weights));
    }

    computeGradient(weights, batch) {
        // Simplified gradient computation
        const grad = [];
        for (const layer of weights) {
            const layerGrad = [];
            for (const param of layer) {
                layerGrad.push(new Array(param.length).fill(0).map(() => (Math.random() - 0.5) * 0.01));
            }
            grad.push(layerGrad);
        }
        return grad;
    }

    applyGradient(weights, grad, lr) {
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
                for (let k = 0; k < weights[i][j].length; k++) {
                    weights[i][j][k] -= lr * (grad[i]?.[j]?.[k] || 0);
                }
            }
        }
        return weights;
    }

    // ==================== PERSISTENCE ====================

    saveToStorage() {
        try {
            const data = {
                learningRate: this.learningRate,
                patterns: Array.from(this.patterns.entries()),
                stats: this.stats,
                lossHistory: this.lossHistory.slice(-100),
                totalSteps: this.totalSteps
            };
            
            localStorage.setItem('nexus_smart_learning', JSON.stringify(data));
        } catch (e) {
            console.error('[Smart Learning] Failed to save:', e);
        }
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('nexus_smart_learning'));
            
            if (data) {
                this.learningRate = data.learningRate || this.baseLearningRate;
                this.patterns = new Map(data.patterns || []);
                this.stats = { ...this.stats, ...data.stats };
                this.lossHistory = data.lossHistory || [];
                this.totalSteps = data.totalSteps || 0;
                
                console.log('[Smart Learning] Loaded from storage');
            }
        } catch (e) {
            console.error('[Smart Learning] Failed to load:', e);
        }
    }

    // ==================== UTILITIES ====================

    getStats() {
        return {
            ...this.stats,
            learningRate: this.learningRate,
            patternsCount: this.patterns.size,
            knowledgePatternsCount: this.knowledgePatterns.size,
            bufferSize: this.replayBuffer.length,
            averageLoss: this.lossHistory.length > 0 ? 
                this.lossHistory.reduce((a, b) => a + b, 0) / this.lossHistory.length : 0
        };
    }

    reset() {
        this.learningRate = this.baseLearningRate;
        this.gradientHistory = [];
        this.lossHistory = [];
        this.patterns.clear();
        this.replayBuffer = [];
        this.anomalies = [];
        this.totalSteps = 0;
        this.stats = {
            totalUpdates: 0,
            improvements: 0,
            degradations: 0,
            patternsLearned: 0,
            anomaliesDetected: 0
        };
        
        localStorage.removeItem('nexus_smart_learning');
        console.log('[Smart Learning] Reset complete');
    }
}

// Export
window.SmartLearningSystem = SmartLearningSystem;
window.smartLearning = new SmartLearningSystem();
