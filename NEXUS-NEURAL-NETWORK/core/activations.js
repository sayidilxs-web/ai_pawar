/**
 * NEXUS NEURAL NETWORK - Activation Functions & Loss Functions
 * সক্রিয়করণ এবং ক্ষতি ফাংশন
 */

// ==================== ACTIVATION FUNCTIONS ====================

const ActivationFunctions = {
    // ReLU - Rectified Linear Unit
    relu: (x) => Math.max(0, x),
    
    relu_grad: (y) => y > 0 ? 1 : 0,
    
    // Leaky ReLU
    leaky_relu: (x, alpha = 0.01) => x > 0 ? x : alpha * x,
    
    leaky_relu_grad: (y, alpha = 0.01) => y > 0 ? 1 : alpha,
    
    // ELU - Exponential Linear Unit
    elu: (x, alpha = 1.0) => x >= 0 ? x : alpha * (Math.exp(x) - 1),
    
    elu_grad: (y, alpha = 1.0) => y >= 0 ? 1 : y + alpha,
    
    // SELU - Scaled Exponential Linear Unit
    selu: (x) => {
        const alpha = 1.6732632423543772848170429916717;
        const scale = 1.0507009873554804934193349852946;
        return scale * (x >= 0 ? x : alpha * (Math.exp(x) - 1));
    },
    
    selu_grad: (y, scale = 1.0507) => {
        const alpha = 1.6732632423543772848170429916717;
        return y >= 0 ? scale : y + alpha * scale;
    },
    
    // Sigmoid
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    
    sigmoid_grad: (y) => y * (1 - y),
    
    // Tanh - Hyperbolic Tangent
    tanh: (x) => Math.tanh(x),
    
    tanh_grad: (y) => 1 - y * y,
    
    // Softmax - Multi-class classification
    softmax: (x) => {
        const maxX = Math.max(...x);
        const exps = x.map(v => Math.exp(v - maxX));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sumExps);
    },
    
    softmax_grad: (y, gradOutput) => {
        // Jacobian times vector for softmax
        const output = [];
        for (let i = 0; i < y.length; i++) {
            let sum = 0;
            for (let j = 0; j < y.length; j++) {
                const delta = i === j ? 1 : 0;
                sum += y[i] * (delta - y[j]) * (gradOutput[j] || 0);
            }
            output.push(sum);
        }
        return output;
    },
    
    // Swish - Self-gated activation
    swish: (x) => x / (1 + Math.exp(-x)),
    
    swish_grad: (y) => {
        const sigmoid = 1 / (1 + Math.exp(-y));
        return y + sigmoid * (1 - y);
    },
    
    // Mish - Self-regularized non-monotonic activation
    mish: (x) => {
        const softplus = Math.log(1 + Math.exp(x));
        return x * Math.tanh(softplus);
    },
    
    mish_grad: (x) => {
        const sigmoid = 1 / (1 + Math.exp(-x));
        const softplus = Math.log(1 + Math.exp(x));
        const tanhSoftplus = Math.tanh(softplus);
        const omega = sigmoid * (x * (sigmoid - 1) + 1);
        return x * (1 - tanhSoftplus * tanhSoftplus) * omega + tanhSoftplus;
    },
    
    // GELU - Gaussian Error Linear Unit
    gelu: (x) => {
        const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
        return x * cdf;
    },
    
    gelu_grad: (x) => {
        const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
        const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
        return cdf + x * pdf;
    },
    
    // Softplus
    softplus: (x) => Math.log(1 + Math.exp(x)),
    
    softplus_grad: (x) => 1 / (1 + Math.exp(-x)),
    
    // Linear (no activation)
    linear: (x) => x,
    
    linear_grad: () => 1
};

// Vectorized activation functions
const VectorizedActivations = {
    relu: (x) => x.map(v => ActivationFunctions.relu(v)),
    leaky_relu: (x) => x.map(v => ActivationFunctions.leaky_relu(v)),
    sigmoid: (x) => x.map(v => ActivationFunctions.sigmoid(v)),
    tanh: (x) => x.map(v => ActivationFunctions.tanh(v)),
    softmax: (x) => ActivationFunctions.softmax(x),
    swish: (x) => x.map(v => ActivationFunctions.swish(v)),
    mish: (x) => x.map(v => ActivationFunctions.mish(v)),
    gelu: (x) => x.map(v => ActivationFunctions.gelu(v)),
    linear: (x) => x
};

// ==================== LOSS FUNCTIONS ====================

const LossFunctions = {
    // Mean Squared Error
    mse: (yTrue, yPred) => {
        const n = yTrue.length;
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += Math.pow(yTrue[i] - yPred[i], 2);
        }
        return sum / n;
    },
    
    mse_grad: (yTrue, yPred) => {
        const n = yTrue.length;
        return yTrue.map((t, i) => -2 * (t - yPred[i]) / n);
    },
    
    // Mean Absolute Error
    mae: (yTrue, yPred) => {
        const n = yTrue.length;
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += Math.abs(yTrue[i] - yPred[i]);
        }
        return sum / n;
    },
    
    mae_grad: (yTrue, yPred) => {
        return yTrue.map((t, i) => t > yPred[i] ? 1 : -1);
    },
    
    // Binary Cross-Entropy
    binary_crossentropy: (yTrue, yPred) => {
        const epsilon = 1e-15;
        const yPredClipped = yPred.map(p => Math.min(Math.max(p, epsilon), 1 - epsilon));
        let sum = 0;
        for (let i = 0; i < yTrue.length; i++) {
            sum += yTrue[i] * Math.log(yPredClipped[i]) + 
                   (1 - yTrue[i]) * Math.log(1 - yPredClipped[i]);
        }
        return -sum / yTrue.length;
    },
    
    binary_crossentropy_grad: (yTrue, yPred) => {
        const epsilon = 1e-15;
        const yPredClipped = yPred.map(p => Math.min(Math.max(p, epsilon), 1 - epsilon));
        return yTrue.map((t, i) => -(t / yPredClipped[i]) + (1 - t) / (1 - yPredClipped[i]));
    },
    
    // Categorical Cross-Entropy
    categorical_crossentropy: (yTrue, yPred) => {
        const epsilon = 1e-15;
        const yPredClipped = yPred.map(p => Math.min(Math.max(p, epsilon), 1 - epsilon));
        let sum = 0;
        for (let i = 0; i < yTrue.length; i++) {
            sum += yTrue[i] * Math.log(yPredClipped[i]);
        }
        return -sum / yTrue.length;
    },
    
    categorical_crossentropy_grad: (yTrue, yPred) => {
        const epsilon = 1e-15;
        const yPredClipped = yPred.map(p => Math.min(Math.max(p, epsilon), 1 - epsilon));
        return yTrue.map((t, i) => -t / yPredClipped[i]);
    },
    
    // Sparse Categorical Cross-Entropy
    sparse_categorical_crossentropy: (yTrue, yPred) => {
        // yTrue is class index, yPred is probabilities
        const epsilon = 1e-15;
        const idx = Math.round(yTrue);
        const prob = Math.min(Math.max(yPred[idx], epsilon), 1 - epsilon);
        return -Math.log(prob);
    },
    
    sparse_categorical_crossentropy_grad: (yTrue, yPred) => {
        const grad = new Array(yPred.length).fill(0);
        const idx = Math.round(yTrue);
        grad[idx] = -1 / yPred[idx];
        return grad;
    },
    
    // Huber Loss (Smooth L1)
    huber: (yTrue, yPred, delta = 1.0) => {
        let sum = 0;
        for (let i = 0; i < yTrue.length; i++) {
            const error = Math.abs(yTrue[i] - yPred[i]);
            if (error <= delta) {
                sum += 0.5 * error * error;
            } else {
                sum += delta * error - 0.5 * delta * delta;
            }
        }
        return sum / yTrue.length;
    },
    
    huber_grad: (yTrue, yPred, delta = 1.0) => {
        return yTrue.map((t, i) => {
            const error = t - yPred[i];
            if (Math.abs(error) <= delta) {
                return -(error / yTrue.length);
            }
            return error > 0 ? -delta / yTrue.length : delta / yTrue.length;
        });
    },
    
    // Hinge Loss (SVM)
    hinge: (yTrue, yPred) => {
        let sum = 0;
        for (let i = 0; i < yTrue.length; i++) {
            sum += Math.max(0, 1 - yTrue[i] * yPred[i]);
        }
        return sum / yTrue.length;
    },
    
    hinge_grad: (yTrue, yPred) => {
        return yTrue.map((t, i) => {
            if (1 - t * yPred[i] > 0) {
                return -t / yTrue.length;
            }
            return 0;
        });
    },
    
    // KL Divergence
    kl_divergence: (yTrue, yPred) => {
        const epsilon = 1e-15;
        const yTrueClipped = yTrue.map(p => Math.min(Math.max(p, epsilon), 1));
        const yPredClipped = yPred.map(p => Math.min(Math.max(p, epsilon), 1));
        let sum = 0;
        for (let i = 0; i < yTrue.length; i++) {
            sum += yTrueClipped[i] * Math.log(yTrueClipped[i] / yPredClipped[i]);
        }
        return sum;
    },
    
    // Cosine Similarity
    cosine_proximity: (yTrue, yPred) => {
        const dot = yTrue.reduce((sum, t, i) => sum + t * yPred[i], 0);
        const normTrue = Math.sqrt(yTrue.reduce((sum, t) => sum + t * t, 0));
        const normPred = Math.sqrt(yPred.reduce((sum, p) => sum + p * p, 0));
        return -dot / (normTrue * normPred);
    }
};

// ==================== METRICS ====================

const Metrics = {
    accuracy: (yTrue, yPred) => {
        let correct = 0;
        for (let i = 0; i < yTrue.length; i++) {
            if (Math.round(yPred[i]) === Math.round(yTrue[i])) {
                correct++;
            }
        }
        return correct / yTrue.length;
    },
    
    precision: (yTrue, yPred) => {
        let truePositives = 0;
        let predictedPositives = 0;
        for (let i = 0; i < yTrue.length; i++) {
            if (Math.round(yPred[i]) === 1) predictedPositives++;
            if (Math.round(yTrue[i]) === 1 && Math.round(yPred[i]) === 1) truePositives++;
        }
        return predictedPositives > 0 ? truePositives / predictedPositives : 0;
    },
    
    recall: (yTrue, yPred) => {
        let truePositives = 0;
        let actualPositives = 0;
        for (let i = 0; i < yTrue.length; i++) {
            if (Math.round(yTrue[i]) === 1) actualPositives++;
            if (Math.round(yTrue[i]) === 1 && Math.round(yPred[i]) === 1) truePositives++;
        }
        return actualPositives > 0 ? truePositives / actualPositives : 0;
    },
    
    f1Score: (yTrue, yPred) => {
        const p = Metrics.precision(yTrue, yPred);
        const r = Metrics.recall(yTrue, yPred);
        return (p + r) > 0 ? 2 * (p * r) / (p + r) : 0;
    },
    
    categoricalAccuracy: (yTrue, yPred) => {
        // yTrue and yPred are one-hot encoded
        let correct = 0;
        for (let i = 0; i < yTrue.length; i++) {
            const trueClass = yTrue[i].indexOf(1);
            const predClass = yPred[i].indexOf(Math.max(...yPred[i]));
            if (trueClass === predClass) correct++;
        }
        return correct / yTrue.length;
    },
    
    topKCategoricalAccuracy: (yTrue, yPred, k = 5) => {
        let correct = 0;
        for (let i = 0; i < yTrue.length; i++) {
            const sortedPred = yPred[i]
                .map((p, idx) => ({ p, idx }))
                .sort((a, b) => b.p - a.p)
                .slice(0, k)
                .map(item => item.idx);
            const trueClass = yTrue[i].indexOf(1);
            if (sortedPred.includes(trueClass)) correct++;
        }
        return correct / yTrue.length;
    },
    
    meanAbsoluteError: (yTrue, yPred) => {
        return LossFunctions.mae(yTrue, yPred);
    },
    
    meanSquaredError: (yTrue, yPred) => {
        return LossFunctions.mse(yTrue, yPred);
    },
    
    rootMeanSquaredError: (yTrue, yPred) => {
        return Math.sqrt(LossFunctions.mse(yTrue, yPred));
    }
};

// Export
window.NEXUS_ACTIVATIONS = ActivationFunctions;
window.NEXUS_VECTORIZED = VectorizedActivations;
window.NEXUS_LOSS = LossFunctions;
window.NEXUS_METRICS = Metrics;
