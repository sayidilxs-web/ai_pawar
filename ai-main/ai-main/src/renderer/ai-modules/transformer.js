/**
 * NEXUS Transformer Module
 * Self-attention based Transformer architecture for sequence modeling
 */

class TransformerLayer {
    constructor(config = {}) {
        this.hiddenSize = config.hiddenSize || 512;
        this.num_heads = config.num_heads || 8;
        this.ffDim = config.ffDim || 2048;
        this.dropout = config.dropout || 0.1;
        this.attentionWeights = null;
        this.layerNorm1 = this.initLayerNorm();
        this.layerNorm2 = this.initLayerNorm();
    }

    initLayerNorm() {
        return {
            gamma: new Float32Array(this.hiddenSize).fill(1),
            beta: new Float32Array(this.hiddenSize).fill(0)
        };
    }

    initWeights() {
        return {
            Wq: this.xavierInit([this.hiddenSize, this.hiddenSize]),
            Wk: this.xavierInit([this.hiddenSize, this.hiddenSize]),
            Wv: this.xavierInit([this.hiddenSize, this.hiddenSize]),
            Wo: this.xavierInit([this.hiddenSize, this.hiddenSize]),
            W1: this.xavierInit([this.hiddenSize, this.ffDim]),
            W2: this.xavierInit([this.ffDim, this.hiddenSize])
        };
    }

    xavierInit(shape) {
        const size = shape.reduce((a, b) => a * b);
        const weights = new Float32Array(size);
        const fanIn = shape[0];
        const fanOut = shape[1];
        const limit = Math.sqrt(6 / (fanIn + fanOut));
        
        for (let i = 0; i < size; i++) {
            weights[i] = (Math.random() * 2 - 1) * limit;
        }
        return weights;
    }

    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(x => x / sum);
    }

    multiHeadAttention(x, weights) {
        const seqLen = x.length;
        const headSize = this.hiddenSize / this.num_heads;
        
        const Q = this.matMul(x, weights.Wq, seqLen, this.hiddenSize, this.hiddenSize);
        const K = this.matMul(x, weights.Wk, seqLen, this.hiddenSize, this.hiddenSize);
        const V = this.matMul(x, weights.Wv, seqLen, this.hiddenSize, this.hiddenSize);
        
        const scores = this.scaledDotProduct(Q, K);
        const attention = this.softmax(scores);
        
        this.attentionWeights = attention;
        
        const context = this.matMul(attention, V);
        return this.matMul(context, weights.Wo);
    }

    scaledDotProduct(Q, K) {
        const seqLen = Q.length;
        const d_k = K[0].length;
        const scores = [];
        
        for (let i = 0; i < seqLen; i++) {
            scores[i] = [];
            for (let j = 0; j < seqLen; j++) {
                let dot = 0;
                for (let k = 0; k < d_k; k++) {
                    dot += Q[i][k] * K[j][k];
                }
                scores[i][j] = dot / Math.sqrt(d_k);
            }
        }
        return scores;
    }

    matMul(a, b, rows, cols, inner) {
        const result = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                let sum = 0;
                for (let k = 0; k < inner; k++) {
                    sum += a[i][k] * b[k * cols + j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    feedForward(x, weights) {
        const hidden = this.relu(this.matMulVec(x, weights.W1));
        return this.matMulVec(hidden, weights.W2);
    }

    matMulVec(x, w) {
        return x.map((row, i) => {
            let sum = 0;
            for (let j = 0; j < row.length; j++) {
                sum += row[j] * w[j * row.length + i];
            }
            return sum;
        });
    }

    relu(x) {
        return x.map(v => Math.max(0, v));
    }

    layerNorm(x, ln) {
        const mean = x.reduce((a, b) => a + b, 0) / x.length;
        const variance = x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
        return x.map(v => ((v - mean) / Math.sqrt(variance + 1e-8)) * ln.gamma[0] + ln.beta[0]);
    }

    forward(x, weights) {
        const attnOut = this.multiHeadAttention(x, weights);
        const attnNorm = this.layerNorm(x.map((row, i) => 
            row.map((v, j) => v + this.dropout * attnOut[i][j])
        ), this.layerNorm1);
        
        const ffOut = this.feedForward(attnNorm, weights);
        return this.layerNorm(attnNorm.map((row, i) => 
            row.map((v, j) => v + this.dropout * ffOut[i][j])
        ), this.layerNorm2);
    }
}

class Transformer {
    constructor(config = {}) {
        this.numLayers = config.numLayers || 6;
        this.hiddenSize = config.hiddenSize || 512;
        this.numHeads = config.numHeads || 8;
        this.vocabSize = config.vocabSize || 50000;
        this.maxLen = config.maxLen || 512;
        this.layers = [];
        this.positionalEncoding = this.initPositionalEncoding();
        
        for (let i = 0; i < this.numLayers; i++) {
            this.layers.push(new TransformerLayer({
                hiddenSize: this.hiddenSize,
                num_heads: this.numHeads
            }));
        }
        
        this.weights = this.layers.map(() => this.layers[0].initWeights());
        this.embeddings = this.initEmbeddings();
    }

    initEmbeddings() {
        return new Float32Array(this.vocabSize * this.hiddenSize).fill(0).map(() => 
            (Math.random() - 0.5) * 0.02
        );
    }

    initPositionalEncoding() {
        const pe = new Float32Array(this.maxLen * this.hiddenSize);
        for (let pos = 0; pos < this.maxLen; pos++) {
            for (let i = 0; i < this.hiddenSize; i += 2) {
                pe[pos * this.hiddenSize + i] = Math.sin(pos / Math.pow(10000, i / this.hiddenSize));
                pe[pos * this.hiddenSize + i + 1] = Math.cos(pos / Math.pow(10000, (i + 1) / this.hiddenSize));
            }
        }
        return pe;
    }

    embed(tokens) {
        const seqLen = Math.min(tokens.length, this.maxLen);
        const embedded = [];
        
        for (let i = 0; i < seqLen; i++) {
            const tokenId = tokens[i] % this.vocabSize;
            const embedding = [];
            for (let j = 0; j < this.hiddenSize; j++) {
                embedding[j] = this.embeddings[tokenId * this.hiddenSize + j] + this.positionalEncoding[i * this.hiddenSize + j];
            }
            embedded.push(embedding);
        }
        return embedded;
    }

    encode(tokens) {
        let x = this.embed(tokens);
        
        for (let i = 0; i < this.numLayers; i++) {
            x = this.layers[i].forward(x, this.weights[i]);
        }
        
        return x;
    }

    decode(inputTokens, maxNewTokens = 50) {
        const outputTokens = [...inputTokens];
        
        for (let step = 0; step < maxNewTokens; step++) {
            const logits = this.encode(outputTokens);
            const lastLogits = logits[logits.length - 1];
            
            const nextToken = this.sample(lastLogits);
            outputTokens.push(nextToken);
            
            if (nextToken === 2) break;
        }
        
        return outputTokens;
    }

    sample(logits) {
        const probs = this.softmax(logits);
        const rand = Math.random();
        let cumsum = 0;
        
        for (let i = 0; i < probs.length; i++) {
            cumsum += probs[i];
            if (rand < cumsum) return i;
        }
        return probs.length - 1;
    }

    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(x => x / sum);
    }

    train(inputTokens, targetTokens, learningRate = 0.0001) {
        const output = this.encode(inputTokens);
        let loss = 0;
        
        for (let i = 0; i < targetTokens.length; i++) {
            const logits = output[i < output.length ? i : output.length - 1];
            const targetProb = this.softmax(logits)[targetTokens[i]];
            loss -= Math.log(Math.max(targetProb, 1e-8));
            
            for (let j = 0; j < this.embeddings.length; j++) {
                const grad = (this.softmax(logits)[j] - (j === targetTokens[i] ? 1 : 0)) * learningRate;
                this.embeddings[j] -= grad;
            }
        }
        
        return loss / targetTokens.length;
    }

    save() {
        return {
            weights: this.weights,
            embeddings: Array.from(this.embeddings),
            config: {
                numLayers: this.numLayers,
                hiddenSize: this.hiddenSize,
                numHeads: this.numHeads,
                vocabSize: this.vocabSize
            }
        };
    }

    load(state) {
        this.weights = state.weights;
        this.embeddings = new Float32Array(state.embeddings);
        this.numLayers = state.config.numLayers;
        this.hiddenSize = state.config.hiddenSize;
        this.numHeads = state.config.numHeads;
        this.vocabSize = state.config.vocabSize;
    }
}

export { Transformer, TransformerLayer };