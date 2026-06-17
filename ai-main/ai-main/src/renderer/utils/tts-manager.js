/**
 * NEXUS AI - Text-to-Speech Manager
 * টেক্সট টু স্পিচ ম্যানেজার (Enhanced)
 */

class TextToSpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.volume = 0.8;
        this.rate = 0.9;
        this.pitch = 1.0;
        this.lang = 'bn-BD';
        this.isSpeaking = false;
        this.queue = [];
        this.currentUtterance = null;
        
        this.onStartCallback = null;
        this.onEndCallback = null;
        this.onErrorCallback = null;
        
        this.init();
    }
    
    init() {
        if (!this.synth) {
            console.error('[TTS Manager] Browser not supported');
            return false;
        }
        
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
            this.selectBestVoice();
        };
        
        loadVoices();
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        this.synth.onstart = () => {
            this.isSpeaking = true;
            if (this.onStartCallback) this.onStartCallback();
        };
        
        this.synth.onend = () => {
            this.isSpeaking = false;
            this.processQueue();
            if (this.onEndCallback) this.onEndCallback();
        };
        
        this.synth.onerror = (event) => {
            console.error('[TTS Manager] Error:', event.error);
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };
        
        console.log('[TTS Manager] Initialized');
        return true;
    }
    
    selectBestVoice() {
        // Priority: Bengali, Google, then any
        const priorities = [
            'Google বাংলা',
            'Bengali',
            'Bangla',
            'bn-BD',
            'bn',
            'Google'
        ];
        
        for (const name of priorities) {
            const voice = this.voices.find(v => 
                v.name.includes(name) || v.lang.includes(name)
            );
            if (voice) {
                this.selectedVoice = voice;
                console.log('[TTS Manager] Selected:', voice.name);
                return;
            }
        }
        
        // Fallback
        const bengali = this.voices.find(v => v.lang.startsWith('bn'));
        if (bengali) {
            this.selectedVoice = bengali;
            return;
        }
        
        if (this.voices.length > 0) {
            this.selectedVoice = this.voices[0];
        }
    }
    
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error('TTS not supported'));
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.volume = options.volume ?? this.volume;
            utterance.rate = options.rate ?? this.rate;
            utterance.pitch = options.pitch ?? this.pitch;
            utterance.lang = options.lang ?? this.lang;
            
            if (options.voice) {
                utterance.voice = options.voice;
            } else if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                reject(event);
            };
            
            if (options.queue !== false && this.isSpeaking) {
                this.queue.push({ utterance, resolve, reject });
            } else {
                this.synth.cancel();
                this.synth.speak(utterance);
                this.currentUtterance = utterance;
            }
        });
    }
    
    processQueue() {
        if (this.queue.length === 0) return;
        
        const next = this.queue.shift();
        this.synth.speak(next.utterance);
        this.currentUtterance = next.utterance;
    }
    
    stop() {
        this.synth.cancel();
        this.queue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
    }
    
    pause() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
    }
    
    resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }
    
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }
    
    setLanguage(lang) {
        this.lang = lang;
        this.selectBestVoice();
    }
    
    getVoices() {
        return this.voices;
    }
    
    onStart(callback) {
        this.onStartCallback = callback;
    }
    
    onEnd(callback) {
        this.onEndCallback = callback;
    }
    
    onError(callback) {
        this.onErrorCallback = callback;
    }
    
    isSpeaking() {
        return this.isSpeaking;
    }
    
    getQueueLength() {
        return this.queue.length;
    }
}

// Export
window.textToSpeechManager = new TextToSpeechManager();