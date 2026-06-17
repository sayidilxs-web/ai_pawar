/**
 * NEXUS AI - Animations Utility
 * অ্যানিমেশন ইউটিলিটি
 */

const Animations = {
    // Predefined keyframe sets
    keyframes: {
        fadeIn: [
            { opacity: 0 },
            { opacity: 1 }
        ],
        fadeOut: [
            { opacity: 1 },
            { opacity: 0 }
        ],
        slideInLeft: [
            { transform: 'translateX(-100px)', opacity: 0 },
            { transform: 'translateX(0)', opacity: 1 }
        ],
        slideInRight: [
            { transform: 'translateX(100px)', opacity: 0 },
            { transform: 'translateX(0)', opacity: 1 }
        ],
        slideInUp: [
            { transform: 'translateY(50px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ],
        slideInDown: [
            { transform: 'translateY(-50px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ],
        scaleIn: [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        bounce: [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-20px)' },
            { transform: 'translateY(0)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0)' }
        ],
        pulse: [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.1)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        shake: [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ],
        spin: [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ],
        glow: [
            { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5)' },
            { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8)' },
            { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5)' }
        ]
    },
    
    // Animate element
    animate(element, keyframeName, options = {}) {
        const keyframes = this.keyframes[keyframeName];
        if (!keyframes) {
            console.warn('[Animations] Unknown keyframe:', keyframeName);
            return null;
        }
        
        const {
            duration = 300,
            easing = 'ease',
            iterations = 1,
            delay = 0,
            fill = 'forwards'
        } = options;
        
        return element.animate(keyframes, {
            duration,
            easing,
            iterations,
            delay,
            fill
        });
    },
    
    // Preset animations
    fadeIn(element, duration = 300) {
        return this.animate(element, 'fadeIn', { duration });
    },
    
    fadeOut(element, duration = 300) {
        return this.animate(element, 'fadeOut', { duration });
    },
    
    slideIn(element, direction = 'left', duration = 300) {
        const keyframeMap = {
            left: 'slideInLeft',
            right: 'slideInRight',
            up: 'slideInUp',
            down: 'slideInDown'
        };
        return this.animate(element, keyframeMap[direction], { duration });
    },
    
    bounce(element) {
        return this.animate(element, 'bounce', { duration: 500 });
    },
    
    pulse(element) {
        return this.animate(element, 'pulse', { duration: 1000, iterations: 'infinite' });
    },
    
    shake(element) {
        return this.animate(element, 'shake', { duration: 400 });
    },
    
    spin(element) {
        return this.animate(element, 'spin', { duration: 1000 });
    },
    
    glow(element) {
        return this.animate(element, 'glow', { duration: 1500, iterations: 'infinite' });
    },
    
    // Stagger animation for multiple elements
    stagger(elements, keyframeName, options = {}) {
        const { staggerDelay = 100, ...animOptions } = options;
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animate(element, keyframeName, animOptions);
            }, index * staggerDelay);
        });
    },
    
    // Sequence animation
    sequence(animations) {
        const playSequence = async (index) => {
            if (index >= animations.length) return;
            
            const { element, keyframe, options } = animations[index];
            const animation = this.animate(element, keyframe, options);
            
            if (animation) {
                await animation.finished;
                playSequence(index + 1);
            } else {
                playSequence(index + 1);
            }
        };
        
        playSequence(0);
    }
};

// Export
window.Animations = Animations;