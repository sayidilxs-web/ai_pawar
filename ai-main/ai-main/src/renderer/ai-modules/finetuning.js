/**
 * NEXUS Fine-Tuning Pipeline
 * Custom model training and fine-tuning system
 */

class FineTuningPipeline {
    constructor(model, config = {}) {
        this.model = model;
        this.batchSize = config.batchSize || 8;
        this.epochs = config.epochs || 3;
        this.learningRate = config.learningRate || 0.0001;
        this.validationSplit = config.validationSplit || 0.2;
        this.earlyStoppingPatience = config.earlyStoppingPatience || 3;
        this.gradualUnfreezing = config.gradualUnfreezing || false;
        this.layerwiseLR = config.layerwiseLR || false;
        this.warmupSteps = config.warmupSteps || 100;
        this.currentStep = 0;
        this.bestModelState = null;
        this.history = {
            trainLoss: [],
            valLoss: [],
            trainAcc: [],
            valAcc: [],
            epochs: [],
            learningRates: []
        };
    }

    prepareData(rawData, tokenizer) {
        const tokenized = rawData.map(item => ({
            input: Array.isArray(item.input) ? item.input : tokenizer.encode(item.input),
            target: Array.isArray(item.target) ? item.target : tokenizer.encode(item.target)
        }));
        
        const shuffled = this.shuffle(tokenized);
        const splitIndex = Math.floor(shuffled.length * (1 - this.validationSplit));
        
        return {
            train: shuffled.slice(0, splitIndex),
            validation: shuffled.slice(splitIndex)
        };
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    train(data) {
        this.currentStep = 0;
        let bestValLoss = Infinity;
        let patienceCounter = 0;
        
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            const trainLoss = this.trainEpoch(data.train, epoch);
            const valLoss = this.validate(data.validation);
            const valAcc = this.evaluateAccuracy(data.validation);
            
            this.history.trainLoss.push(trainLoss);
            this.history.valLoss.push(valLoss);
            this.history.valAcc.push(valAcc);
            this.history.epochs.push(epoch + 1);
            this.history.learningRates.push(this.getCurrentLR(epoch));
            
            console.log(`Epoch ${epoch + 1}/${this.epochs} | Train Loss: ${trainLoss.toFixed(4)} | Val Loss: ${valLoss.toFixed(4)} | Val Acc: ${(valAcc * 100).toFixed(2)}%`);
            
            if (valLoss < bestValLoss) {
                bestValLoss = valLoss;
                patienceCounter = 0;
                this.bestModelState = this.model.save();
                console.log(`  ✓ New best model saved!`);
            } else {
                patienceCounter++;
                if (patienceCounter >= this.earlyStoppingPatience) {
                    console.log(`Early stopping at epoch ${epoch + 1}`);
                    break;
                }
            }
        }
        
        if (this.bestModelState) {
            this.model.load(this.bestModelState);
        }
        
        return this.history;
    }

    trainEpoch(data, epoch) {
        let totalLoss = 0;
        let batches = 0;
        const lr = this.getCurrentLR(epoch);
        
        const shuffledData = this.shuffle(data);
        
        for (let i = 0; i < shuffledData.length; i += this.batchSize) {
            const batch = shuffledData.slice(i, i + this.batchSize);
            let batchLoss = 0;
            
            for (const sample of batch) {
                const sampleLoss = this.model.train(sample.input, sample.target, lr);
                batchLoss += sampleLoss;
                this.currentStep++;
            }
            
            totalLoss += batchLoss / batch.length;
            batches++;
            
            if (this.currentStep % 10 === 0) {
                console.log(`  Step ${this.currentStep} | Batch Loss: ${(batchLoss / batch.length).toFixed(4)}`);
            }
        }
        
        return totalLoss / batches;
    }

    getCurrentLR(epoch) {
        if (this.currentStep < this.warmupSteps) {
            return this.learningRate * (this.currentStep / this.warmupSteps);
        }
        
        const decayFactor = Math.pow(0.95, epoch);
        return this.learningRate * decayFactor;
    }

    validate(data) {
        let totalLoss = 0;
        
        for (const sample of data) {
            const output = this.model.encode(sample.input);
            const targetLogits = this.getTargetLogits(output, sample.target);
            const loss = this.crossEntropyLoss(output, targetLogits);
            totalLoss += loss;
        }
        
        return totalLoss / data.length;
    }

    getTargetLogits(output, target) {
        return target.map((t, i) => t % (output[i]?.length || 1));
    }

    crossEntropyLoss(logits, targets) {
        const lastLogits = logits[logits.length - 1];
        const probs = this.softmax(lastLogits);
        
        let loss = 0;
        for (let i = 0; i < targets.length; i++) {
            const idx = targets[i] % probs.length;
            loss -= Math.log(Math.max(probs[idx], 1e-8));
        }
        
        return loss / targets.length;
    }

    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(x => x / sum);
    }

    evaluateAccuracy(data) {
        let correct = 0;
        let total = 0;
        
        for (const sample of data) {
            const output = this.model.decode(sample.input, sample.target.length);
            
            for (let i = 0; i < sample.target.length && i < output.length; i++) {
                if (output[i] === sample.target[i]) correct++;
                total++;
            }
        }
        
        return total > 0 ? correct / total : 0;
    }

    evaluate(testData) {
        const loss = this.validate(testData);
        const accuracy = this.evaluateAccuracy(testData);
        const predictions = [];
        
        for (const sample of testData) {
            const output = this.model.decode(sample.input, sample.target.length);
            predictions.push({
                input: sample.input,
                target: sample.target,
                predicted: output,
                correct: output.slice(0, Math.min(output.length, sample.target.length))
                    .every((p, i) => p === sample.target[i])
            });
        }
        
        return {
            loss,
            accuracy,
            precision: accuracy,
            recall: accuracy,
            f1: accuracy * 2 / (accuracy + 0.001),
            predictions: predictions.slice(0, 10)
        };
    }

    predict(input, tokenizer) {
        const tokens = Array.isArray(input) ? input : tokenizer.encode(input);
        const output = this.model.decode(tokens);
        return { tokens: output };
    }

    save(path = 'finetuned_model') {
        const state = {
            model: this.model.save(),
            config: {
                batchSize: this.batchSize,
                epochs: this.epochs,
                learningRate: this.learningRate,
                validationSplit: this.validationSplit,
                earlyStoppingPatience: this.earlyStoppingPatience,
                gradualUnfreezing: this.gradualUnfreezing,
                layerwiseLR: this.layerwiseLR,
                warmupSteps: this.warmupSteps
            },
            bestModelState: this.bestModelState,
            history: this.history,
            currentStep: this.currentStep
        };
        
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(path, JSON.stringify(state));
        }
        
        return state;
    }

    load(path = 'finetuned_model') {
        let state;
        
        if (typeof localStorage !== 'undefined') {
            state = JSON.parse(localStorage.getItem(path));
        }
        
        if (!state) {
            console.warn('No saved model found at path:', path);
            return null;
        }
        
        this.model.load(state.model);
        this.bestModelState = state.bestModelState;
        this.history = state.history || this.history;
        this.currentStep = state.currentStep || 0;
        
        if (state.config) {
            Object.assign(this, state.config);
        }
        
        return state;
    }

    exportModel() {
        return this.model.save();
    }

    getHistory() {
        return this.history;
    }

    getBestModel() {
        return this.bestModelState;
    }
}

// Simple tokenizer for fine-tuning
class SimpleTokenizer {
    constructor(vocabSize = 50000) {
        this.vocabSize = vocabSize;
        this.padToken = 0;
        this.unkToken = 1;
        this.eosToken = 2;
        this.bosToken = 3;
    }

    encode(text, maxLength = 256) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
        const tokens = [this.bosToken];
        
        for (const word of words.slice(0, maxLength - 2)) {
            tokens.push(this.hashWord(word));
        }
        
        tokens.push(this.eosToken);
        
        while (tokens.length < maxLength) {
            tokens.push(this.padToken);
        }
        
        return tokens.slice(0, maxLength);
    }

    decode(tokens) {
        return tokens.filter(t => t > 3).join(' ');
    }

    hashWord(word) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % (this.vocabSize - 4) + 4;
    }
}

export { FineTuningPipeline, SimpleTokenizer };