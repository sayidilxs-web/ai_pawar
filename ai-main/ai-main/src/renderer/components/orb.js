/**
 * NEXUS AI - Orb Component
 * অ্যানিমেটেড অরব কম্পোনেন্ট
 */

class OrbComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isActive = false;
        this.animationFrame = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Add click handler
        this.container.addEventListener('click', () => this.onClick());
        
        // Add hover effects
        this.container.addEventListener('mouseenter', () => this.onHover(true));
        this.container.addEventListener('mouseleave', () => this.onHover(false));
        
        console.log('[Orb Component] Initialized');
    }
    
    onClick() {
        console.log('[Orb] Clicked');
        
        // Add pulse animation
        this.container.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.container.style.transform = 'scale(1)';
        }, 100);
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('orb-click'));
    }
    
    onHover(entering) {
        if (entering && !this.isActive) {
            this.container.style.transform = 'scale(1.05)';
            this.container.style.cursor = 'pointer';
        } else if (!this.isActive) {
            this.container.style.transform = 'scale(1)';
        }
    }
    
    activate() {
        this.isActive = true;
        this.container.classList.add('active');
        
        // Increase glow
        const glow = this.container.querySelector('.orb-glow');
        if (glow) {
            glow.style.animation = 'glowPulse 1.5s ease-in-out infinite';
        }
    }
    
    deactivate() {
        this.isActive = false;
        this.container.classList.remove('active');
        
        // Reset glow
        const glow = this.container.querySelector('.orb-glow');
        if (glow) {
            glow.style.animation = 'glowPulse 3s ease-in-out infinite';
        }
    }
    
    setListening(listening) {
        if (listening) {
            this.container.classList.add('listening');
        } else {
            this.container.classList.remove('listening');
        }
    }
    
    setProcessing(processing) {
        if (processing) {
            this.container.classList.add('processing');
            this.startProcessingAnimation();
        } else {
            this.container.classList.remove('processing');
            this.stopProcessingAnimation();
        }
    }
    
    startProcessingAnimation() {
        let rotation = 0;
        
        const animate = () => {
            if (!this.container.classList.contains('processing')) return;
            
            rotation += 2;
            const inner = this.container.querySelector('.orb-inner');
            if (inner) {
                inner.style.transform = `rotate(${rotation}deg)`;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stopProcessingAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    setColor(primary, secondary) {
        const inner = this.container.querySelector('.orb-inner');
        if (inner) {
            inner.style.background = `radial-gradient(circle at 30% 30%, 
                rgba(${primary}, 0.8) 0%,
                rgba(${primary}, 0.6) 20%,
                rgba(${secondary}, 0.4) 50%,
                rgba(0, 50, 100, 0.8) 80%,
                rgba(0, 0, 50, 1) 100%
            )`;
        }
    }
}

// Export
window.OrbComponent = OrbComponent;