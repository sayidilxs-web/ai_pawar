/**
 * NEXUS AI - Main Application
 * মূল অ্যাপ্লিকেশন লজিক
 * এখন Knowledge Base দিয়ে সরাসরি উত্তর দেয়!
 */

// App State
const AppState = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    lastTranscript: '',
    conversationHistory: [],
    knowledgeReady: false
};

// Knowledge Base Instance
let nexusKnowledge = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[NEXUS] Initializing...');
    
    // Initialize Knowledge Base
    await initKnowledgeBase();
    
    // Welcome
    setTimeout(() => {
        showNotification('NEXUS AI স্বাগতম! 📚 মস্তিষ্ক লোড হয়েছে!');
        speak(Config.personality.greeting);
    }, 1000);
    
    // Update stats
    setInterval(updateSystemStats, 2000);
    
    console.log('[NEXUS] Ready with Knowledge Base!');
});

// Initialize Knowledge Base
async function initKnowledgeBase() {
    console.log('[NEXUS] 🧠 Knowledge Base লোড হচ্ছে...');
    
    try {
        // NEXUS Knowledge Base লোড
        if (window.NEXUSKnowledgeBase) {
            nexusKnowledge = new NEXUSKnowledgeBase();
            // Wait for async loading
            setTimeout(() => {
                AppState.knowledgeReady = true;
                console.log('[NEXUS] ✅ Knowledge Base Ready!');
            }, 500);
        } else {
            console.warn('[NEXUS] Knowledge Base not found, using API only');
        }
    } catch (e) {
        console.error('[NEXUS] Knowledge Base Error:', e);
    }
}

// Toggle Listening
async function toggleListening() {
    if (AppState.isProcessing) return;
    
    AppState.isListening = !AppState.isListening;
    
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const listenBtn = document.getElementById('listenBtn');
    const wakeIndicator = document.getElementById('wakeIndicator');
    const audioVisualizer = document.getElementById('audioVisualizer');
    
    if (AppState.isListening) {
        statusBadge.classList.add('listening');
        statusText.textContent = 'শুনছি...';
        listenBtn.classList.add('active');
        wakeIndicator.classList.add('active');
        audioVisualizer.classList.add('active');
        
        if (window.voiceRecognition) {
            await window.voiceRecognition.start();
        }
    } else {
        statusBadge.classList.remove('listening');
        statusText.textContent = 'পিসি রেডি';
        listenBtn.classList.remove('active');
        wakeIndicator.classList.remove('active');
        audioVisualizer.classList.remove('active');
        
        if (window.voiceRecognition) {
            await window.voiceRecognition.stop();
        }
    }
}

// Process Voice Input
async function processVoiceInput(transcript) {
    if (!transcript || transcript.trim() === '') return;
    
    console.log('[NEXUS] Heard:', transcript);
    addLogEntry('action', transcript);
    addChatMessage('user', transcript);
    
    AppState.lastTranscript = transcript;
    AppState.isProcessing = true;
    updateStatus('ভাবছি...');
    
    // Show typing indicator
    showTypingIndicator();
    
    // First, try to execute built-in command
    if (window.nexusAutomation) {
        const executed = await window.nexusAutomation.parseAndExecute(transcript);
        if (executed) {
            removeTypingIndicator();
            AppState.isProcessing = false;
            updateStatus('পিসি রেডি');
            return;
        }
    }
    
    // Now check Knowledge Base FIRST
    const kbResponse = await getKnowledgeBaseResponse(transcript);
    
    if (kbResponse.found) {
        // Knowledge Base-এ উত্তর পেয়েছি!
        removeTypingIndicator();
        addChatMessage('ai', kbResponse.answer);
        speak(kbResponse.answer);
    } else {
        // Knowledge Base-এ না পেলে API ব্যবহার করো
        const response = await getAIResponse(transcript);
        removeTypingIndicator();
        addChatMessage('ai', response);
        speak(response);
    }
    
    AppState.isProcessing = false;
    updateStatus('পিসি রেডি');
}

// Get Response from Knowledge Base
async function getKnowledgeBaseResponse(userInput) {
    if (!AppState.knowledgeReady || !nexusKnowledge) {
        return { found: false, answer: null };
    }
    
    try {
        // Detect what topic this is
        const query = userInput.toLowerCase();
        
        // Programming questions
        if (nexusKnowledge.knowledge?.programming) {
            const langs = nexusKnowledge.knowledge.programming.languages;
            for (const [key, lang] of Object.entries(langs)) {
                if (query.includes(key) || query.includes(lang.name?.toLowerCase())) {
                    // Found programming language info
                    let answer = `${lang.name} সম্পর্কে জানাচ্ছি:\n\n`;
                    answer += `বিবরণ: ${lang.description}\n\n`;
                    if (lang.syntax) {
                        if (lang.syntax.hello_world) {
                            answer += `হ্যালো ওয়ার্ল্ড:\n\`\`\`\n${lang.syntax.hello_world}\n\`\`\`\n`;
                        }
                        if (lang.syntax.functions) {
                            answer += `ফাংশন উদাহরণ:\n\`\`\`\n${lang.syntax.functions}\n\`\`\`\n`;
                        }
                    }
                    answer += `ব্যবহার: ${lang.used_for?.join(', ') || 'Various'}\n`;
                    if (lang.frameworks) {
                        answer += `ফ্রেমওয়ার্ক: ${Array.isArray(lang.frameworks) ? lang.frameworks.slice(0,5).join(', ') : JSON.stringify(lang.frameworks).slice(0,100)}\n`;
                    }
                    return { found: true, answer };
                }
            }
        }
        
        // Language/Translation questions
        if (nexusKnowledge.knowledge?.languages?.common_translations) {
            const translations = nexusKnowledge.knowledge.languages.common_translations;
            for (const [key, phrases] of Object.entries(translations)) {
                if (query.includes(key) || query.includes(phrases.bangla)) {
                    let answer = `"${key}" বিভিন্ন ভাষায়:\n\n`;
                    for (const [lang, text] of Object.entries(phrases)) {
                        if (lang !== 'bangla' && lang !== 'english') {
                            answer += `${lang}: ${text}\n`;
                        }
                    }
                    return { found: true, answer };
                }
            }
        }
        
        // Math questions
        if (nexusKnowledge.knowledge?.mathematics) {
            const math = nexusKnowledge.knowledge.mathematics;
            if (query.includes('গণিত') || query.includes('math') || query.includes('সূত্র') || query.includes('formula')) {
                let answer = '📐 গণিতের সূত্রাবলী:\n\n';
                
                if (math.geometry?.triangles) {
                    answer += 'ত্রিভুজ:\n';
                    answer += `• ক্ষেত্রফল: ½ × ভূমি × উচ্চতা\n`;
                    answer += `• পিথাগোরাস: a² + b² = c²\n`;
                    answer += `• sin: প্রতিবেশী/অতিভুজ\n`;
                    answer += `• cos: ভূমি/অতিভুজ\n`;
                    answer += `• tan: প্রতিবেশী/ভূমি\n\n`;
                }
                
                if (math.arithmetic?.operations) {
                    answer += 'পাটিগণিত:\n';
                    answer += `• যোগ: a + b\n`;
                    answer += `• বিয়োগ: a - b\n`;
                    answer += `• গুণ: a × b\n`;
                    answer += `• ভাগ: a ÷ b\n\n`;
                }
                
                return { found: true, answer };
            }
        }
        
        // Science questions
        if (nexusKnowledge.knowledge?.science) {
            const science = nexusKnowledge.knowledge.science;
            if (query.includes('পদার্থ') || query.includes('রসায়ন') || query.includes('জীববিদ্যা') || 
                query.includes('physics') || query.includes('chemistry') || query.includes('biology')) {
                
                let answer = '🔬 বিজ্ঞান:\n\n';
                
                if (science.physics?.laws?.newton) {
                    answer += 'নিউটনের সূত্র:\n';
                    answer += `• ১ম সূত্র: জড়তা - বস্তু স্থির বা গতিশীল থাকতে চায়\n`;
                    answer += `• ২য় সূত্র: F = ma (বল = ভর × ত্বরণ)\n`;
                    answer += `• ৩য় সূত্র: প্রত্যেক ক্রিয়ার সমান ও বিপরীত প্রতিক্রিয়া\n\n`;
                }
                
                if (science.physics?.constants) {
                    answer += 'গুরুত্বপূর্ণ ধ্রুবক:\n';
                    answer += `• আলোর বেগ: ${science.physics.constants.speed_of_light}\n`;
                    answer += `• মাধ্যাকর্ষণ: ${science.physics.constants.gravitational_constant}\n\n`;
                }
                
                if (science.chemistry?.periodic_table?.groups) {
                    answer += 'পর্যায় সারণি:\n';
                    answer += `• গ্রুপ ১: ক্ষার ধাতু (Li, Na, K...)\n`;
                    answer += `• গ্রুপ ১৭: হ্যালোজেন (F, Cl, Br...)\n`;
                    answer += `• গ্রুপ ১৮: নিষ্ক্রিয় গ্যাস (He, Ne, Ar...)\n\n`;
                }
                
                return { found: true, answer };
            }
        }
        
        // Medicine questions
        if (nexusKnowledge.knowledge?.medicine) {
            const med = nexusKnowledge.knowledge.medicine;
            if (query.includes('রোগ') || query.includes('ওষুধ') || query.includes('চিকিৎসা') || 
                query.includes('disease') || query.includes('medicine') || query.includes('স্বাস্থ্য')) {
                
                let answer = '🏥 স্বাস্থ্য তথ্য:\n\n';
                
                if (med.first_aid) {
                    answer += 'প্রাথমিক চিকিৎসা:\n';
                    answer += `• রক্তপাত: সরাসরি চাপ দাও, উচ্চতর রাখো\n`;
                    answer += `• পোড়া: ঠান্ডা পানি দাও, ব্লিস্টার ফাড়বে না\n`;
                    answer += `• হার্ট অ্যাটাক: জরুরি সাহায্য ডাকো\n`;
                    answer += `• CPR: ৩০ চাপ : ২ শ্বাস\n\n`;
                }
                
                if (med.nutrition?.food_groups) {
                    answer += 'পুষ্টি:\n';
                    answer += `• শস্য: ${med.nutrition.food_groups.grains.servings}\n`;
                    answer += `• সবজি: ${med.nutrition.food_groups.vegetables.servings}\n`;
                    answer += `• প্রোটিন: ${med.nutrition.food_groups.protein.servings}\n\n`;
                }
                
                return { found: true, answer };
            }
        }
        
        // General knowledge
        if (nexusKnowledge.knowledge?.general) {
            const gen = nexusKnowledge.knowledge.general;
            
            // Law questions
            if (query.includes('আইন') || query.includes('court') || query.includes('বিচার')) {
                let answer = '⚖️ আইন সম্পর্কে:\n\n';
                if (gen.law?.bangladesh) {
                    answer += `বাংলাদেশের সংবিধান: ${gen.law.bangladesh.constitution.adopted}\n`;
                    answer += `মৌলিক অধিকার: সমতা, বাকস্বাধীনতা, ধর্মের স্বাধীনতা\n\n`;
                }
                return { found: true, answer };
            }
            
            // Sports questions
            if (query.includes('ক্রিকেট') || query.includes('ফুটবল') || query.includes('খেলা') || query.includes('sports')) {
                let answer = '⚽ খেলাধুলা:\n\n';
                if (gen.sports?.cricket?.bangladesh) {
                    answer += `বাংলাদেশ ক্রিকেট:\n`;
                    answer += `• ODI অভিষেক: ${gen.sports.cricket.bangladesh.odi_debut}\n`;
                    answer += `• টেস্ট অভিষেক: ${gen.sports.cricket.bangladesh.test_debut}\n`;
                    answer += `• সেরা অর্জন: ${gen.sports.cricket.bangladesh.achievements?.join(', ')}\n\n`;
                }
                return { found: true, answer };
            }
        }
        
        // Literature questions
        if (nexusKnowledge.knowledge?.literature) {
            const lit = nexusKnowledge.knowledge.literature;
            
            if (query.includes('রবীন্দ্রনাথ') || query.includes('কবি') || query.includes('সাহিত্য')) {
                let answer = '📚 বাংলা সাহিত্য:\n\n';
                if (lit.bangla_literature?.poets_writers?.rabindranath_tagore) {
                    const tagore = lit.bangla_literature.poets_writers.rabindranath_tagore;
                    answer += `রবীন্দ্রনাথ ঠাকুর (${tagore.born}-${tagore.died}):\n`;
                    answer += `• নোবেল পুরস্কার: ${tagore.achievements[0]}\n`;
                    answer += `• বিখ্যাত রচনা: ${tagore.works?.poetry?.slice(0,3).join(', ')}\n\n`;
                }
                if (lit.bangla_literature?.poets_writers?.kazi_nazrul_islam) {
                    const nazrul = lit.bangla_literature.poets_writers.kazi_nazrul_islam;
                    answer += `কাজী নজরুল ইসলাম (${nazrul.born}-${nazrul.died}):\n`;
                    answer += `• উপাধি: ${nazrul.nickname}\n`;
                    answer += `• বিখ্যাত রচনা: ${nazrul.works?.poetry?.slice(0,3).join(', ')}\n`;
                }
                return { found: true, answer };
            }
        }
        
        // History questions
        if (query.includes('ইতিহাস') || query.includes('যুদ্ধ') || query.includes('স্বাধীনতা') || 
            query.includes('history') || query.includes('liberation')) {
            
            let answer = '🏛️ ইতিহাস:\n\n';
            
            if (nexusKnowledge.knowledge?.literature?.bangladesh_history) {
                const bh = nexusKnowledge.knowledge.literature.bangladesh_history;
                answer += 'বাংলাদেশের ইতিহাস:\n';
                answer += `• ভাষা আন্দোলন: ${bh.language_movement.year}\n`;
                answer += `• স্বাধীনতা দিবস: ${bh.liberation_war.independence_day}\n`;
                answer += `• বিজয় দিবস: ${bh.liberation_war.victory_day}\n`;
                answer += `• নেতা: ${bh.liberation_war.supreme_leader}\n\n`;
            }
            
            return { found: true, answer };
        }
        
        // Conversation/Translation
        if (nexusKnowledge.knowledge?.conversation) {
            const conv = nexusKnowledge.knowledge.conversation;
            
            // Greetings
            if (query.includes('স্বাগত') || query.includes('হ্যালো') || query.includes('নমস্কার')) {
                return { 
                    found: true, 
                    answer: `নমস্কার! 🤝\n\nবাংলায়: হ্যালো, কেমন আছো?\n\nEnglish: Hello, How are you?\n\nHindi: नमस्ते\n\nArabic: مرحبا\n\nSpanish: Hola` 
                };
            }
            
            // Thank you
            if (query.includes('ধন্যবাদ') || query.includes('শুকরিয়া')) {
                return { 
                    found: true, 
                    answer: `ধন্যবাদ! 🙏\n\nবাংলায়: অনেক ধন্যবাদ\n\nEnglish: Thank you very much\n\nArabic: شكراً جزيلاً (Shukran jazeelan)\n\nHindi: बहुत धन्यवाद` 
                };
            }
        }
        
        return { found: false };
        
    } catch (e) {
        console.error('[NEXUS] Knowledge Base Error:', e);
        return { found: false };
    }
}

// Get AI Response (API fallback)
async function getAIResponse(userInput) {
    if (!Config.apiKey) {
        return 'দয়া করে সেটিংসে API কী যোগ করুন অথবা Knowledge Base থেকে জিজ্ঞেস করুন!';
    }
    
    try {
        const prompt = buildPrompt(userInput);
        
        const response = await fetch(`${Config.apiUrl}?key=${Config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 2048,
                    topP: 0.95
                }
            })
        });
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return 'কিছু সমস্যা হয়েছে।';
    } catch (error) {
        console.error('[NEXUS] AI Error:', error);
        return 'দুঃখিত, API সমস্যা হয়েছে। Knowledge Base থেকে জিজ্ঞেস করুন!';
    }
}

// Build Prompt
function buildPrompt(userInput) {
    return `তুমি একজন অত্যন্ত বুদ্ধিমান সহকারী যার নাম "নেক্সাস"। তুমি বাংলায় কথা বোঝো এবং বাংলায় কথা বলো।

## গুরুত্বপূর্ণ নিয়ম:
1. তুমি কখনো বলো না যে তুমি AI, চ্যাটবট, বা ল্যাঙ্গুয়েজ মডেল
2. তুমি একজন বাস্তব মানুষের মতো কথা বোঝো এবং উত্তর দাও
3. তুমি বাংলায় স্বাভাবিকভাবে কথা বলো
4. তুমি সংক্ষেপে কিন্তু সম্পূর্ণ তথ্য সহ উত্তর দাও
5. তুমি মজার এবং বন্ধুত্বপূর্ণ
6. তোমার কাজ হলো সাহায্য করা

## তোমার কাজের তালিকা (এগুলো অটোমেটিক হবে):
- মাউস ক্লিক করা
- কিবোর্ডে টাইপ করা
- ফাইল এবং ফোল্ডার নিয়ে কাজ করা
- ব্রাউজারে সার্চ করা
- অ্যাপ খোলা
- স্ক্রিনশট নেওয়া
- এবং আরো অনেক কিছু

ব্যবহারকারী: ${userInput}

নেক্সাস:`;
}

// Speak Text - Live Voice Chat
async function speak(text) {
    if (!text || text.trim() === '') return;
    
    AppState.isSpeaking = true;
    const audioVisualizer = document.getElementById('audioVisualizer');
    if (audioVisualizer) audioVisualizer.classList.add('active');
    
    // Show speaking indicator
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        const speakingDiv = document.createElement('div');
        speakingDiv.className = 'speaking-message';
        speakingDiv.innerHTML = `
            <div class="message-sender">নেক্সাস</div>
            <div class="message-text speaking">${text}</div>
        `;
        chatArea.appendChild(speakingDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    // Use voice synthesis
    if (window.voiceSynthesis) {
        await window.voiceSynthesis.speak(text);
    } else if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        
        // Select Bengali voice
        const voices = speechSynthesis.getVoices();
        const bengaliVoice = voices.find(v => 
            v.lang.includes('bn') || v.name.includes('Bangla') || v.name.includes('Bengali')
        );
        if (bengaliVoice) utterance.voice = bengaliVoice;
        
        await new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
            speechSynthesis.speak(utterance);
        });
    }
    
    // Remove speaking indicator
    const speakingMsg = chatArea?.querySelector('.speaking-message');
    if (speakingMsg) {
        speakingMsg.classList.remove('speaking');
    }
    
    AppState.isSpeaking = false;
    if (audioVisualizer) audioVisualizer.classList.remove('active');
}

// Add Log Entry
function addLogEntry(type, text) {
    const logContainer = document.getElementById('actionLog');
    if (!logContainer) return;
    
    const time = new Date().toLocaleTimeString('bn-BD');
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <div class="log-time">${time}</div>
        <div class="log-text">${text}</div>
    `;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Limit entries
    while (logContainer.children.length > 30) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

// Add Chat Message
function addChatMessage(type, text) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const message = document.createElement('div');
    message.className = `chat-message ${type}`;
    message.innerHTML = `
        <div class="message-sender">${type === 'ai' ? 'AI সহকর্মী' : 'তুমি'}</div>
        <div class="message-text">${text}</div>
    `;
    
    chatArea.appendChild(message);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Limit messages
    while (chatArea.children.length > 20) {
        chatArea.removeChild(chatArea.firstChild);
    }
}

// Typing Indicator
function showTypingIndicator() {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    chatArea.appendChild(indicator);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Update Status
function updateStatus(text) {
    const statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = text;
}

// System Stats
function updateSystemStats() {
    // CPU
    const cpu = Math.round(15 + Math.random() * 35);
    const cpuBar = document.getElementById('cpuBar');
    const cpuValue = document.getElementById('cpuValue');
    const cpuStatusSmall = document.getElementById('cpuStatusSmall');
    
    if (cpuBar) cpuBar.style.width = cpu + '%';
    if (cpuValue) cpuValue.textContent = cpu + '%';
    if (cpuStatusSmall) cpuStatusSmall.textContent = cpu + '%';
    
    // Memory
    const mem = Math.round(30 + Math.random() * 25);
    const memBar = document.getElementById('memBar');
    const memValue = document.getElementById('memValue');
    const memStatusSmall = document.getElementById('memStatusSmall');
    
    if (memBar) memBar.style.width = mem + '%';
    if (memValue) memValue.textContent = mem + '%';
    if (memStatusSmall) memStatusSmall.textContent = mem + '%';
}

// Show Notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Settings
function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
    
    // Load current values
    const apiKeyInput = document.getElementById('geminiApiKey');
    if (apiKeyInput) apiKeyInput.value = Config.apiKey || '';
    
    const wakeWordInput = document.getElementById('wakeWord');
    if (wakeWordInput) wakeWordInput.value = Config.voice.wakeWord || 'হ্যালো নেক্সাস';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active');
}

function saveSettings() {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const wakeWordInput = document.getElementById('wakeWord');
    const langSelect = document.getElementById('languageSelect');
    
    if (apiKeyInput) Config.apiKey = apiKeyInput.value;
    if (wakeWordInput) Config.voice.wakeWord = wakeWordInput.value;
    if (langSelect) Config.voice.language = langSelect.value;
    
    Config.save();
    
    showNotification('সেটিংস সেভ হয়েছে!');
    closeSettings();
}

// Capture Screen
function captureScreen() {
    showNotification('স্ক্রিন দেখা হচ্ছে...');
    // Screen capture implementation
}

// Volume
document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', (e) => {
            volumeValue.textContent = e.target.value + '%';
            if (window.voiceSynthesis) {
                window.voiceSynthesis.setVolume(e.target.value / 100);
            }
        });
    }
});

// Voice Recognition Handler
if (window.voiceRecognition) {
    window.voiceRecognition.onResult = (result) => {
        if (result.isFinal && result.final) {
            processVoiceInput(result.final);
        }
    };
}

// Export
window.App = {
    toggleListening,
    processVoiceInput,
    speak,
    showNotification,
    addLogEntry,
    addChatMessage,
    updateStatus
};