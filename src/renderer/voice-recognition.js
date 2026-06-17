/**
 * NEXUS AI - Voice Recognition Module
 * বাংলা ভয়েস রিকগনিশন - শুধু "নেক্সাস" ডাকলে কাজ করে
 */

class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isRunning = false;
        this.language = Config.voice.recognitionLang || 'bn-BD';
        this.interimTranscript = '';
        this.finalTranscript = '';
        this.isActivated = false; // নেক্সাস ডাকলে সক্রিয় হবে
        this.wakeWords = ['নেক্সাস', 'nexus', 'nexas', 'nekxas', 'হ্যালো নেক্সাস', 'hey nexus', 'hi nexus'];
        this.activationTimeout = null;
        this.activationDuration = 30000; // 30 সেকেন্ড পর নিজে বন্ধ হবে
        
        this.init();
    }
    
    init() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('[Voice Recognition] Browser not supported');
            this.showError('আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.language;
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('[Voice Recognition] Started');
            this.isRunning = true;
        };
        
        this.recognition.onresult = (event) => {
            this.handleResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Voice Recognition] Error:', event.error);
            this.handleError(event.error);
        };
        
        this.recognition.onend = () => {
            console.log('[Voice Recognition] Ended');
            this.isRunning = false;
            
            // Restart if still supposed to be listening
            if (AppState.isListening && !AppState.isProcessing) {
                this.start();
            }
        };
        
        this.recognition.onaudiostart = () => {
            console.log('[Voice Recognition] Audio started');
        };
        
        this.recognition.onaudioend = () => {
            console.log('[Voice Recognition] Audio ended');
        };
        
        this.recognition.onspeechstart = () => {
            console.log('[Voice Recognition] Speech detected');
            if (window.App && this.isActivated) {
                window.App.showNotification('কথা শুনছি...');
            }
        };
        
        this.recognition.onspeechend = () => {
            console.log('[Voice Recognition] Speech ended');
        };
        
        console.log('[Voice Recognition] Initialized');
    }
    
    handleResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        this.interimTranscript = interimTranscript;
        
        if (finalTranscript) {
            this.finalTranscript = finalTranscript;
            console.log('[Voice Recognition] Final:', finalTranscript);
            
            // চেক করো নেক্সাস ডাকা হয়েছে কিনা
            const isWakeWord = this.wakeWords.some(wakeWord => 
                finalTranscript.includes(wakeWord.toLowerCase())
            );
            
            if (!this.isActivated && isWakeWord) {
                // নেক্সাস সক্রিয় হলো
                this.activate();
                if (window.App) {
                    window.App.showNotification('হ্যাঁ, আমি এখানে আছি! কি করতে পারি?');
                    window.App.speak('হ্যাঁ, আমি এখানে আছি! কি করতে পারি?');
                }
            } else if (this.isActivated) {
                // নেক্সাস সক্রিয় থাকলে কমান্ড প্রসেস করো
                if (window.App) {
                    window.App.processVoiceInput(finalTranscript.trim());
                }
                this.resetActivationTimer();
            } else {
                // নেক্সাস সক্রিয় না থাকলে কিছু করবে না
                console.log('[Voice Recognition] Waiting for wake word...');
            }
            
            this.finalTranscript = '';
        }
    }
    
    activate() {
        this.isActivated = true;
        this.resetActivationTimer();
        if (window.App) {
            window.App.setActivated(true);
        }
        console.log('[Voice Recognition] NEXUS ACTIVATED!');
    }
    
    deactivate() {
        this.isActivated = false;
        if (this.activationTimeout) {
            clearTimeout(this.activationTimeout);
            this.activationTimeout = null;
        }
        if (window.App) {
            window.App.setActivated(false);
        }
        console.log('[Voice Recognition] NEXUS DEACTIVATED');
    }
    
    resetActivationTimer() {
        if (this.activationTimeout) {
            clearTimeout(this.activationTimeout);
        }
        this.activationTimeout = setTimeout(() => {
            this.deactivate();
            if (window.App) {
                window.App.showNotification('সময় শেষ। আবার ডাকলে আসব!');
            }
        }, this.activationDuration);
    }
    
    handleError(error) {
        let message = '';
        
        switch (error) {
            case 'no-speech':
                message = 'কোনো কথা শনিনি';
                break;
            case 'audio-capture':
                message = 'মাইক খুঁজে পাওয়া যায়নি';
                break;
            case 'not-allowed':
                message = 'মাইক ব্যবহারের অনুমতি নেই';
                break;
            case 'network':
                message = 'নেটওয়ার্ক সমস্যা';
                break;
            case 'aborted':
                message = 'বাতিল করা হয়েছে';
                break;
            case 'service-not-allowed':
                message = 'সার্ভিস অনুমতি নেই';
                break;
            default:
                message = 'সমস্যা: ' + error;
        }
        
        if (error !== 'aborted' && error !== 'no-speech') {
            console.error('[Voice Recognition] Error:', message);
            if (window.App) {
                window.App.showNotification(message);
            }
        }
    }
    
    showError(message) {
        if (window.App) {
            window.App.showNotification(message);
        }
    }
    
    async start() {
        if (!this.recognition) {
            console.error('[Voice Recognition] Not initialized');
            return false;
        }
        
        if (this.isRunning) {
            console.log('[Voice Recognition] Already running');
            return true;
        }
        
        try {
            this.recognition.lang = this.language;
            this.recognition.start();
            console.log('[Voice Recognition] Starting...');
            return true;
        } catch (error) {
            console.error('[Voice Recognition] Start error:', error);
            
            // If already started, try to restart
            if (error.name === 'InvalidStateError') {
                this.stop();
                setTimeout(() => this.start(), 100);
            }
            return false;
        }
    }
    
    async stop() {
        if (!this.recognition || !this.isRunning) {
            return;
        }
        
        try {
            this.recognition.stop();
            console.log('[Voice Recognition] Stopping...');
            this.deactivate();
        } catch (error) {
            console.error('[Voice Recognition] Stop error:', error);
        }
    }
    
    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
        console.log('[Voice Recognition] Language set to:', lang);
    }
    
    getInterimTranscript() {
        return this.interimTranscript;
    }
    
    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
    
    isActivatedByUser() {
        return this.isActivated;
    }
}

// Initialize and export
window.voiceRecognition = new VoiceRecognition();

// Test on load
console.log('[Voice Recognition] Supported:', window.voiceRecognition.isSupported());