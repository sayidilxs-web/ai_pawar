/**
 * NEXUS AI - Audio Visualizer Component
 * অডিও ভিজ্যুয়ালাইজার কম্পোনেন্ট
 */

class AudioVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.bars = [];
        this.isActive = false;
        this.analyser = null;
        this.audioContext = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Get all audio bars
        this.bars = this.container.querySelectorAll('.audio-bar');
        console.log('[Audio Visualizer] Found', this.bars.length, 'bars');
    }
    
    start() {
        this.isActive = true;
        this.container.classList.add('active');
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        this.container.classList.remove('active');
        
        // Reset all bars
        this.bars.forEach(bar => {
            bar.style.height = '10px';
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.bars.forEach(bar => {
            const height = Math.random() * 40 + 10;
            bar.style.height = `${height}px`;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    setVolume(level) {
        // Visual feedback for volume
        const intensity = Math.min(level, 1);
        this.bars.forEach((bar, i) => {
            const baseHeight = 10;
            const maxHeight = 40 * intensity;
            bar.style.height = `${baseHeight + (maxHeight - baseHeight) * Math.random()}px`;
        });
    }
    
    // Connect to microphone for real audio visualization
    async connectToMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            source.connect(this.analyser);
            
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            const updateVisualizer = () => {
                if (!this.isActive) return;
                
                this.analyser.getByteFrequencyData(dataArray);
                
                this.bars.forEach((bar, i) => {
                    const index = Math.floor(i * dataArray.length / this.bars.length);
                    const value = dataArray[index];
                    const height = (value / 255) * 40 + 10;
                    bar.style.height = `${height}px`;
                });
                
                requestAnimationFrame(updateVisualizer);
            };
            
            updateVisualizer();
            console.log('[Audio Visualizer] Connected to microphone');
            
        } catch (error) {
            console.error('[Audio Visualizer] Microphone error:', error);
        }
    }
    
    disconnect() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Export
window.AudioVisualizer = AudioVisualizer;