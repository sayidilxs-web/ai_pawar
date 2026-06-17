/**
 * NEXUS AI - Screen Capture Module
 * স্ক্রিন দেখতে পারা
 */

class ScreenCapture {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isCapturing = false;
        this.sources = [];
        this.selectedSource = null;
        this.captureInterval = null;
        this.lastScreenshot = null;
        this.mouseX = 0;
        this.mouseY = 0;
    }
    
    async init() {
        this.canvas = document.getElementById('screenCanvas');
        
        if (!this.canvas) {
            console.error('[Screen Capture] Canvas not found');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Get available sources
        await this.getSources();
        
        console.log('[Screen Capture] Initialized');
        return true;
    }
    
    async getSources() {
        try {
            // Request screen capture permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    }
                }
            });
            
            // Get source ID from stream
            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            this.selectedSource = {
                id: settings.deviceId || 'screen',
                name: 'স্ক্রিন',
                type: 'screen'
            };
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
            console.log('[Screen Capture] Source selected:', this.selectedSource.name);
            return this.selectedSource;
            
        } catch (error) {
            console.error('[Screen Capture] Get sources error:', error);
            return null;
        }
    }
    
    async startCapture() {
        if (this.isCapturing) return;
        
        try {
            // Get screen capture via Electron
            if (window.nexusAI) {
                const screenshot = await window.nexusAI.takeScreenshot();
                
                if (screenshot) {
                    this.lastScreenshot = screenshot;
                    await this.renderScreenshot(screenshot);
                    this.isCapturing = true;
                    
                    // Start continuous capture
                    this.captureInterval = setInterval(() => {
                        this.updateCapture();
                    }, Config.screenCapture.captureInterval || 5000);
                    
                    console.log('[Screen Capture] Started');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('[Screen Capture] Start error:', error);
            return false;
        }
    }
    
    stopCapture() {
        this.isCapturing = false;
        
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        console.log('[Screen Capture] Stopped');
    }
    
    async updateCapture() {
        if (!this.isCapturing) return;
        
        try {
            if (window.nexusAI) {
                const screenshot = await window.nexusAI.takeScreenshot();
                
                if (screenshot) {
                    this.lastScreenshot = screenshot;
                    await this.renderScreenshot(screenshot);
                }
            }
        } catch (error) {
            console.error('[Screen Capture] Update error:', error);
        }
    }
    
    async renderScreenshot(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                // Set canvas size
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                
                // Draw image
                this.ctx.drawImage(img, 0, 0);
                
                // Draw cursor position if available
                if (this.mouseX && this.mouseY) {
                    this.drawCursor(this.mouseX, this.mouseY);
                }
                
                resolve();
            };
            
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
    
    drawCursor(x, y) {
        // Draw a cursor indicator
        this.ctx.beginPath();
        this.ctx.fillStyle = '#00ff88';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Draw cursor shape
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 15, y + 12);
        this.ctx.lineTo(x + 8, y + 12);
        this.ctx.lineTo(x + 8, y + 18);
        this.ctx.lineTo(x + 4, y + 15);
        this.ctx.closePath();
        
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    // Get screen size
    async getScreenSize() {
        if (window.nexusAI) {
            return await window.nexusAI.getScreenSize();
        }
        return { width: 1920, height: 1080 };
    }
    
    // Click at position
    async clickAt(x, y) {
        if (window.nexusAI) {
            // First move mouse
            await window.nexusAI.mouseMove(x, y);
            await this.delay(50);
            
            // Then click
            const success = await window.nexusAI.mouseClick('left');
            
            if (success && window.App) {
                window.App.showNotification(`ক্লিক করা হয়েছে: ${x}, ${y}`);
                window.App.addLogEntry('action', `স্ক্রিনে ক্লিক: (${x}, ${y})`);
            }
            
            // Update capture
            await this.updateCapture();
            
            return success;
        }
        return false;
    }
    
    // Double click at position
    async doubleClickAt(x, y) {
        if (window.nexusAI) {
            await window.nexusAI.mouseMove(x, y);
            await this.delay(50);
            
            const success = await window.nexusAI.mouseDoubleClick();
            
            if (success && window.App) {
                window.App.showNotification('ডাবল ক্লিক করা হয়েছে');
                window.App.addLogEntry('action', `স্ক্রিনে ডাবল ক্লিক: (${x}, ${y})`);
            }
            
            await this.updateCapture();
            return success;
        }
        return false;
    }
    
    // Right click at position
    async rightClickAt(x, y) {
        if (window.nexusAI) {
            await window.nexusAI.mouseMove(x, y);
            await this.delay(50);
            
            const success = await window.nexusAI.mouseClick('right');
            
            if (success && window.App) {
                window.App.showNotification('রাইট ক্লিক করা হয়েছে');
                window.App.addLogEntry('action', `স্ক্রিনে রাইট ক্লিক: (${x}, ${y})`);
            }
            
            await this.updateCapture();
            return success;
        }
        return false;
    }
    
    // Type text
    async typeText(text) {
        if (window.nexusAI) {
            const success = await window.nexusAI.keyType(text);
            
            if (success && window.App) {
                window.App.showNotification(`টাইপ করা হয়েছে: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
                window.App.addLogEntry('action', `টাইপ: "${text}"`);
            }
            
            return success;
        }
        return false;
    }
    
    // Get click position from canvas coordinates
    getClickPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: Math.round((event.clientX - rect.left) * scaleX),
            y: Math.round((event.clientY - rect.top) * scaleY)
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getLastScreenshot() {
        return this.lastScreenshot;
    }
}

// Initialize function for app.js
async function initScreenCapture() {
    const screenCap = new ScreenCapture();
    
    try {
        const success = await screenCap.init();
        
        if (success) {
            // Add click handler to canvas
            const canvas = document.getElementById('screenCanvas');
            
            if (canvas) {
                canvas.addEventListener('click', async (event) => {
                    const pos = screenCap.getClickPosition(event);
                    await screenCap.clickAt(pos.x, pos.y);
                });
                
                canvas.addEventListener('dblclick', async (event) => {
                    const pos = screenCap.getClickPosition(event);
                    await screenCap.doubleClickAt(pos.x, pos.y);
                });
                
                canvas.addEventListener('contextmenu', async (event) => {
                    event.preventDefault();
                    const pos = screenCap.getClickPosition(event);
                    await screenCap.rightClickAt(pos.x, pos.y);
                });
                
                // Track mouse position
                canvas.addEventListener('mousemove', (event) => {
                    const pos = screenCap.getClickPosition(event);
                    screenCap.mouseX = pos.x;
                    screenCap.mouseY = pos.y;
                });
            }
            
            window.screenCapture = screenCap;
            console.log('[Screen Capture] Ready');
            return true;
        }
    } catch (error) {
        console.error('[Screen Capture] Init failed:', error);
    }
    
    return false;
}