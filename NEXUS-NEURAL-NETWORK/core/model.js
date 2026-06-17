/**
 * NEXUS NEURAL NETWORK - Complete Model
 * Forward/Backward Propagation, Optimizers, Training Pipeline
 * সম্পূর্ণ নিউরাল নেটওয়ার্ক মডেল
 */

class NEXUSModel {
    constructor() {
        this.layers = [];
        this.optimizer = null;
        this.loss = null;
        this.metrics = ['accuracy'];
        this.history = {
            loss: [],
            val_loss: [],
            accuracy: [],
            val_accuracy: []
        };
        this.isTraining = false;
        this.weights = {};
        this.callbacks = [];
    }

    // Add layer to model
    add(layer) {
        this.layers.push(layer);
        return this;
    }

    // Build model with input shape
    build(inputShape) {
        console.log('[NEXUS Model] Building model with input shape:', inputShape);
        
        let currentShape = inputShape;
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.trainable && !layer.built) {
                currentShape = layer.build(currentShape);
            }
        }
        
        console.log('[NEXUS Model] Model built successfully');
        return this;
    }

    // Compile model with optimizer, loss, and metrics
    compile(config = {}) {
        this.optimizer = this.createOptimizer(config.optimizer || 'adam', config.learningRate || 0.001);
        this.loss = LossFunctions[config.loss] || LossFunctions.mse;
        this.metrics = config.metrics || ['accuracy'];
        
        console.log('[NEXUS Model] Compiled with optimizer:', config.optimizer || 'adam');
        return this;
    }

    // Create optimizer
    createOptimizer(type, learningRate) {
        const optimizers = {
            sgd: (params, grads, state) => {
                state = state || { velocity: params.map(p => p.map(w => 0)) };
                const momentum = 0.9;
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        state.velocity[i][j] = momentum * state.velocity[i][j] - learningRate * grads[i][j];
                        params[i][j] += state.velocity[i][j];
                    }
                }
                return state;
            },
            
            adam: (params, grads, state, iteration) => {
                state = state || { m: [], v: [], beta1: 0.9, beta2: 0.999, epsilon: 1e-8 };
                iteration = iteration || 1;
                
                if (state.m.length === 0) {
                    state.m = params.map(p => p.map(() => 0));
                    state.v = params.map(p => p.map(() => 0));
                }
                
                const beta1 = state.beta1;
                const beta2 = state.beta2;
                const epsilon = state.epsilon;
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        // Update biased first moment estimate
                        state.m[i][j] = beta1 * state.m[i][j] + (1 - beta1) * grads[i][j];
                        // Update biased second raw moment estimate
                        state.v[i][j] = beta2 * state.v[i][j] + (1 - beta2) * grads[i][j] * grads[i][j];
                        // Compute bias-corrected first moment estimate
                        const mHat = state.m[i][j] / (1 - Math.pow(beta1, iteration));
                        // Compute bias-corrected second raw moment estimate
                        const vHat = state.v[i][j] / (1 - Math.pow(beta2, iteration));
                        // Update parameters
                        params[i][j] -= learningRate * mHat / (Math.sqrt(vHat) + epsilon);
                    }
                }
                return state;
            },
            
            rmsprop: (params, grads, state) => {
                state = state || { cache: params.map(p => p.map(() => 0)), decay: 0.9, epsilon: 1e-8 };
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        state.cache[i][j] = state.decay * state.cache[i][j] + (1 - state.decay) * grads[i][j] * grads[i][j];
                        params[i][j] -= learningRate * grads[i][j] / (Math.sqrt(state.cache[i][j]) + state.epsilon);
                    }
                }
                return state;
            },
            
            adagrad: (params, grads, state) => {
                state = state || { sum: params.map(p => p.map(() => 0)), epsilon: 1e-8 };
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        state.sum[i][j] += grads[i][j] * grads[i][j];
                        params[i][j] -= learningRate * grads[i][j] / (Math.sqrt(state.sum[i][j]) + state.epsilon);
                    }
                }
                return state;
            },
            
            adamax: (params, grads, state, iteration) => {
                state = state || { m: [], v: [], beta1: 0.9, beta2: 0.999, epsilon: 1e-8 };
                iteration = iteration || 1;
                
                if (state.m.length === 0) {
                    state.m = params.map(p => p.map(() => 0));
                    state.v = params.map(p => p.map(() => 0));
                }
                
                const beta1 = state.beta1;
                const beta2 = state.beta2;
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        state.m[i][j] = beta1 * state.m[i][j] + (1 - beta1) * grads[i][j];
                        state.v[i][j] = Math.max(beta2 * state.v[i][j], Math.abs(grads[i][j]));
                        const mHat = state.m[i][j] / (1 - Math.pow(beta1, iteration));
                        params[i][j] -= (learningRate / (state.v[i][j] + state.epsilon)) * mHat;
                    }
                }
                return state;
            },
            
            nadam: (params, grads, state, iteration) => {
                state = state || { m: [], v: [], beta1: 0.9, beta2: 0.999, epsilon: 1e-8 };
                iteration = iteration || 1;
                
                if (state.m.length === 0) {
                    state.m = params.map(p => p.map(() => 0));
                    state.v = params.map(p => p.map(() => 0));
                }
                
                const beta1 = state.beta1;
                const beta2 = state.beta2;
                
                for (let i = 0; i < params.length; i++) {
                    for (let j = 0; j < params[i].length; j++) {
                        state.m[i][j] = beta1 * state.m[i][j] + (1 - beta1) * grads[i][j];
                        state.v[i][j] = beta2 * state.v[i][j] + (1 - beta2) * grads[i][j] * grads[i][j];
                        const mHat = (beta1 * state.m[i][j] / (1 - Math.pow(beta1, iteration))) + 
                                    ((1 - beta1) * grads[i][j] / (1 - Math.pow(beta1, iteration)));
                        const vHat = state.v[i][j] / (1 - Math.pow(beta2, iteration));
                        params[i][j] -= (learningRate * mHat) / (Math.sqrt(vHat) + state.epsilon);
                    }
                }
                return state;
            }
        };
        
        return {
            type,
            learningRate,
            state: {},
            update: (params, grads, iteration) => {
                return optimizers[type](params, grads, state, iteration);
            }
        };
    }

    // Forward pass
    predict(x, training = false) {
        let output = x;
        for (const layer of this.layers) {
            output = layer.forward(output, training);
        }
        return output;
    }

    // Backward pass (backpropagation)
    backward(yTrue) {
        // Calculate output gradient from loss
        let grad = LossFunctions[this.loss.name + '_grad'] ? 
            LossFunctions[this.loss.name + '_grad'](yTrue, this.layers[this.layers.length - 1].output) :
            LossFunctions.mse_grad(yTrue, this.layers[this.layers.length - 1].output);
        
        // Backpropagate through layers in reverse
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (layer.trainable) {
                grad = layer.backward(grad);
            } else {
                grad = layer.backward ? layer.backward(grad) : grad;
            }
        }
    }

    // Training step
    trainStep(xBatch, yBatch, iteration) {
        // Forward pass
        const yPred = this.predict(xBatch, true);
        
        // Calculate loss
        const loss = this.loss(yBatch, yPred);
        
        // Calculate metrics
        const metrics = {};
        for (const metric of this.metrics) {
            if (typeof metric === 'string') {
                metrics[metric] = Metrics[metric] ? Metrics[metric](yBatch, yPred) : 0;
            }
        }
        
        // Backward pass
        this.backward(yBatch);
        
        // Update weights
        this.updateWeights(iteration);
        
        return { loss, ...metrics };
    }

    // Update weights using optimizer
    updateWeights(iteration) {
        for (const layer of this.layers) {
            if (layer.trainable && layer.gradients && layer.weights) {
                const key = layer.name + '_weights';
                
                // Update weights
                this.optimizer.state[key] = this.optimizer.update(
                    layer.weights,
                    layer.gradients.weights,
                    this.optimizer.state[key],
                    iteration
                );
                
                // Update biases
                if (layer.gradients.biases && layer.biases) {
                    const biasKey = layer.name + '_biases';
                    this.optimizer.state[biasKey] = this.optimizer.update(
                        layer.biases,
                        layer.gradients.biases,
                        this.optimizer.state[biasKey],
                        iteration
                    );
                }
            }
        }
    }

    // Fit model
    async fit(xTrain, yTrain, config = {}) {
        const epochs = config.epochs || 10;
        const batchSize = config.batchSize || 32;
        const validationData = config.validationData || null;
        const shuffle = config.shuffle !== false;
        const verbose = config.verbose !== 0;
        
        const numSamples = xTrain.length;
        const numBatches = Math.ceil(numSamples / batchSize);
        
        console.log('[NEXUS Model] Training started: epochs=' + epochs + ', batchSize=' + batchSize);
        
        this.isTraining = true;
        
        for (let epoch = 0; epoch < epochs && this.isTraining; epoch++) {
            let epochLoss = 0;
            let epochMetrics = {};
            
            // Shuffle data
            let indices = [...Array(numSamples).keys()];
            if (shuffle) {
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
            }
            
            // Process batches
            for (let batch = 0; batch < numBatches; batch++) {
                const startIdx = batch * batchSize;
                const endIdx = Math.min(startIdx + batchSize, numSamples);
                const batchIndices = indices.slice(startIdx, endIdx);
                
                const xBatch = batchIndices.map(i => xTrain[i]);
                const yBatch = batchIndices.map(i => yTrain[i]);
                
                const iteration = epoch * numBatches + batch;
                const result = this.trainStep(xBatch, yBatch, iteration);
                
                epochLoss += result.loss;
                for (const key in result) {
                    if (key !== 'loss') {
                        epochMetrics[key] = (epochMetrics[key] || 0) + result[key];
                    }
                }
                
                if (verbose && batch % 10 === 0) {
                    console.log(`[Epoch ${epoch + 1}/${epochs}] Batch ${batch + 1}/${numBatches} - loss: ${result.loss.toFixed(4)}`);
                }
                
                // Allow other tasks to run
                if (batch % 50 === 0) {
                    await new Promise(r => setTimeout(r, 0));
                }
            }
            
            // Calculate epoch averages
            epochLoss /= numBatches;
            for (const key in epochMetrics) {
                epochMetrics[key] /= numBatches;
            }
            
            // Validation
            let valLoss = null;
            let valMetrics = {};
            if (validationData) {
                const [xVal, yVal] = validationData;
                valLoss = this.evaluate(xVal, yVal);
                valMetrics = { loss: valLoss };
            }
            
            // Store history
            this.history.loss.push(epochLoss);
            this.history.accuracy.push(epochMetrics.accuracy || 0);
            if (valLoss !== null) {
                this.history.val_loss.push(valLoss);
                this.history.val_accuracy.push(valMetrics.accuracy || 0);
            }
            
            if (verbose) {
                console.log(`[Epoch ${epoch + 1}/${epochs}] - loss: ${epochLoss.toFixed(4)} - accuracy: ${(epochMetrics.accuracy || 0).toFixed(4)}` +
                    (valLoss !== null ? ` - val_loss: ${valLoss.toFixed(4)} - val_accuracy: ${(valMetrics.accuracy || 0).toFixed(4)}` : ''));
            }
            
            // Callbacks
            for (const callback of this.callbacks) {
                if (callback.onEpochEnd) {
                    callback.onEpochEnd(epoch, { loss: epochLoss, ...epochMetrics });
                }
            }
        }
        
        this.isTraining = false;
        console.log('[NEXUS Model] Training completed');
        
        return this.history;
    }

    // Evaluate model
    evaluate(xTest, yTest, batchSize = 32) {
        let totalLoss = 0;
        let numBatches = 0;
        
        for (let i = 0; i < xTest.length; i += batchSize) {
            const xBatch = xTest.slice(i, i + batchSize);
            const yBatch = yTest.slice(i, i + batchSize);
            
            const yPred = this.predict(xBatch, false);
            totalLoss += this.loss(yBatch, yPred);
            numBatches++;
        }
        
        return totalLoss / numBatches;
    }

    // Save model
    save() {
        const modelData = {
            layers: this.layers.map(layer => ({
                type: layer.type,
                name: layer.name,
                config: {
                    units: layer.units,
                    filters: layer.filters,
                    kernelSize: layer.kernelSize,
                    activation: layer.activation,
                    rate: layer.rate
                },
                weights: layer.weights,
                biases: layer.biases
            })),
            optimizer: {
                type: this.optimizer.type,
                learningRate: this.optimizer.learningRate
            },
            history: this.history
        };
        
        return modelData;
    }

    // Load model
    load(modelData) {
        this.layers = [];
        
        for (const layerData of modelData.layers) {
            let layer;
            
            switch (layerData.type) {
                case 'dense':
                    layer = new DenseLayer(layerData.config.units, { 
                        activation: layerData.config.activation 
                    });
                    break;
                case 'dropout':
                    layer = new Dropout(layerData.config.rate);
                    break;
                case 'batchnorm':
                    layer = new BatchNormalization();
                    break;
                case 'flatten':
                    layer = new Flatten();
                    break;
                default:
                    layer = new Layer({ type: layerData.type });
            }
            
            layer.name = layerData.name;
            layer.weights = layerData.weights;
            layer.biases = layerData.biases;
            layer.built = true;
            
            this.layers.push(layer);
        }
        
        if (modelData.optimizer) {
            this.compile({
                optimizer: modelData.optimizer.type,
                learningRate: modelData.optimizer.learningRate
            });
        }
        
        this.history = modelData.history || { loss: [], accuracy: [] };
        
        console.log('[NEXUS Model] Model loaded successfully');
        return this;
    }

    // Summary
    summary() {
        console.log('\n========== NEXUS NEURAL NETWORK SUMMARY ==========\n');
        console.log('Layer'.padEnd(20) + 'Output Shape'.padEnd(20) + 'Parameters');
        console.log('-'.repeat(60));
        
        let totalParams = 0;
        let currentShape = '?';
        
        for (const layer of this.layers) {
            const params = layer.weights ? 
                layer.weights.length * layer.weights[0].length + (layer.biases ? layer.biases.length : 0) : 0;
            totalParams += params;
            
            console.log(
                layer.name.padEnd(20) + 
                (layer.built ? JSON.stringify(layer.computeOutputShape ? layer.computeOutputShape([0]) : '?') : 'Not built').padEnd(20) +
                params.toLocaleString()
            );
        }
        
        console.log('-'.repeat(60));
        console.log('Total Parameters: ' + totalParams.toLocaleString());
        console.log('\n==================================================\n');
    }
}

// Export
window.NEXUSModel = NEXUSModel;
