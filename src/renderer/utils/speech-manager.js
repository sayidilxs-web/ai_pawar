/**
 * NEXUS AI - Speech Recognition Manager
 * স্পিচ রিকগনিশন ম্যানেজার (Enhanced)
 */

class SpeechRecognitionManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isContinuous = true;
        this.interimResults = true;
        this.maxAlternatives = 1;
        this.language = 'bn-BD';
        this.lastTranscript = '';
        this.confidence = 0;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onStartCallback = null;
        this.onEndCallback = null;
        
        this.init();
    }
    
    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('[Speech Recognition Manager] Browser not supported');
            return false;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.isContinuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.maxAlternatives = this.maxAlternatives;
        this.recognition.lang = this.language;
        
        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('[Speech Recognition Manager] Started');
            if (this.onStartCallback) this.onStartCallback();
        };
        
        this.recognition.onresult = (event) => {
            this.handleResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Speech Recognition Manager] Error:', event.error);
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('[Speech Recognition Manager] Ended');
            if (this.onEndCallback) this.onEndCallback();
            
            // Auto restart if continuous mode
            if (this.isContinuous && !this.recognition.ended) {
                this.start();
            }
        };
        
        this.recognition.onspeechstart = () => {
            console.log('[Speech Recognition Manager] Speech detected');
        };
        
        this.recognition.onspeechend = () => {
            console.log('[Speech Recognition Manager] Speech ended');
        };
        
        console.log('[Speech Recognition Manager] Initialized');
        return true;
    }
    
    handleResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        let maxConfidence = 0;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const alternative = result[0];
            
            if (result.isFinal) {
                finalTranscript += alternative.transcript;
                maxConfidence = Math.max(maxConfidence, alternative.confidence);
            } else {
                interimTranscript += alternative.transcript;
            }
        }
        
        this.lastTranscript = finalTranscript || interimTranscript;
        this.confidence = maxConfidence;
        
        if (this.onResultCallback) {
            this.onResultCallback({
                final: finalTranscript,
                interim: interimTranscript,
                confidence: maxConfidence,
                isFinal: !!finalTranscript
            });
        }
    }
    
    start() {
        if (!this.recognition) return false;
        
        try {
            this.recognition.lang = this.language;
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('[Speech Recognition Manager] Start error:', error);
            
            if (error.name === 'InvalidStateError') {
                this.stop();
                setTimeout(() => this.start(), 100);
            }
            return false;
        }
    }
    
    stop() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('[Speech Recognition Manager] Stop error:', error);
        }
    }
    
    abort() {
        if (!this.recognition) return;
        
        try {
            this.recognition.abort();
            this.isListening = false;
        } catch (error) {
            console.error('[Speech Recognition Manager] Abort error:', error);
        }
    }
    
    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }
    
    setContinuous(continuous) {
        this.isContinuous = continuous;
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }
    
    setInterimResults(interim) {
        this.interimResults = interim;
        if (this.recognition) {
            this.recognition.interimResults = interim;
        }
    }
    
    onResult(callback) {
        this.onResultCallback = callback;
    }
    
    onError(callback) {
        this.onErrorCallback = callback;
    }
    
    onStart(callback) {
        this.onStartCallback = callback;
    }
    
    onEnd(callback) {
        this.onEndCallback = callback;
    }
    
    getLastTranscript() {
        return this.lastTranscript;
    }
    
    getConfidence() {
        return this.confidence;
    }
    
    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
}

// Export
window.speechRecognitionManager = new SpeechRecognitionManager();