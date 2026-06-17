/**
 * NEXUS AI - Voice Synthesis Module
 * বাংলা টেক্সট টু স্পিচ
 */

class VoiceSynthesis {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.volume = 0.8;
        this.rate = 0.9;
        this.pitch = 1.0;
        this.language = Config.voice.synthesisLang || 'bn-BD';
        this.isSpeaking = false;
        
        this.init();
    }
    
    init() {
        if (!this.synth) {
            console.error('[Voice Synthesis] Browser not supported');
            return;
        }
        
        // Load voices
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
            console.log('[Voice Synthesis] Loaded', this.voices.length, 'voices');
            this.selectBestVoice();
        };
        
        // Voices might load async
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        // Track speaking state
        this.synth.onstart = () => {
            console.log('[Voice Synthesis] Started');
            this.isSpeaking = true;
        };
        
        this.synth.onend = () => {
            console.log('[Voice Synthesis] Ended');
            this.isSpeaking = false;
        };
        
        this.synth.onerror = (event) => {
            console.error('[Voice Synthesis] Error:', event.error);
            this.isSpeaking = false;
        };
        
        console.log('[Voice Synthesis] Initialized');
    }
    
    selectBestVoice() {
        // Priority: Bengali voices, then Google, then any Bengali
        const priorityNames = [
            'Google বাংলা',
            'Bengali',
            'Bangla',
            'bn-BD',
            'bn',
            'hi-IN', // Hindi fallback
            'Google'
        ];
        
        // Find best matching voice
        for (const name of priorityNames) {
            let voice = this.voices.find(v => 
                v.name.includes(name) || 
                v.lang.includes(name) ||
                v.localService && v.name.toLowerCase().includes('google')
            );
            
            if (voice) {
                this.selectedVoice = voice;
                console.log('[Voice Synthesis] Selected voice:', voice.name, voice.lang);
                return;
            }
        }
        
        // Fallback to any Bengali voice
        let voice = this.voices.find(v => v.lang.startsWith('bn'));
        if (voice) {
            this.selectedVoice = voice;
            console.log('[Voice Synthesis] Selected Bengali voice:', voice.name);
            return;
        }
        
        // Last resort: first available voice
        if (this.voices.length > 0) {
            this.selectedVoice = this.voices[0];
            console.log('[Voice Synthesis] Using fallback voice:', this.selectedVoice.name);
        }
    }
    
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            // Cancel any ongoing speech
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Apply settings
            utterance.volume = this.volume;
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
            utterance.lang = this.language;
            
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            utterance.onstart = () => {
                this.isSpeaking = true;
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('[Voice Synthesis] Error:', event.error);
                reject(event);
            };
            
            console.log('[Voice Synthesis] Speaking:', text.substring(0, 50) + '...');
            this.synth.speak(utterance);
        });
    }
    
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
            console.log('[Voice Synthesis] Stopped');
        }
    }
    
    pause() {
        if (this.synth) {
            this.synth.pause();
            console.log('[Voice Synthesis] Paused');
        }
    }
    
    resume() {
        if (this.synth) {
            this.synth.resume();
            console.log('[Voice Synthesis] Resumed');
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log('[Voice Synthesis] Volume set to:', this.volume);
    }
    
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
        console.log('[Voice Synthesis] Rate set to:', this.rate);
    }
    
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
        console.log('[Voice Synthesis] Pitch set to:', this.pitch);
    }
    
    setLanguage(lang) {
        this.language = lang;
        console.log('[Voice Synthesis] Language set to:', lang);
        this.selectBestVoice();
    }
    
    getVoices() {
        return this.voices;
    }
    
    isSupported() {
        return !!this.synth;
    }
    
    getIsSpeaking() {
        return this.isSpeaking;
    }
}

// Initialize and export
window.voiceSynthesis = new VoiceSynthesis();

// Test on load
console.log('[Voice Synthesis] Supported:', window.voiceSynthesis.isSupported());