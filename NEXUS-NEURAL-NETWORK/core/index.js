/**
 * NEXUS NEURAL NETWORK - Core Index
 * সব কোর মডিউল এক্সপোর্ট
 */

// Core components
const NEXUSCore = {
    // Model
    Model: window.NEXUSModel,
    
    // Layers
    Layers: window.NEXUS_LAYERS,
    
    // Activations
    Activations: window.NEXUS_ACTIVATIONS,
    Vectorized: window.NEXUS_VECTORIZED,
    
    // Loss
    Loss: window.NEXUS_LOSS,
    
    // Metrics
    Metrics: window.NEXUS_METRICS,
    
    // Knowledge Base Integration
    knowledgeBase: null,
    embeddings: {},
    
    // Initialize
    init() {
        console.log('[NEXUS Neural Network] Core initialized');
        console.log('[NEXUS] Available:', Object.keys(this));
        this.connectToKnowledgeBase();
        return this;
    },
    
    // Knowledge Base এ কানেক্ট করা
    connectToKnowledgeBase() {
        const checkKnowledgeBase = () => {
            if (window.nexusKnowledge && window.nexusKnowledge.initialized) {
                this.knowledgeBase = window.nexusKnowledge;
                this.prepareEmbeddings();
                console.log('[NEXUS Core] ✅ Knowledge Base এ কানেক্টেড');
            } else {
                setTimeout(checkKnowledgeBase, 100);
            }
        };
        checkKnowledgeBase();
    },
    
    // Knowledge Base থেকে Embeddings তৈরি করা
    prepareEmbeddings() {
        if (!this.knowledgeBase || !this.knowledgeBase.knowledge) return;
        
        console.log('[NEXUS Core] 📚 Knowledge embeddings প্রস্তুত হচ্ছে...');
        
        for (const [category, data] of Object.entries(this.knowledgeBase.knowledge)) {
            if (data && typeof data === 'object') {
                this.embeddings[category] = this.createEmbedding(data);
            }
        }
        
        console.log(`[NEXUS Core] ✅ ${Object.keys(this.embeddings).length} টি category embedding তৈরি হয়েছে`);
    },
    
    // Simple embedding তৈরি করা (frequency-based)
    createEmbedding(data, dimension = 128) {
        const embedding = new Array(dimension).fill(0);
        let totalTokens = 0;
        
        const extractTokens = (obj) => {
            if (typeof obj === 'string') {
                const words = obj.toLowerCase().split(/[\s,.।;:!?()\[\]{}]+/);
                words.forEach(word => {
                    if (word.length > 2) {
                        // Simple hash-based frequency encoding
                        const hash = this.simpleHash(word);
                        embedding[hash % dimension] += 1;
                        totalTokens++;
                    }
                });
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    // Key-ও টোকেন হিসেবে যোগ করো
                    const keyHash = this.simpleHash(key.toLowerCase());
                    embedding[keyHash % dimension] += 0.5;
                    extractTokens(obj[key]);
                }
            }
        };
        
        extractTokens(data);
        
        // Normalize
        if (totalTokens > 0) {
            for (let i = 0; i < dimension; i++) {
                embedding[i] /= totalTokens;
            }
        }
        
        return embedding;
    },
    
    // Simple hash function
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },
    
    // Knowledge Base সেট করা (external call)
    setKnowledgeBase(neuralData) {
        if (neuralData && neuralData.embeddings) {
            this.embeddings = neuralData.embeddings;
            console.log('[NEXUS Core] Knowledge embeddings আপডেট হয়েছে');
        }
    },
    
    // Query থেকে context embeddings পাওয়া
    getContextEmbedding(query) {
        const queryEmbedding = this.createEmbedding(query, 128);
        
        // সব category embedding এর সাথে similarity গণনা
        const similarities = {};
        for (const [category, embedding] of Object.entries(this.embeddings)) {
            similarities[category] = this.cosineSimilarity(queryEmbedding, embedding);
        }
        
        // সর্বোচ্চ similarity যোগ করা category বের করো
        let bestCategory = 'general';
        let bestScore = 0;
        for (const [category, score] of Object.entries(similarities)) {
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category;
            }
        }
        
        return {
            category: bestCategory,
            score: bestScore,
            similarities: similarities
        };
    },
    
    // Cosine similarity গণনা
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
};

// Auto-initialize
NEXUSCore.init();

// Export
window.NEXUSCore = NEXUSCore;
