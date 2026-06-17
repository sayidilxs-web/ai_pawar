/**
 * NEXUS AI - Face Recognition Module
 * মুখ চিনতে পারা
 */

class FaceRecognition {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.isInitialized = false;
        this.isRunning = false;
        this.faceMatcher = null;
        this.labeledDescriptors = [];
        this.currentFace = null;
        this.stream = null;
        this.selectedCamera = null;
        
        // Models will be loaded from CDN
        this.modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic-face-api@1.1.4/model';
    }
    
    async init() {
        if (!Config.faceRecognition.enabled) {
            console.log('[Face Recognition] Disabled in config');
            return false;
        }
        
        this.video = document.getElementById('faceCamera');
        this.canvas = document.getElementById('faceCanvas');
        
        if (!this.video || !this.canvas) {
            console.error('[Face Recognition] Video/Canvas elements not found');
            return false;
        }
        
        this.canvasCtx = this.canvas.getContext('2d');
        
        try {
            // Load face-api models
            await this.loadModels();
            
            // Get camera access
            await this.startCamera();
            
            this.isInitialized = true;
            console.log('[Face Recognition] Initialized');
            
            return true;
        } catch (error) {
            console.error('[Face Recognition] Init error:', error);
            this.showStatus('চেহারা চিনতে পারছে না');
            return false;
        }
    }
    
    async loadModels() {
        const statusEl = document.getElementById('faceStatus');
        if (statusEl) statusEl.textContent = 'মডেল লোড হচ্ছে...';
        
        try {
            // Dynamically load face-api
            if (typeof faceapi === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/@vladmandic-face-api@1.1.4/dist/face-api.js');
            }
            
            // Load required models
            await faceapi.nets.tinyFaceDetector.loadFromUri(this.modelUrl);
            await faceapi.nets.faceLandmark68Net.loadFromUri(this.modelUrl);
            await faceapi.nets.faceRecognitionNet.loadFromUri(this.modelUrl);
            await faceapi.nets.ssdMobilenetv1.loadFromUri(this.modelUrl);
            
            console.log('[Face Recognition] Models loaded');
            if (statusEl) statusEl.textContent = 'প্রস্তুত';
            
        } catch (error) {
            console.error('[Face Recognition] Model load error:', error);
            if (statusEl) statusEl.textContent = 'মডেল লোড ব্যর্থ';
            throw error;
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    async startCamera(deviceId = null) {
        try {
            // Stop existing stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            const constraints = {
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    facingMode: 'user'
                }
            };
            
            if (deviceId) {
                constraints.video.deviceId = { exact: deviceId };
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });
            
            // Set canvas size
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            this.selectedCamera = deviceId;
            console.log('[Face Recognition] Camera started');
            
            return true;
        } catch (error) {
            console.error('[Face Recognition] Camera error:', error);
            this.showStatus('ক্যামেরা পাওয়া যায়নি');
            return false;
        }
    }
    
    async start() {
        if (!this.isInitialized || this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        await this.detect();
        console.log('[Face Recognition] Detection started');
    }
    
    async detect() {
        if (!this.isRunning || !this.isInitialized) {
            return;
        }
        
        try {
            // Detect faces with landmarks
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            // Clear canvas
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (detections.length > 0) {
                // Draw face box
                const box = detections[0].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: 'চেহারা শনাক্ত',
                    lineWidth: 2,
                    color: '#00ff88'
                });
                drawBox.draw(this.canvas);
                
                // Draw landmarks
                const landmarks = detections[0].landmarks;
                const jawOutline = landmarks.getJawOutline();
                const nose = landmarks.getNose();
                const mouth = landmarks.getMouth();
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const leftBrow = landmarks.getLeftEyebrow();
                const rightBrow = landmarks.getRightEyebrow();
                
                // Draw features
                this.drawLandmark(jawOutline, '#00f0ff');
                this.drawLandmark(nose, '#ff00ff');
                this.drawLandmark(mouth, '#00ff88');
                this.drawLandmark(leftEye, '#ffaa00');
                this.drawLandmark(rightEye, '#ffaa00');
                this.drawLandmark(leftBrow, '#00f0ff');
                this.drawLandmark(rightBrow, '#00f0ff');
                
                // Get face descriptor for recognition
                const descriptor = detections[0].descriptor;
                
                // Match with known faces
                if (this.faceMatcher) {
                    const match = this.faceMatcher.findBestMatch(descriptor);
                    this.currentFace = match.label;
                    
                    if (match.label !== 'unknown' && match.distance < 0.6) {
                        this.showStatus(`স্বাগত, ${match.label}!`);
                        
                        // Greet the user
                        if (window.App && !this.greeted) {
                            window.App.speak(`হ্যালো ${match.label}! আমি কিভাবে সাহায্য করতে পারি?`);
                            this.greeted = true;
                            
                            // Reset greeting after some time
                            setTimeout(() => {
                                this.greeted = false;
                            }, 60000); // 1 minute
                        }
                    }
                } else {
                    this.showStatus('চেহারা শনাক্ত!');
                }
            } else {
                this.showStatus('কোনো চেহারা দেখছি না');
                this.currentFace = null;
            }
            
        } catch (error) {
            console.error('[Face Recognition] Detection error:', error);
        }
        
        // Continue detection loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.detect());
        }
    }
    
    drawLandmark(points, color) {
        if (!points || points.length === 0) return;
        
        this.canvasCtx.beginPath();
        this.canvasCtx.fillStyle = color;
        this.canvasCtx.strokeStyle = color;
        
        points.forEach((point, i) => {
            if (i === 0) {
                this.canvasCtx.moveTo(point.x, point.y);
            } else {
                this.canvasCtx.lineTo(point.x, point.y);
            }
        });
        
        this.canvasCtx.stroke();
        
        // Draw points
        points.forEach(point => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        });
    }
    
    stop() {
        this.isRunning = false;
        console.log('[Face Recognition] Stopped');
    }
    
    destroy() {
        this.stop();
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isInitialized = false;
        console.log('[Face Recognition] Destroyed');
    }
    
    showStatus(text) {
        const statusEl = document.getElementById('faceStatus');
        if (statusEl) {
            statusEl.textContent = text;
        }
    }
    
    // Add a new face to recognize
    async addFace(label) {
        if (!this.isInitialized) {
            console.error('[Face Recognition] Not initialized');
            return false;
        }
        
        try {
            const detection = await faceapi
                .detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceDescriptor();
            
            if (detection) {
                this.labeledDescriptors.push(
                    new faceapi.LabeledFaceDescriptors(label, [detection.descriptor])
                );
                
                this.faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors);
                
                console.log('[Face Recognition] Added face:', label);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('[Face Recognition] Add face error:', error);
            return false;
        }
    }
    
    // Save trained faces to localStorage
    saveFaces() {
        const data = this.labeledDescriptors.map(ld => ({
            label: ld.label,
            descriptors: ld.descriptors.map(d => Array.from(d))
        }));
        
        localStorage.setItem('nexusFaces', JSON.stringify(data));
        console.log('[Face Recognition] Faces saved');
    }
    
    // Load trained faces from localStorage
    async loadFaces() {
        const data = localStorage.getItem('nexusFaces');
        
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.labeledDescriptors = parsed.map(item =>
                    new faceapi.LabeledFaceDescriptors(
                        item.label,
                        item.descriptors.map(d => new Float32Array(d))
                    )
                );
                
                this.faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors);
                console.log('[Face Recognition] Faces loaded:', this.labeledDescriptors.length);
                return true;
            } catch (error) {
                console.error('[Face Recognition] Load faces error:', error);
            }
        }
        
        return false;
    }
    
    // Clear all saved faces
    clearFaces() {
        this.labeledDescriptors = [];
        this.faceMatcher = null;
        localStorage.removeItem('nexusFaces');
        console.log('[Face Recognition] Faces cleared');
    }
    
    // Switch camera
    async switchCamera(deviceId) {
        await this.startCamera(deviceId);
    }
}

// Initialize function for app.js to call
async function initFaceRecognition() {
    const faceRec = new FaceRecognition();
    
    try {
        const success = await faceRec.init();
        
        if (success) {
            await faceRec.loadFaces(); // Load saved faces
            await faceRec.start(); // Start detection
            
            // Export to window
            window.faceRecognition = faceRec;
            
            return true;
        }
    } catch (error) {
        console.error('[Face Recognition] Init failed:', error);
    }
    
    // Hide camera if not available
    const cameraContainer = document.getElementById('faceCameraContainer');
    if (cameraContainer) {
        cameraContainer.style.display = 'none';
    }
    
    return false;
}