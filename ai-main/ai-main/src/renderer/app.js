/**
 * NEXUS AI - Advanced Main Application
 * মূল অ্যাপ্লিকেশন লজিক - সব ভাষায় সমর্থন
 */

const AppState = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    lastTranscript: '',
    conversationHistory: [],
    currentLanguage: 'bn-BD'
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[NEXUS] Initializing...');
    await initializeComponents();
    setTimeout(() => {
        showNotification('NEXUS AI স্বাগতম! 🌍');
        const greeting = LanguageConfig ? LanguageConfig.getGreeting(AppState.currentLanguage) : 'Hello! I am NEXUS.';
        speak(greeting);
    }, 1000);
    setInterval(updateSystemStats, 2000);
    updateNeuralStatus();
    console.log('[NEXUS] Ready - Multi-language mode active');
});

async function initializeComponents() {
    console.log('[NEXUS] Initializing components...');
    if (typeof OrbComponent !== 'undefined') {
        window.orbComponent = new OrbComponent('coreClickable');
        console.log('[NEXUS] Orb component initialized');
    }
    if (typeof AudioVisualizer !== 'undefined') {
        window.audioVisualizer = new AudioVisualizer('audioVisualizer');
        console.log('[NEXUS] Audio visualizer initialized');
    }
    if (window.keyboardShortcuts) window.keyboardShortcuts.init();
    if (Config.faceRecognition && Config.faceRecognition.enabled) {
        try { await initFaceRecognition(); } catch (e) { console.warn('[NEXUS] Face recognition failed:', e); }
    }
    if (window.phoneConnection) await window.phoneConnection.init();
    if (window.notificationBridge) await window.notificationBridge.init();
    if (window.taskScheduler) window.taskScheduler.init();
    if (window.integrations) window.integrations.init();
    if (window.DatabaseManager) {
        window.databaseManager = new DatabaseManager();
        try { await window.databaseManager.initialize(); } catch (e) { console.warn('[NEXUS] Database failed:', e); }
    }
    console.log('[NEXUS] All components initialized');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    const message = chatInput.value.trim();
    if (!message) return;
    chatInput.value = '';
    addChatMessage('user', message);
    addLogEntry('action', message);
    showTypingIndicator();
    AppState.isProcessing = true;
    updateStatus('Thinking... 🤔');
    try {
        let response;
        if (window.aiCore) response = await window.aiCore.generateResponse(message);
        else response = await getAIResponse(message);
        removeTypingIndicator();
        addChatMessage('ai', response);
        speak(response);
        updateStatus('Ready ✓');
    } catch (error) {
        removeTypingIndicator();
        addChatMessage('ai', '❌ Error. Please try again.');
        updateStatus('Error');
    }
    AppState.isProcessing = false;
}

function changeChatLanguage(langCode) {
    AppState.currentLanguage = langCode;
    if (window.aiCore) window.aiCore.setLanguage(langCode);
    const langConfig = LanguageConfig?.supportedLanguages?.[langCode];
    showNotification('Language: ' + (langConfig?.name || langCode));
}

async function generateImage() {
    const description = prompt('Image description:');
    if (!description) return;
    addChatMessage('user', '🖼️ ' + description);
    showTypingIndicator();
    if (window.aiCore) {
        const result = await window.aiCore.generateImage(description);
        addChatMessage('ai', result.success ? result.response : '❌ ' + result.error);
    } else addChatMessage('ai', 'Configure AI Core first');
    removeTypingIndicator();
}

async function generatePDF() {
    const title = prompt('PDF Title:');
    if (!title) return;
    addChatMessage('user', '📄 ' + title);
    showTypingIndicator();
    if (window.aiCore) {
        const result = await window.aiCore.generatePDF(title, 'Content');
        addChatMessage('ai', '📄 PDF: ' + title);
    } else addChatMessage('ai', 'Configure AI Core first');
    removeTypingIndicator();
}

async function generateCode() {
    const request = prompt('Code request:');
    if (!request) return;
    addChatMessage('user', '💻 ' + request);
    showTypingIndicator();
    if (window.aiCore) {
        const result = await window.aiCore.generateCode(request);
        addChatMessage('ai', result.success ? '💻 Code: ' + result.code : '❌ Error');
    } else addChatMessage('ai', 'Configure AI Core first');
    removeTypingIndicator();
}

async function translateText() {
    const text = prompt('Text to translate:');
    if (!text) return;
    showTypingIndicator();
    if (window.aiCore) {
        const result = await window.aiCore.translate(text, 'bn-BD');
        addChatMessage('ai', '🌐 ' + result.translation);
    } else addChatMessage('ai', 'Configure AI Core first');
    removeTypingIndicator();
}

async function toggleListening() {
    if (AppState.isProcessing) return;
    AppState.isListening = !AppState.isListening;
    const statusText = document.getElementById('statusText');
    const listenBtn = document.getElementById('listenBtn');
    const wakeIndicator = document.getElementById('wakeIndicator');
    const audioVisualizer = document.getElementById('audioVisualizer');
    if (AppState.isListening) {
        statusText.textContent = 'Listening... 🔴';
        listenBtn?.classList.add('active');
        wakeIndicator?.classList.add('active');
        audioVisualizer?.classList.add('active');
        if (window.voiceRecognition) await window.voiceRecognition.start();
    } else {
        statusText.textContent = 'Ready';
        listenBtn?.classList.remove('active');
        wakeIndicator?.classList.remove('active');
        audioVisualizer?.classList.remove('active');
        if (window.voiceRecognition) await window.voiceRecognition.stop();
    }
}

async function processVoiceInput(transcript) {
    if (!transcript || transcript.trim() === '') return;
    console.log('[NEXUS] Heard:', transcript);
    addChatMessage('user', transcript);
    AppState.isProcessing = true;
    updateStatus('Thinking...');
    showTypingIndicator();
    let response;
    if (window.aiCore) response = await window.aiCore.generateResponse(transcript);
    else response = await getAIResponse(transcript);
    removeTypingIndicator();
    addChatMessage('ai', response);
    speak(response);
    AppState.isProcessing = false;
    updateStatus('Ready');
}

async function getAIResponse(userInput) {
    if (!Config.apiKey) return 'Add API key in Settings';
    try {
        const response = await fetch(Config.apiUrl + '?key=' + Config.apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(userInput) }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error';
    } catch (error) { return 'Error: ' + error.message; }
}

function buildPrompt(userInput) {
    const langName = LanguageConfig?.supportedLanguages?.[AppState.currentLanguage]?.native || 'Bengali';
    return 'You are NEXUS. Respond in ' + langName + '. User: ' + userInput + '. NEXUS:';
}

async function speak(text) {
    if (!text || !window.speechSynthesis) return;
    AppState.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = AppState.currentLanguage;
    utterance.rate = 0.95;
    await new Promise(resolve => { utterance.onend = resolve; utterance.onerror = resolve; speechSynthesis.speak(utterance); });
    AppState.isSpeaking = false;
}

function addLogEntry(type, text) {
    const logContainer = document.getElementById('actionLog');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.innerHTML = '<div class="log-time">' + new Date().toLocaleTimeString() + '</div><div class="log-text">' + text + '</div>';
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
    while (logContainer.children.length > 50) logContainer.removeChild(logContainer.firstChild);
}

function addChatMessage(type, text) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    const message = document.createElement('div');
    message.className = 'chat-message ' + type;
    message.innerHTML = '<div class="message-sender">' + (type === 'ai' ? '🤖 NEXUS AI' : '👤 You') + '</div><div class="message-text">' + text + '</div>';
    chatArea.appendChild(message);
    chatArea.scrollTop = chatArea.scrollHeight;
    while (chatArea.children.length > 50) chatArea.removeChild(chatArea.firstChild);
}

function showTypingIndicator() {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    removeTypingIndicator();
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatArea.appendChild(indicator);
}

function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

function updateSystemStats() {
    const cpu = Math.round(15 + Math.random() * 35);
    const mem = Math.round(30 + Math.random() * 25);
    document.getElementById('cpuBar').style.width = cpu + '%';
    document.getElementById('cpuValue').textContent = cpu + '%';
    document.getElementById('memBar').style.width = mem + '%';
    document.getElementById('memValue').textContent = mem + '%';
}

function updateNeuralStatus() {
    if (window.aiCore?.neuralNetwork) console.log('[Neural]', window.aiCore.neuralNetwork.getStats());
}

function showNotification(message) {
    const el = document.getElementById('notification');
    if (el) {
        document.getElementById('notificationText').textContent = message;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }
}

function openSettings() {
    document.getElementById('settingsModal')?.classList.add('active');
    const apiKeyInput = document.getElementById('geminiApiKey');
    if (apiKeyInput) apiKeyInput.value = Config.apiKey || '';
}

function closeSettings() {
    document.getElementById('settingsModal')?.classList.remove('active');
}

function saveSettings() {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const langSelect = document.getElementById('languageSelect');
    if (apiKeyInput) {
        Config.apiKey = apiKeyInput.value;
        if (window.aiCore) window.aiCore.setApiKey(apiKeyInput.value);
    }
    if (langSelect) {
        AppState.currentLanguage = langSelect.value;
        if (window.aiCore) window.aiCore.setLanguage(langSelect.value);
    }
    Config.save();
    showNotification('Settings saved! ✓');
    closeSettings();
}

window.App = { toggleListening, processVoiceInput, sendChatMessage, handleChatKeyPress, changeChatLanguage, generateImage, generatePDF, generateCode, translateText, speak, showNotification, addChatMessage };
window.sendChatMessage = sendChatMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.changeChatLanguage = changeChatLanguage;
window.generateImage = generateImage;
window.generatePDF = generatePDF;
window.generateCode = generateCode;
window.translateText = translateText;