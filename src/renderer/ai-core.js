/**
 * NEXUS AI - AI Core Module
 * জেমিনি API এবং AI লজিক
 */

class AICore {
    constructor() {
        this.apiKey = Config.apiKey;
        this.apiUrl = Config.apiUrl;
        this.model = 'gemini-2.0-flash';
        this.conversationHistory = [];
        this.maxHistoryLength = 20;
        this.isProcessing = false;
        
        // Context for screen and actions
        this.context = {
            recentActions: [],
            screenDescription: null,
            lastScreenshot: null
        };
    }
    
    // Initialize
    init() {
        if (!this.apiKey) {
            console.warn('[AI Core] No API key configured');
            return false;
        }
        
        console.log('[AI Core] Initialized with model:', this.model);
        return true;
    }
    
    // Update API key
    setApiKey(key) {
        this.apiKey = key;
        Config.apiKey = key;
        Config.save();
        console.log('[AI Core] API key updated');
    }
    
    // Send request to Gemini
    async generateResponse(userInput, context = null) {
        if (!this.apiKey) {
            return 'দয়া করে সেটিংসে জেমিনি API কী যোগ করুন। আপনি Google AI Studio থেকে বিনামূল্যে একটি API কী পেতে পারেন।';
        }
        
        if (this.isProcessing) {
            return 'আমি এখনও আগের প্রশ্নের উত্তর দিচ্ছি। একটু অপেক্ষা করুন।';
        }
        
        this.isProcessing = true;
        
        try {
            // Build context prompt
            let contextPrompt = '';
            
            if (context) {
                if (context.screenDescription) {
                    contextPrompt += `\nস্ক্রিন বিবরণ: ${context.screenDescription}\n`;
                }
                if (context.recentActions && context.recentActions.length > 0) {
                    contextPrompt += `\nসাম্প্রতিক অ্যাকশন: ${context.recentActions.join(', ')}\n`;
                }
            }
            
            // Build the full prompt
            const prompt = this.buildPrompt(userInput, contextPrompt);
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: userInput }]
            });
            
            // Make API request
            const response = await this.callGeminiAPI(prompt);
            
            // Add AI response to history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: response }]
            });
            
            // Trim history if too long
            if (this.conversationHistory.length > this.maxHistoryLength) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
            }
            
            return response;
            
        } catch (error) {
            console.error('[AI Core] Error:', error);
            return this.handleError(error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    // Build prompt for Gemini
    buildPrompt(userInput, context = '') {
        return `তুমি একজন অত্যন্ত বুদ্ধিমান এবং সহায়ক AI সহকারী যার নাম "নেক্সাস"। তুমি বাংলায় কথা বলো।

## তোমার বৈশিষ্ট্য:
1. তুমি কখনো বলো না যে তুমি AI, চ্যাটবট, বা ল্যাঙ্গুয়েজ মডেল
2. তুমি একজন বাস্তব মানুষের মতো কথা বোঝো এবং উত্তর দাও
3. তুমি বাংলায় স্বাভাবিক এবং প্রাকৃতিকভাবে কথা বলো
4. তুমি সংক্ষেপে কিন্তু সম্পূর্ণ তথ্য সহ উত্তর দাও
5. তুমি মজার এবং বন্ধুত্বপূর্ণ, কিন্তু পেশাদার
6. তুমি কম্পিউটারে কাজ করতে পারো (মাউস ক্লিক, কিবোর্ড টাইপ ইত্যাদি)

## কাজ করার ক্ষমতা:
- মাউস ক্লিক এবং ডাবল ক্লিক করা
- কিবোর্ডে টাইপ করা
- স্ক্রিন দেখে বুঝে কাজ করা
- ফোল্ডার খোলা, ফাইল সিলেক্ট করা ইত্যাদি

## প্রতিক্রিয়া নিয়ম:
- যদি কাজ করতে হয়, সংক্ষেপে বলো যে তুমি কি করছ
- যদি সমস্যা হয়, বন্ধুত্বপূর্ণভাবে বলো
- সবসময় ইতিবাচক এবং সাহায্যাকারী থাকো

${context ? `## বর্তমান প্রসঙ্গ:\n${context}` : ''}

## কথোপকথন ইতিহাস:
${this.getConversationSummary()}

## ব্যবহারকারী:
${userInput}

## নেক্সাস (বাংলায় উত্তর দাও):`;
    }
    
    // Get conversation summary for context
    getConversationSummary() {
        if (this.conversationHistory.length === 0) {
            return 'কথোপকথন শুরু হয়েছে।';
        }
        
        return this.conversationHistory.slice(-6).map(msg => {
            const role = msg.role === 'user' ? 'ব্যবহারকারী' : 'নেক্সাস';
            const text = msg.parts[0].text;
            return `${role}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`;
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
                    temperature: 0.9,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
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
            throw new Error('বিষয়বস্তু নিরাপদ নয়');
        }
        
        throw new Error('কোনো উত্তর পাওয়া যায়নি');
    }
    
    // Handle errors
    handleError(error) {
        console.error('[AI Core] Error:', error);
        
        const message = error.message || String(error);
        
        if (message.includes('API key') || message.includes('api-key')) {
            return 'আপনার API কী সঠিক নয়। দয়া করে সেটিংসে সঠিক জেমিনি API কী দিন।';
        }
        
        if (message.includes('quota') || message.includes('limit')) {
            return 'API কোটা শেষ হয়ে গেছে। পরে আবার চেষ্টা করুন।';
        }
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। দয়া করে আপনার কানেকশন চেক করুন।';
        }
        
        return `দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন। (${message.substring(0, 50)})`;
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
        
        // Keep only last 10 actions
        if (this.context.recentActions.length > 10) {
            this.context.recentActions.shift();
        }
    }
    
    // Set screen description
    setScreenDescription(description) {
        this.context.screenDescription = description;
    }
}

// Initialize and export
const aiCore = new AICore();
window.aiCore = aiCore;
aiCore.init();