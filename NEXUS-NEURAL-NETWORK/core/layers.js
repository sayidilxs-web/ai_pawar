/**
 * NEXUS NEURAL NETWORK - Layer System
 * Dense, Convolutional, Recurrent, Attention Layers
 * স্তর সিস্টেম
 */

class Layer {
    constructor(config = {}) {
        this.name = config.name || 'layer';
        this.type = config.type || 'dense';
        this.activation = config.activation || 'relu';
        this.weights = null;
        this.biases = null;
        this.output = null;
        this.input = null;
        this.gradients = { weights: null, biases: null };
        this.trainable = config.trainable !== false;
        this.built = false;
    }

    build(inputShape) {
        this.built = true;
        return this.computeOutputShape(inputShape);
    }

    computeOutputShape(inputShape) {
        return inputShape;
    }

    forward(input) {
        this.input = input;
        return input;
    }

    backward(outputGradient) {
        return outputGradient;
    }

    getWeights() {
        return { weights: this.weights, biases: this.biases };
    }

    setWeights(weights) {
        if (weights.weights) this.weights = weights.weights;
        if (weights.biases) this.biases = weights.biases;
    }
}

class DenseLayer extends Layer {
    constructor(units, config = {}) {
        super({ ...config, type: 'dense' });
        this.units = units;
        this.kernelInitializer = config.kernelInitializer || 'glorot';
        this.biasInitializer = config.biasInitializer || 'zeros';
    }

    build(inputShape) {
        const inputDim = inputShape[inputShape.length - 1];
        
        // Initialize weights using Glorot (Xavier) initialization
        const limit = Math.sqrt(6 / (inputDim + this.units));
        this.weights = this.initializeWeights(inputDim, this.units, limit);
        this.biases = new Array(this.units).fill(0).map(() => 
            new Array(inputDim ? 1 : 1).fill(0).map(() => (Math.random() - 0.5) * 0.01)
        );
        
        this.built = true;
        return [this.units];
    }

    initializeWeights(rows, cols, limit) {
        const weights = [];
        for (let i = 0; i < rows; i++) {
            weights[i] = [];
            for (let j = 0; j < cols; j++) {
                weights[i][j] = (Math.random() * 2 - 1) * limit;
            }
        }
        return weights;
    }

    forward(input) {
        super.forward(input);
        
        // Matrix multiplication: output = input × weights + biases
        const inputArray = Array.isArray(input[0]) ? input : [input];
        this.output = [];
        
        for (let i = 0; i < this.units; i++) {
            let sum = 0;
            for (let j = 0; j < inputArray[0].length; j++) {
                sum += inputArray[0][j] * this.weights[j][i];
            }
            sum += this.biases[i][0] || 0;
            this.output.push(sum);
        }
        
        // Apply activation
        this.output = this.activate(this.output);
        return this.output;
    }

    activate(x) {
        const arr = Array.isArray(x) ? x : [x];
        return arr.map(val => ActivationFunctions[this.activation](val));
    }

    backward(outputGradient) {
        // Compute gradient of activation function
        const activationGrad = this.output.map((val, i) => 
            ActivationFunctions[this.activation + '_grad'](val) * (outputGradient[i] || 0)
        );
        
        // Compute weight gradients
        this.gradients.weights = [];
        for (let i = 0; i < this.weights.length; i++) {
            this.gradients.weights[i] = [];
            for (let j = 0; j < this.weights[i].length; j++) {
                this.gradients.weights[i][j] = this.input[0][j] * activationGrad[i];
            }
        }
        
        // Compute bias gradients
        this.gradients.biases = activationGrad.map(g => [g]);
        
        // Compute input gradient (for passing to previous layer)
        const inputGradient = [];
        for (let j = 0; j < this.weights.length; j++) {
            let sum = 0;
            for (let i = 0; i < this.units; i++) {
                sum += this.weights[j][i] * activationGrad[i];
            }
            inputGradient.push(sum);
        }
        
        return inputGradient;
    }
}

class ConvLayer extends Layer {
    constructor(filters, kernelSize, config = {}) {
        super({ ...config, type: 'conv2d' });
        this.filters = filters;
        this.kernelSize = kernelSize;
        this.stride = config.stride || 1;
        this.padding = config.padding || 'valid';
    }

    build(inputShape) {
        // inputShape: [height, width, channels]
        const [h, w, c] = inputShape;
        const pad = this.padding === 'same' ? Math.floor(this.kernelSize / 2) : 0;
        
        // Initialize filters [filterCount][kernelSize][kernelSize][channels]
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
        return this.computeOutputShape(inputShape);
    }

    computeOutputShape(inputShape) {
        const [h, w, c] = inputShape;
        const outH = this.padding === 'same' ? h : Math.floor((h - this.kernelSize + 1) / this.stride);
        const outW = this.padding === 'same' ? w : Math.floor((w - this.kernelSize + 1) / this.stride);
        return [outH, outW, this.filters.length];
    }

    forward(input) {
        super.forward(input);
        // Convolution operation
        // Simplified implementation
        const [h, w, c] = input.length > 1 && Array.isArray(input[0]) ? 
            [input.length, input[0].length, input[0][0].length || 1] : [input.length, 1, 1];
        
        const outH = Math.floor((h - this.kernelSize + 1) / this.stride);
        const outW = Math.floor((w - this.kernelSize + 1) / this.stride);
        
        this.output = [];
        // Convolution logic here
        return this.output;
    }
}

class AttentionLayer extends Layer {
    constructor(config = {}) {
        super({ ...config, type: 'attention' });
        this.heads = config.heads || 8;
        this.keyDim = config.keyDim || 64;
    }

    build(inputShape) {
        const seqLen = inputShape[0];
        const embedDim = inputShape[1];
        
        // Initialize projection matrices
        this.Wq = this.initMatrix(embedDim, this.keyDim * this.heads);
        this.Wk = this.initMatrix(embedDim, this.keyDim * this.heads);
        this.Wv = this.initMatrix(embedDim, this.keyDim * this.heads);
        this.Wo = this.initMatrix(this.keyDim * this.heads, embedDim);
        
        this.built = true;
        return inputShape;
    }

    initMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() - 0.5) * Math.sqrt(2 / (rows + cols));
            }
        }
        return matrix;
    }

    forward(input) {
        super.forward(input);
        
        // Compute Q, K, V
        const Q = this.matmul(input, this.Wq);
        const K = this.matmul(input, this.Wk);
        const V = this.matmul(input, this.Wv);
        
        // Scaled dot-product attention
        const scores = this.matmul(Q, this.transpose(K));
        const scale = Math.sqrt(this.keyDim);
        const attentionWeights = this.softmax(scores.map(row => row.map(x => x / scale)));
        
        // Output
        const attentionOutput = this.matmul(attentionWeights, V);
        this.output = this.matmul(attentionOutput, this.Wo);
        
        return this.output;
    }

    matmul(a, b) {
        // Matrix multiplication
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    softmax(arr) {
        const max = Math.max(...arr[0] || arr);
        const exp = (arr[0] || arr).map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return [exp.map(x => x / sum)];
    }
}

class LSTMLayer extends Layer {
    constructor(units, config = {}) {
        super({ ...config, type: 'lstm' });
        this.units = units;
        this.returnSequences = config.returnSequences || false;
    }

    build(inputShape) {
        const inputDim = inputShape[inputShape.length - 1];
        
        // Initialize LSTM gates weights
        this.Wf = this.initMatrix(inputDim + this.units, this.units);
        this.Wi = this.initMatrix(inputDim + this.units, this.units);
        this.Wc = this.initMatrix(inputDim + this.units, this.units);
        this.Wo = this.initMatrix(inputDim + this.units, this.units);
        
        this.built = true;
        return this.returnSequences ? [...inputShape.slice(0, -1), this.units] : [this.units];
    }

    initMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() - 0.5) * 0.1;
            }
        }
        return matrix;
    }

    forward(input) {
        super.forward(input);
        
        // Initialize hidden state and cell state
        this.h = new Array(this.units).fill(0);
        this.c = new Array(this.units).fill(0);
        
        // LSTM forward pass
        const combined = [...input, ...this.h];
        
        // Forget gate
        const f = this.sigmoid(this.matvec(this.Wf, combined));
        
        // Input gate
        const i = this.sigmoid(this.matvec(this.Wi, combined));
        
        // Cell candidate
        const c_tilde = this.tanh(this.matvec(this.Wc, combined));
        
        // Update cell state
        this.c = this.c.map((val, j) => f[j] * val + i[j] * c_tilde[j]);
        
        // Output gate
        const o = this.sigmoid(this.matvec(this.Wo, combined));
        
        // Hidden state
        this.h = o.map((val, j) => val * this.tanh(this.c[j]));
        
        return this.returnSequences ? this.h : this.h;
    }

    matvec(matrix, vector) {
        return matrix[0].map((_, colIdx) => 
            matrix.reduce((sum, row, rowIdx) => sum + row[colIdx] * vector[rowIdx], 0)
        );
    }

    sigmoid(x) {
        return x.map(v => 1 / (1 + Math.exp(-v)));
    }

    tanh(x) {
        return x.map(v => Math.tanh(v));
    }
}

class BatchNormalization extends Layer {
    constructor(config = {}) {
        super({ ...config, type: 'batchnorm' });
        this.momentum = config.momentum || 0.99;
        this.epsilon = config.epsilon || 1e-5;
        this.gamma = null;
        this.beta = null;
        this.runningMean = null;
        this.runningVar = null;
    }

    build(inputShape) {
        const units = inputShape[inputShape.length - 1];
        
        this.gamma = new Array(units).fill(1).map(() => [(Math.random() - 0.5) * 0.1]);
        this.beta = new Array(units).fill(0).map(() => [0]);
        this.runningMean = new Array(units).fill(0);
        this.runningVar = new Array(units).fill(1);
        
        this.built = true;
        return inputShape;
    }

    forward(input, training = true) {
        super.forward(input);
        
        const x = Array.isArray(input[0]) ? input : [input];
        
        if (training) {
            // Compute batch statistics
            const mean = x[0].map((_, i) => x[0][i] / x[0].length);
            const variance = x[0].map((_, i) => 
                x[0].reduce((sum, val) => sum + Math.pow(val - mean[i], 2), 0) / x[0].length
            );
            
            // Update running statistics
            this.runningMean = this.runningMean.map((m, i) => 
                this.momentum * m + (1 - this.momentum) * mean[i]
            );
            this.runningVar = this.runningVar.map((v, i) => 
                this.momentum * v + (1 - this.momentum) * variance[i]
            );
            
            // Normalize
            this.output = x[0].map((val, i) => 
                (val - mean[i]) / Math.sqrt(variance[i] + this.epsilon)
            );
        } else {
            // Use running statistics
            this.output = x[0].map((val, i) => 
                (val - this.runningMean[i]) / Math.sqrt(this.runningVar[i] + this.epsilon)
            );
        }
        
        // Scale and shift
        this.output = this.output.map((val, i) => 
            this.gamma[i][0] * val + this.beta[i][0]
        );
        
        return [this.output];
    }
}

class Dropout extends Layer {
    constructor(rate, config = {}) {
        super({ ...config, type: 'dropout' });
        this.rate = rate;
        this.mask = null;
    }

    forward(input, training = true) {
        super.forward(input);
        
        if (training) {
            // Create dropout mask
            this.mask = (Array.isArray(input[0]) ? input[0] : input).map(() => 
                Math.random() > this.rate
            );
            this.output = (Array.isArray(input[0]) ? input[0] : input).map((val, i) => 
                this.mask[i] ? val / (1 - this.rate) : 0
            );
        } else {
            this.output = input;
        }
        
        return this.output;
    }
}

class Flatten extends Layer {
    constructor(config = {}) {
        super({ ...config, type: 'flatten' });
        this.inputShape = null;
    }

    build(inputShape) {
        this.inputShape = inputShape;
        const flatSize = inputShape.reduce((a, b) => a * b, 1);
        return [flatSize];
    }

    forward(input) {
        super.forward(input);
        this.output = [input.flat(Infinity)];
        return this.output;
    }
}

class Reshape extends Layer {
    constructor(targetShape, config = {}) {
        super({ ...config, type: 'reshape' });
        this.targetShape = targetShape;
    }

    forward(input) {
        super.forward(input);
        const flat = input.flat(Infinity);
        this.output = this.reshape(flat, this.targetShape);
        return this.output;
    }

    reshape(arr, shape) {
        // Simple reshape implementation
        if (shape.length === 1) return arr;
        const [dim1, ...rest] = shape;
        const result = [];
        const chunkSize = arr.length / dim1;
        for (let i = 0; i < dim1; i++) {
            result.push(this.reshape(arr.slice(i * chunkSize, (i + 1) * chunkSize), rest));
        }
        return result;
    }
}

// Export all layers
window.NEXUS_LAYERS = {
    Layer,
    DenseLayer,
    ConvLayer,
    AttentionLayer,
    LSTMLayer,
    BatchNormalization,
    Dropout,
    Flatten,
    Reshape
};
