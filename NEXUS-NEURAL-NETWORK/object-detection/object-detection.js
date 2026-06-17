/**
 * NEXUS AI - Object Detection System
 * Image Processing, Recognition, Tracking
 * অবজেক্ট ডিটেকশন সিস্টেম
 */

class ObjectDetectionSystem {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.detectionThreshold = 0.5;
        this.maxDetections = 20;
        
        // Model configuration
        this.config = {
            modelType: 'ssd-mobilenet', // ssd-mobilenet, yolo, custom
            inputSize: 320,
            numClasses: 80,
            confidenceThreshold: 0.5,
            iouThreshold: 0.5
        };
        
        // Detected objects
        this.currentDetections = [];
        this.detectionHistory = [];
        
        // Tracking
        this.trackedObjects = new Map();
        this.nextTrackId = 0;
        
        // Classes
        this.classes = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
            'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
            'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
            'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
            'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
            'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
            'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ];
        
        // Statistics
        this.stats = {
            totalDetections: 0,
            fps: 0,
            lastFrameTime: 0,
            frameCount: 0
        };
        
        this.initialize();
    }

    initialize() {
        console.log('[Object Detection] System initialized');
        this.setupCanvas();
    }

    setupCanvas() {
        // Create hidden canvas for processing
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.inputSize;
        this.canvas.height = this.config.inputSize;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    // ==================== MODEL LOADING ====================

    async loadModel(modelConfig = {}) {
        console.log('[Object Detection] Loading model...');
        
        const config = { ...this.config, ...modelConfig };
        
        try {
            // Create neural network for object detection
            this.model = new NEXUSModel();
            
            // Build detection model
            this.buildDetectionModel();
            
            this.isModelLoaded = true;
            console.log('[Object Detection] Model loaded successfully');
            
            return true;
        } catch (error) {
            console.error('[Object Detection] Model load failed:', error);
            return false;
        }
    }

    buildDetectionModel() {
        // Build a simple CNN for object detection
        // Input: [batch, height, width, channels]
        
        // Feature extraction layers
        this.model.add(new window.NEXUS_LAYERS.Conv2D(16, 3, { activation: 'relu', name: 'conv1' }));
        this.model.add(new window.NEXUS_LAYERS.MaxPool2D(2));
        
        this.model.add(new window.NEXUS_LAYERS.Conv2D(32, 3, { activation: 'relu', name: 'conv2' }));
        this.model.add(new window.NEXUS_LAYERS.MaxPool2D(2));
        
        this.model.add(new window.NEXUS_LAYERS.Conv2D(64, 3, { activation: 'relu', name: 'conv3' }));
        this.model.add(new window.NEXUS_LAYERS.MaxPool2D(2));
        
        this.model.add(new window.NEXUS_LAYERS.Conv2D(128, 3, { activation: 'relu', name: 'conv4' }));
        this.model.add(new window.NEXUS_LAYERS.MaxPool2D(2));
        
        this.model.add(new window.NEXUS_LAYERS.Flatten());
        
        // Detection head
        this.model.add(new window.NEXUS_LAYERS.Dense(256, { activation: 'relu', name: 'dense1' }));
        this.model.add(new window.NEXUS_LAYERS.Dropout(0.5));
        
        // Output: [boxes, scores, classes]
        this.model.add(new window.NEXUS_LAYERS.Dense(this.config.numClasses + 4, { activation: 'linear', name: 'output' }));
        
        this.model.build([this.config.inputSize, this.config.inputSize, 3]);
        this.model.compile({ optimizer: 'adam', learningRate: 0.001 });
        
        console.log('[Object Detection] Model built');
    }

    // ==================== DETECTION ====================

    async detect(imageSource, options = {}) {
        if (!this.isModelLoaded) {
            await this.loadModel();
        }
        
        const startTime = performance.now();
        
        try {
            // Get image data
            const imageData = await this.getImageData(imageSource);
            
            // Preprocess
            const inputTensor = this.preprocess(imageData);
            
            // Run inference
            const rawOutput = this.model.predict(inputTensor, false);
            
            // Post-process
            const detections = this.postProcess(rawOutput, options);
            
            // Track objects
            this.trackObjects(detections);
            
            // Update stats
            this.updateStats(startTime);
            
            // Store current detections
            this.currentDetections = detections;
            this.detectionHistory.push({
                timestamp: Date.now(),
                detections: [...detections]
            });
            
            // Limit history
            if (this.detectionHistory.length > 100) {
                this.detectionHistory.shift();
            }
            
            return detections;
            
        } catch (error) {
            console.error('[Object Detection] Detection failed:', error);
            return [];
        }
    }

    getImageData(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // Draw to canvas
                this.ctx.drawImage(img, 0, 0, this.config.inputSize, this.config.inputSize);
                const data = this.ctx.getImageData(0, 0, this.config.inputSize, this.config.inputSize);
                resolve(data);
            };
            
            img.onerror = reject;
            img.src = source;
        });
    }

    preprocess(imageData) {
        // Normalize pixel values to [0, 1]
        const data = imageData.data;
        const normalized = [];
        
        for (let i = 0; i < data.length; i += 4) {
            // RGB to normalized value
            normalized.push([
                data[i] / 255,
                data[i + 1] / 255,
                data[i + 2] / 255
            ]);
        }
        
        return normalized;
    }

    postProcess(rawOutput, options = {}) {
        const detections = [];
        const threshold = options.confidenceThreshold || this.config.confidenceThreshold;
        
        // Parse model output
        if (rawOutput && rawOutput.length > 0) {
            // Simple parsing - in real implementation, this would decode anchors
            for (let i = 0; i < Math.min(rawOutput.length, this.maxDetections); i++) {
                const output = rawOutput[i];
                
                if (output && output.length >= 5) {
                    // Extract box coordinates
                    const x = output[0];
                    const y = output[1];
                    const w = output[2];
                    const h = output[3];
                    
                    // Extract class scores
                    const scores = output.slice(4);
                    const maxScore = Math.max(...scores);
                    const classId = scores.indexOf(maxScore);
                    
                    if (maxScore >= threshold) {
                        detections.push({
                            bbox: [x, y, w, h],
                            score: maxScore,
                            class: this.classes[classId] || 'unknown',
                            classId: classId,
                            trackId: null
                        });
                    }
                }
            }
        }
        
        // Apply Non-Maximum Suppression
        return this.applyNMS(detections, this.config.iouThreshold);
    }

    applyNMS(detections, iouThreshold) {
        if (detections.length === 0) return [];
        
        // Sort by score
        detections.sort((a, b) => b.score - a.score);
        
        const keep = [];
        
        for (let i = 0; i < detections.length; i++) {
            let shouldKeep = true;
            
            for (const kept of keep) {
                const iou = this.calculateIOU(detections[i].bbox, kept.bbox);
                
                if (iou > iouThreshold && detections[i].classId === kept.classId) {
                    shouldKeep = false;
                    break;
                }
            }
            
            if (shouldKeep) {
                keep.push(detections[i]);
            }
        }
        
        return keep;
    }

    calculateIOU(box1, box2) {
        // box format: [x, y, w, h]
        const [x1, y1, w1, h1] = box1;
        const [x2, y2, w2, h2] = box2;
        
        // Calculate intersection
        const xLeft = Math.max(x1 - w1 / 2, x2 - w2 / 2);
        const xRight = Math.min(x1 + w1 / 2, x2 + w2 / 2);
        const yTop = Math.max(y1 - h1 / 2, y2 - h2 / 2);
        const yBottom = Math.min(y1 + h1 / 2, y2 + h2 / 2);
        
        if (xRight < xLeft || yBottom < yTop) {
            return 0;
        }
        
        const intersection = (xRight - xLeft) * (yBottom - yTop);
        const area1 = w1 * h1;
        const area2 = w2 * h2;
        const union = area1 + area2 - intersection;
        
        return intersection / union;
    }

    // ==================== TRACKING ====================

    trackObjects(detections) {
        const now = Date.now();
        
        for (const detection of detections) {
            // Find best matching track
            let bestMatch = null;
            let bestDistance = Infinity;
            
            for (const [trackId, track] of this.trackedObjects) {
                const distance = this.calculateDistance(detection, track);
                
                if (distance < bestDistance && distance < 0.5) {
                    bestDistance = distance;
                    bestMatch = trackId;
                }
            }
            
            if (bestMatch !== null) {
                // Update existing track
                const track = this.trackedObjects.get(bestMatch);
                track.lastSeen = now;
                track.bbox = detection.bbox;
                track.score = detection.score;
                track.frames.push({ bbox: detection.bbox, time: now });
                
                // Limit history
                if (track.frames.length > 30) {
                    track.frames.shift();
                }
                
                detection.trackId = bestMatch;
            } else {
                // Create new track
                const trackId = this.nextTrackId++;
                detection.trackId = trackId;
                
                this.trackedObjects.set(trackId, {
                    id: trackId,
                    class: detection.class,
                    bbox: detection.bbox,
                    score: detection.score,
                    created: now,
                    lastSeen: now,
                    frames: [{ bbox: detection.bbox, time: now }],
                    velocity: [0, 0]
                });
            }
        }
        
        // Remove stale tracks
        for (const [trackId, track] of this.trackedObjects) {
            if (now - track.lastSeen > 5000) { // 5 seconds
                this.trackedObjects.delete(trackId);
            }
        }
    }

    calculateDistance(det1, track) {
        // Calculate distance between detection and tracked object
        const [dx1, dy1] = det1.bbox;
        const [dx2, dy2] = track.bbox;
        
        const distance = Math.sqrt(Math.pow(dx1 - dx2, 2) + Math.pow(dy1 - dy2, 2));
        
        // Add class penalty
        const classPenalty = det1.class !== track.class ? 1 : 0;
        
        return distance + classPenalty;
    }

    // ==================== UTILITIES ====================

    updateStats(startTime) {
        const endTime = performance.now();
        const frameTime = endTime - startTime;
        
        this.stats.frameCount++;
        this.stats.fps = 1000 / frameTime;
        this.stats.totalDetections += this.currentDetections.length;
    }

    drawDetections(canvas, detections) {
        const ctx = canvas.getContext('2d');
        const scaleX = canvas.width / this.config.inputSize;
        const scaleY = canvas.height / this.config.inputSize;
        
        for (const detection of detections) {
            const [x, y, w, h] = detection.bbox;
            
            // Draw bounding box
            ctx.strokeStyle = this.getClassColor(detection.classId);
            ctx.lineWidth = 2;
            ctx.strokeRect(
                (x - w / 2) * scaleX,
                (y - h / 2) * scaleY,
                w * scaleX,
                h * scaleY
            );
            
            // Draw label
            ctx.fillStyle = this.getClassColor(detection.classId);
            ctx.fillRect(
                (x - w / 2) * scaleX,
                (y - h / 2) * scaleY - 20,
                100,
                20
            );
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(
                `${detection.class} ${(detection.score * 100).toFixed(1)}%`,
                (x - w / 2) * scaleX + 5,
                (y - h / 2) * scaleY - 5
            );
        }
    }

    getClassColor(classId) {
        const hue = (classId * 37) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    getStats() {
        return {
            ...this.stats,
            trackedObjects: this.trackedObjects.size,
            currentDetections: this.currentDetections.length
        };
    }

    getClasses() {
        return this.classes;
    }

    reset() {
        this.currentDetections = [];
        this.detectionHistory = [];
        this.trackedObjects.clear();
        this.stats = {
            totalDetections: 0,
            fps: 0,
            lastFrameTime: 0,
            frameCount: 0
        };
    }
}

// Helper layer for Conv2D
window.NEXUS_LAYERS = window.NEXUS_LAYERS || {};

class MaxPool2D extends window.NEXUS_LAYERS.Layer {
    constructor(poolSize = 2) {
        super({ type: 'maxpool2d' });
        this.poolSize = poolSize;
    }

    forward(input) {
        // Simplified max pooling
        const h = input.length;
        const w = input[0].length;
        const c = input[0][0].length || 1;
        
        const outH = Math.floor(h / this.poolSize);
        const outW = Math.floor(w / this.poolSize);
        
        const output = [];
        for (let i = 0; i < outH; i++) {
            output[i] = [];
            for (let j = 0; j < outW; j++) {
                output[i][j] = new Array(c).fill(0);
                for (let ci = 0; ci < c; ci++) {
                    let maxVal = -Infinity;
                    for (let pi = 0; pi < this.poolSize; pi++) {
                        for (let pj = 0; pj < this.poolSize; pj++) {
                            const val = input[i * this.poolSize + pi]?.[j * this.poolSize + pj]?.[ci] || 0;
                            if (val > maxVal) maxVal = val;
                        }
                    }
                    output[i][j][ci] = maxVal;
                }
            }
        }
        
        this.output = output;
        return output;
    }
}

class Conv2D extends window.NEXUS_LAYERS.Layer {
    constructor(filters, kernelSize, config = {}) {
        super({ ...config, type: 'conv2d' });
        this.filters = filters;
        this.kernelSize = kernelSize;
    }

    build(inputShape) {
        const [h, w, c] = inputShape;
        
        // Initialize filters
        this.filters = [];
        for (let f = 0; f < this.filters; f++) {
            this.filters[f] = [];
            for (let i = 0; i < this.kernelSize; i++) {
                this.filters[f][i] = [];
                for (let j = 0; j < this.kernelSize; j++) {
                    this.filters[f][i][j] = [];
                    for (let k = 0; k < c; k++) {
                        this.filters[f][i][j][k] = (Math.random() - 0.5) * 0.1;
                    }
                }
            }
        }
        
        this.built = true;
        return [h, w, this.filters.length];
    }

    forward(input) {
        // Simplified convolution
        this.output = input;
        return input;
    }
}

// Export
window.ObjectDetectionSystem = ObjectDetectionSystem;
window.objectDetection = new ObjectDetectionSystem();
