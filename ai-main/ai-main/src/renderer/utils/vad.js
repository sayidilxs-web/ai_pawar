/**
 * NEXUS AI - Voice Activity Detector
 * ভয়েস অ্যাক্টিভিটি ডিটেক্টর
 */

class VoiceActivityDetector {
    constructor(options = {}) {
        this.enabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.onVoiceStart = options.onVoiceStart || (() => {});
        this.onVoiceEnd = options.onVoiceEnd || (() => {});
        this.threshold = options.threshold || 0.02;
        this.silenceDelay = options.silenceDelay || 500;
        this.isSpeaking = false;
        this.silenceTimer = null;
    }
    
    async start() {
        if (this.enabled) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.microphone = stream;
            this.enabled = true;
            
            this.detect();
            
            console.log('[VAD] Started');
            return true;
        } catch (error) {
            console.error('[VAD] Start error:', error);
            return false;
        }
    }
    
    stop() {
        this.enabled = false;
        
        if (this.microphone) {
            this.microphone.getTracks().forEach(track => track.stop());
            this.microphone = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        console.log('[VAD] Stopped');
    }
    
    detect() {
        if (!this.enabled || !this.analyser) return;
        
        const dataArray = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(dataArray);
        
        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Voice activity check
        if (rms > this.threshold && !this.isSpeaking) {
            this.isSpeaking = true;
            this.onVoiceStart();
            
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
                this.silenceTimer = null;
            }
        } else if (rms <= this.threshold && this.isSpeaking) {
            // Start silence timer
            if (!this.silenceTimer) {
                this.silenceTimer = setTimeout(() => {
                    if (this.isSpeaking) {
                        this.isSpeaking = false;
                        this.onVoiceEnd();
                    }
                }, this.silenceDelay);
            }
        }
        
        requestAnimationFrame(() => this.detect());
    }
    
    setThreshold(value) {
        this.threshold = value;
    }
    
    setSilenceDelay(value) {
        this.silenceDelay = value;
    }
    
    isActive() {
        return this.isSpeaking;
    }
}

// Export
window.VoiceActivityDetector = VoiceActivityDetector;