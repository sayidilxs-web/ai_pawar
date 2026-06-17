/**
 * NEXUS AI - Performance Monitor
 * পারফরম্যান্স মনিটর
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memory: [],
            cpu: 0
        };
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.running = false;
        this.intervalId = null;
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.trackFPS();
        
        // Track every second
        this.intervalId = setInterval(() => {
            this.collectMetrics();
        }, 1000);
        
        console.log('[Performance Monitor] Started');
    }
    
    stop() {
        this.running = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('[Performance Monitor] Stopped');
    }
    
    trackFPS() {
        if (!this.running) return;
        
        const now = performance.now();
        const delta = now - this.lastTime;
        const fps = 1000 / delta;
        
        this.metrics.fps.push(fps);
        if (this.metrics.fps.length > 60) {
            this.metrics.fps.shift();
        }
        
        this.lastTime = now;
        this.frameCount++;
        
        requestAnimationFrame(() => this.trackFPS());
    }
    
    collectMetrics() {
        // Memory
        if (performance.memory) {
            this.metrics.memory.push({
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            });
            
            if (this.metrics.memory.length > 60) {
                this.metrics.memory.shift();
            }
        }
        
        // CPU estimation
        this.metrics.cpu = Math.round(this.frameCount);
        this.frameCount = 0;
    }
    
    getFPS() {
        if (this.metrics.fps.length === 0) return 0;
        const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.fps.length);
    }
    
    getMemory() {
        if (this.metrics.memory.length === 0) return null;
        
        const latest = this.metrics.memory[this.metrics.memory.length - 1];
        return {
            used: latest.used,
            total: latest.total,
            percentage: Math.round((latest.used / latest.total) * 100)
        };
    }
    
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;
        const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.fps.length);
    }
    
    getStats() {
        return {
            fps: this.getFPS(),
            avgFps: this.getAverageFPS(),
            memory: this.getMemory(),
            cpu: this.metrics.cpu
        };
    }
    
    logStats() {
        const stats = this.getStats();
        console.log('[Performance]', stats);
        return stats;
    }
}

// Export
window.performanceMonitor = new PerformanceMonitor();