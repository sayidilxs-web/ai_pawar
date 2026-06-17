/**
 * NEXUS AI - Live Voice Chat Module
 * লাইভ ভয়েস চ্যাট - সরাসরি কথা বলা
 */

class LiveVoiceChat {
    constructor() {
        this.isActive = false;
        this.currentSpeaker = null; // 'user' or 'ai'
        this.queue = [];
        this.isSpeaking = false;
        this.volume = 0.9;
    }
    
    init() {
        console.log('[Live Voice Chat] Initialized');
    }
    
    /**
     * Speak text immediately (no queue)
     */
    async speakNow(text, voice = 'ai') {
        if (!text || text.trim() === '') return;
        
        this.currentSpeaker = voice;
        this.isSpeaking = true;
        
        try {
            // Cancel any ongoing speech
            if (window.voiceSynthesis) {
                window.voiceSynthesis.stop();
            }
            
            // Speak immediately
            await this.speakText(text);
            
        } catch (error) {
            console.error('[Live Voice Chat] Speak error:', error);
        } finally {
            this.isSpeaking = false;
            this.currentSpeaker = null;
        }
    }
    
    /**
     * Speak text with character-by-character sync
     */
    async speakWithSync(text, element) {
        if (!text || text.trim() === '') return;
        
        this.isSpeaking = true;
        this.currentSpeaker = 'ai';
        
        try {
            // Cancel any ongoing speech
            if (window.voiceSynthesis) {
                window.voiceSynthesis.stop();
            }
            
            // Speak the full text
            await this.speakText(text);
            
        } catch (error) {
            console.error('[Live Voice Chat] Sync error:', error);
        } finally {
            this.isSpeaking = false;
            this.currentSpeaker = null;
        }
    }
    
    /**
     * Main speak function
     */
    async speakText(text) {
        return new Promise((resolve, reject) => {
            if (!window.voiceSynthesis) {
                console.warn('[Live Voice Chat] No voice synthesis');
                resolve();
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Settings
            utterance.volume = this.volume;
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.lang = 'bn-BD';
            
            // Select Bengali voice
            const voices = window.speechSynthesis.getVoices();
            const bengaliVoice = voices.find(v => 
                v.lang.includes('bn') || 
                v.name.includes('Bangla') ||
                v.name.includes('Bengali') ||
                v.name.includes('Google')
            );
            
            if (bengaliVoice) {
                utterance.voice = bengaliVoice;
            }
            
            utterance.onstart = () => {
                console.log('[Live Voice Chat] Started speaking');
                this.updateSpeakingIndicator(true);
            };
            
            utterance.onend = () => {
                console.log('[Live Voice Chat] Finished speaking');
                this.updateSpeakingIndicator(false);
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('[Live Voice Chat] Error:', event.error);
                this.updateSpeakingIndicator(false);
                resolve(); // Resolve anyway to not block
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }
    
    /**
     * Stop speaking
     */
    stop() {
        if (window.voiceSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentSpeaker = null;
        this.updateSpeakingIndicator(false);
    }
    
    /**
     * Pause speaking
     */
    pause() {
        if (window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    }
    
    /**
     * Resume speaking
     */
    resume() {
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
    }
    
    /**
     * Update volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Update speaking indicator in UI
     */
    updateSpeakingIndicator(speaking) {
        const indicator = document.getElementById('voiceIndicator');
        if (indicator) {
            if (speaking) {
                indicator.classList.add('speaking');
                indicator.querySelector('.indicator-text').textContent = 'বলছি...';
            } else {
                indicator.classList.remove('speaking');
                indicator.querySelector('.indicator-text').textContent = 'শুনছি';
            }
        }
    }
    
    /**
     * Check if currently speaking
     */
    isCurrentlySpeaking() {
        return this.isSpeaking;
    }
    
    /**
     * Toggle voice output
     */
    toggle() {
        if (this.isSpeaking) {
            this.stop();
            return false;
        }
        return true;
    }
}

// Create global instance
window.liveVoiceChat = new LiveVoiceChat();

// Export
window.LiveVoiceChat = LiveVoiceChat;