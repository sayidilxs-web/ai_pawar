/**
 * NEXUS Multi-Modal Processing Module
 * Process images, text, audio, and their combinations
 */

class MultiModalProcessor {
    constructor(config = {}) {
        this.imageEncoder = new ImageEncoder(config.image);
        this.textEncoder = new TextEncoder(config.text);
        this.audioEncoder = new AudioEncoder(config.audio);
        this.fusionLayer = new FusionLayer(config.fusion);
    }

    process(input) {
        if (input.type === 'image') {
            return { image: this.imageEncoder.encode(input.data) };
        }
        if (input.type === 'text') {
            return { text: this.textEncoder.encode(input.data) };
        }
        if (input.type === 'audio') {
            return { audio: this.audioEncoder.encode(input.data) };
        }
        if (input.type === 'mixed' || input.type === 'multimodal') {
            const features = {};
            
            if (input.image) features.image = this.imageEncoder.encode(input.image);
            if (input.text) features.text = this.textEncoder.encode(input.text);
            if (input.audio) features.audio = this.audioEncoder.encode(input.audio);
            
            features.fused = this.fusionLayer.fuse(features.image, features.text, features.audio);
            return features;
        }
        
        throw new Error(`Unknown input type: ${input.type}`);
    }

    processBatch(inputs) {
        return inputs.map(input => this.process(input));
    }

    save() {
        return {
            imageEncoder: this.imageEncoder.save(),
            textEncoder: this.textEncoder.save(),
            audioEncoder: this.audioEncoder.save(),
            fusionLayer: this.fusionLayer.save()
        };
    }

    load(state) {
        if (state.imageEncoder) this.imageEncoder.load(state.imageEncoder);
        if (state.textEncoder) this.textEncoder.load(state.textEncoder);
        if (state.audioEncoder) this.audioEncoder.load(state.audioEncoder);
        if (state.fusionLayer) this.fusionLayer.load(state.fusionLayer);
    }
}

class ImageEncoder {
    constructor(config = {}) {
        this.featureSize = config.featureSize || 512;
        this.numFilters = config.numFilters || 16;
        this.filters = this.initFilters();
    }

    initFilters() {
        const filters = [];
        const sizes = [3, 5, 7, 11, 15];
        
        for (const size of sizes) {
            for (let c = 0; c < 3; c++) {
                const filter = new Float32Array(size * size * 3);
                for (let i = 0; i < filter.length; i++) {
                    filter[i] = (Math.random() - 0.5) * 0.1;
                }
                filters.push({ size, channels: c, weights: filter });
            }
        }
        return filters;
    }

    encode(imageData) {
        const features = new Float32Array(this.featureSize);
        const data = imageData.data || imageData;
        
        let idx = 0;
        for (let i = 0; i < this.featureSize && i < data.length; i++) {
            features[i] = data[i % data.length] / 255.0 * 2 - 1;
        }
        
        // Apply simple convolution-like operations
        for (let f = 0; f < Math.min(this.numFilters, this.filters.length); f++) {
            const filter = this.filters[f];
            let sum = 0;
            const step = Math.floor(data.length / (filter.size * filter.size));
            
            for (let i = 0; i < filter.size * filter.size && i * step < data.length; i++) {
                sum += data[i * step] * filter.weights[i];
            }
            
            features[f % this.featureSize] += Math.tanh(sum);
        }
        
        // Normalize
        const norm = Math.sqrt(Array.from(features).reduce((s, f) => s + f * f, 0));
        if (norm > 0) {
            for (let i = 0; i < features.length; i++) {
                features[i] /= norm;
            }
        }
        
        return features;
    }

    extractFeatures(imageData) {
        return {
            histogram: this.extractHistogram(imageData),
            texture: this.extractTexture(imageData),
            color: this.extractColorFeatures(imageData)
        };
    }

    extractHistogram(imageData) {
        const bins = new Array(256).fill(0);
        const data = imageData.data || imageData;
        
        for (let i = 0; i < data.length; i++) {
            bins[Math.floor(data[i]) % 256]++;
        }
        
        return bins.map(b => b / data.length);
    }

    extractTexture(imageData) {
        const features = new Float32Array(8);
        const data = imageData.data || imageData;
        
        for (let i = 0; i < 8; i++) {
            const idx = Math.floor(i * data.length / 8);
            features[i] = data[idx] / 255;
        }
        
        return features;
    }

    extractColorFeatures(imageData) {
        const features = { r: 0, g: 0, b: 0, count: 0 };
        const data = imageData.data || imageData;
        
        for (let i = 0; i < data.length; i += 3) {
            features.r += data[i];
            features.g += data[i + 1] || 0;
            features.b += data[i + 2] || 0;
            features.count++;
        }
        
        if (features.count > 0) {
            features.r /= features.count;
            features.g /= features.count;
            features.b /= features.count;
        }
        
        return features;
    }

    save() {
        return { filters: this.filters, featureSize: this.featureSize };
    }

    load(state) {
        this.filters = state.filters;
        this.featureSize = state.featureSize;
    }
}

class TextEncoder {
    constructor(config = {}) {
        this.vocabSize = config.vocabSize || 50000;
        this.embeddingDim = config.embeddingDim || 512;
        this.maxLen = config.maxLen || 256;
        this.embeddings = new Float32Array(this.vocabSize * this.embeddingDim).fill(0).map(() => 
            (Math.random() - 0.5) * 0.02
        );
        this.positionalEncoding = this.initPositionalEncoding();
    }

    initPositionalEncoding() {
        const pe = new Float32Array(this.maxLen * this.embeddingDim);
        for (let pos = 0; pos < this.maxLen; pos++) {
            for (let i = 0; i < this.embeddingDim; i += 2) {
                pe[pos * this.embeddingDim + i] = Math.sin(pos / Math.pow(10000, i / this.embeddingDim));
                pe[pos * this.embeddingDim + i + 1] = Math.cos(pos / Math.pow(10000, (i + 1) / this.embeddingDim));
            }
        }
        return pe;
    }

    tokenize(text) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
        return words.map(w => {
            let hash = 5381;
            for (let i = 0; i < w.length; i++) {
                hash = ((hash << 5) + hash) + w.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash) % this.vocabSize;
        });
    }

    encode(text) {
        const tokens = this.tokenize(text);
        const features = new Float32Array(this.embeddingDim).fill(0);
        
        for (let t = 0; t < Math.min(tokens.length, this.maxLen); t++) {
            const token = tokens[t];
            for (let i = 0; i < this.embeddingDim; i++) {
                const embedIdx = token * this.embeddingDim + i;
                if (embedIdx < this.embeddings.length) {
                    features[i] += this.embeddings[embedIdx] + this.positionalEncoding[t * this.embeddingDim + i];
                }
            }
        }
        
        if (tokens.length > 0) {
            for (let i = 0; i < this.embeddingDim; i++) {
                features[i] /= Math.sqrt(tokens.length);
            }
        }
        
        // Normalize
        const norm = Math.sqrt(Array.from(features).reduce((s, f) => s + f * f, 0));
        if (norm > 0) {
            for (let i = 0; i < features.length; i++) {
                features[i] /= norm;
            }
        }
        
        return features;
    }

    decode(features) {
        return Array.from(features).map(f => (f + 1) / 2 * 255);
    }

    save() {
        return { 
            embeddings: Array.from(this.embeddings),
            positionalEncoding: Array.from(this.positionalEncoding)
        };
    }

    load(state) {
        this.embeddings = new Float32Array(state.embeddings);
        this.positionalEncoding = new Float32Array(state.positionalEncoding);
    }
}

class AudioEncoder {
    constructor(config = {}) {
        this.featureSize = config.featureSize || 512;
        this.sampleRate = config.sampleRate || 16000;
        this.mfccSize = config.mfccSize || 13;
    }

    encode(audioData) {
        const features = new Float32Array(this.featureSize);
        const data = audioData.data || audioData;
        
        // Simplified spectral features
        const frameSize = Math.floor(data.length / this.mfccSize);
        
        for (let i = 0; i < this.mfccSize; i++) {
            let energy = 0;
            let zeroCrossings = 0;
            const start = i * frameSize;
            
            for (let j = 0; j < frameSize && start + j < data.length; j++) {
                const sample = data[start + j];
                energy += sample * sample;
                if (j > 0 && data[start + j - 1] * sample < 0) {
                    zeroCrossings++;
                }
            }
            
            const mfccDim = Math.floor(this.featureSize / this.mfccSize);
            const normalizedEnergy = Math.log(Math.max(energy, 1)) / 10;
            
            for (let k = 0; k < mfccDim; k++) {
                const idx = i * mfccDim + k;
                if (idx < this.featureSize) {
                    features[idx] = Math.tanh(normalizedEnergy * (1 + Math.sin(k / mfccDim * Math.PI)));
                }
            }
        }
        
        // Normalize
        const norm = Math.sqrt(Array.from(features).reduce((s, f) => s + f * f, 0));
        if (norm > 0) {
            for (let i = 0; i < features.length; i++) {
                features[i] /= norm;
            }
        }
        
        return features;
    }

    extractMFCC(audioData) {
        const mfcc = [];
        const data = audioData.data || audioData;
        const frameSize = Math.floor(data.length / this.mfccSize);
        
        for (let i = 0; i < this.mfccSize; i++) {
            const start = i * frameSize;
            let energy = 0;
            
            for (let j = 0; j < frameSize && start + j < data.length; j++) {
                energy += data[start + j] ** 2;
            }
            
            mfcc.push(Math.log(Math.max(energy, 1)));
        }
        
        return mfcc;
    }

    extractMelSpectrogram(audioData, numBands = 40) {
        const spectrogram = [];
        const data = audioData.data || audioData;
        const frameSize = Math.floor(data.length / numBands);
        
        for (let i = 0; i < numBands; i++) {
            const start = i * frameSize;
            let energy = 0;
            
            for (let j = 0; j < frameSize && start + j < data.length; j++) {
                energy += data[start + j] ** 2;
            }
            
            spectrogram.push(Math.sqrt(energy / frameSize));
        }
        
        return spectrogram;
    }

    save() {
        return { featureSize: this.featureSize, mfccSize: this.mfccSize };
    }

    load(state) {
        this.featureSize = state.featureSize;
        this.mfccSize = state.mfccSize;
    }
}

class FusionLayer {
    constructor(config = {}) {
        this.outputSize = config.outputSize || 512;
        this.method = config.method || 'concat';
        this.attention = new AttentionFusion(config.attention);
    }

    fuse(image, text, audio) {
        const sources = [image, text, audio].filter(s => s !== null && s !== undefined);
        
        if (sources.length === 0) {
            return new Float32Array(this.outputSize);
        }
        
        if (this.method === 'concat') {
            return this.concat(sources);
        } else if (this.method === 'attention') {
            return this.attention.fuse(sources);
        } else if (this.method === 'average') {
            return this.average(sources);
        }
        
        return this.concat(sources);
    }

    concat(sources) {
        const result = new Float32Array(this.outputSize);
        const dimPerSource = Math.floor(this.outputSize / sources.length);
        
        for (let s = 0; s < sources.length; s++) {
            const source = sources[s];
            for (let i = 0; i < dimPerSource && i < source.length; i++) {
                result[s * dimPerSource + i] = source[i];
            }
        }
        
        return this.normalize(result);
    }

    average(sources) {
        const result = new Float32Array(this.outputSize);
        
        for (const source of sources) {
            for (let i = 0; i < this.outputSize && i < source.length; i++) {
                result[i] += source[i] / sources.length;
            }
        }
        
        return this.normalize(result);
    }

    normalize(features) {
        const norm = Math.sqrt(Array.from(features).reduce((s, f) => s + f * f, 0));
        if (norm > 0) {
            for (let i = 0; i < features.length; i++) {
                features[i] /= norm;
            }
        }
        return features;
    }

    save() {
        return { outputSize: this.outputSize, method: this.method, attention: this.attention.save() };
    }

    load(state) {
        this.outputSize = state.outputSize;
        this.method = state.method;
        if (state.attention) this.attention.load(state.attention);
    }
}

class AttentionFusion {
    constructor(config = {}) {
        this.hiddenSize = config.hiddenSize || 256;
        this.weights = this.initWeights();
    }

    initWeights() {
        return new Float32Array(this.hiddenSize * 3).fill(0).map(() => 
            (Math.random() - 0.5) * 0.1
        );
    }

    fuse(sources) {
        const dim = sources[0].length;
        const features = new Float32Array(dim);
        
        // Compute attention scores
        const scores = sources.map(s => {
            let score = 0;
            for (let i = 0; i < Math.min(dim, this.hiddenSize); i++) {
                score += s[i] * this.weights[i];
            }
            return Math.exp(Math.tanh(score));
        });
        
        const totalScore = scores.reduce((a, b) => a + b, 0);
        
        // Weighted sum
        for (let s = 0; s < sources.length; s++) {
            const weight = scores[s] / totalScore;
            for (let i = 0; i < dim; i++) {
                features[i] += sources[s][i] * weight;
            }
        }
        
        return features;
    }

    save() {
        return { weights: Array.from(this.weights), hiddenSize: this.hiddenSize };
    }

    load(state) {
        this.weights = new Float32Array(state.weights);
        this.hiddenSize = state.hiddenSize;
    }
}

export { MultiModalProcessor, ImageEncoder, TextEncoder, AudioEncoder, FusionLayer, AttentionFusion };