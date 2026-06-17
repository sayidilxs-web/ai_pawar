/**
 * NEXUS Reinforcement Learning Module
 * DQN-based reinforcement learning agent
 */

class RLEnvironment {
    constructor(stateSpace, actionSpace) {
        this.stateSpace = stateSpace;
        this.actionSpace = actionSpace;
        this.state = this.reset();
    }

    reset() {
        return new Float32Array(this.stateSpace).fill(0);
    }

    step(action) {
        return { state: this.state, reward: 0, done: false };
    }

    render() {
        console.log('State:', Array.from(this.state));
    }
}

class DQN {
    constructor(stateSize, actionSize, config = {}) {
        this.stateSize = stateSize;
        this.actionSize = actionSize;
        this.gamma = config.gamma || 0.99;
        this.epsilon = config.epsilon || 1.0;
        this.epsilonMin = config.epsilonMin || 0.01;
        this.epsilonDecay = config.epsilonDecay || 0.995;
        this.learningRate = config.learningRate || 0.001;
        this.memory = [];
        this.maxMemory = config.maxMemory || 10000;
        this.batchSize = config.batchSize || 32;
        this.targetUpdateFreq = config.targetUpdateFreq || 10;
        this.trainStep = 0;
        
        this.qNetwork = this.buildNetwork();
        this.targetNetwork = this.buildNetwork();
        this.updateTargetNetwork();
    }

    buildNetwork() {
        return {
            weights1: this.xavierInit([this.stateSize, 64]),
            bias1: new Float32Array(64),
            weights2: this.xavierInit([64, 32]),
            bias2: new Float32Array(32),
            weights3: this.xavierInit([32, this.actionSize]),
            bias3: new Float32Array(this.actionSize)
        };
    }

    xavierInit(shape) {
        const fanIn = shape[0];
        const fanOut = shape[1];
        const limit = Math.sqrt(6 / (fanIn + fanOut));
        return new Float32Array(shape[0] * shape[1]).fill(0).map(() => 
            (Math.random() * 2 - 1) * limit
        );
    }

    forward(state) {
        const hidden1 = this.relu(this.addBias(this.matMul([state], this.qNetwork.weights1), this.qNetwork.bias1));
        const hidden2 = this.relu(this.addBias(this.matMul(hidden1, this.qNetwork.weights2), this.qNetwork.bias2));
        return this.matMul(hidden2, this.qNetwork.weights3)[0];
    }

    matMul(a, w) {
        const rows = a.length;
        const cols = w.length / a[0].length;
        const result = new Float32Array(rows * cols);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                for (let k = 0; k < a[0].length; k++) {
                    result[i * cols + j] += a[i][k] * w[k * cols + j];
                }
            }
        }
        return result;
    }

    addBias(x, b) {
        return x.map((row, i) => row.map((v, j) => v + b[j]));
    }

    relu(x) {
        return x.map(row => row.map(v => Math.max(0, v)));
    }

    remember(state, action, reward, nextState, done) {
        this.memory.push({ state: Array.from(state), action, reward, nextState: Array.from(nextState), done });
        if (this.memory.length > this.maxMemory) {
            this.memory.shift();
        }
    }

    act(state) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.actionSize);
        }
        const qValues = this.forward(state);
        return qValues.indexOf(Math.max(...qValues));
    }

    actGreedy(state) {
        const qValues = this.forward(state);
        return qValues.indexOf(Math.max(...qValues));
    }

    replay() {
        if (this.memory.length < this.batchSize) return 0;
        
        const batch = [];
        for (let i = 0; i < this.batchSize; i++) {
            batch.push(this.memory[Math.floor(Math.random() * this.memory.length)]);
        }
        
        let totalLoss = 0;
        
        for (const sample of batch) {
            const currentQ = this.forward(new Float32Array(sample.state));
            const targetQ = [...currentQ];
            
            if (sample.done) {
                targetQ[sample.action] = sample.reward;
            } else {
                const nextQ = this.forward(new Float32Array(sample.nextState));
                targetQ[sample.action] = sample.reward + this.gamma * Math.max(...nextQ);
            }
            
            const loss = currentQ.reduce((sum, q, i) => sum + (q - targetQ[i]) ** 2, 0) / this.actionSize;
            totalLoss += loss;
        }
        
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
        
        this.trainStep++;
        if (this.trainStep % this.targetUpdateFreq === 0) {
            this.updateTargetNetwork();
        }
        
        return totalLoss / this.batchSize;
    }

    updateTargetNetwork() {
        this.targetNetwork = JSON.parse(JSON.stringify(this.qNetwork));
    }

    train(env, episodes = 1000, maxSteps = 1000) {
        const history = { episodes: [], rewards: [], losses: [], epsilons: [] };
        
        for (let ep = 0; ep < episodes; ep++) {
            let state = env.reset();
            let totalReward = 0;
            let totalLoss = 0;
            let steps = 0;
            
            for (let step = 0; step < maxSteps; step++) {
                const action = this.act(state);
                const { state: nextState, reward, done } = env.step(action);
                
                this.remember(state, action, reward, nextState, done);
                const loss = this.replay();
                
                state = nextState;
                totalReward += reward;
                totalLoss += loss;
                steps++;
                
                if (done) break;
            }
            
            history.episodes.push(ep + 1);
            history.rewards.push(totalReward);
            history.losses.push(totalLoss / steps);
            history.epsilons.push(this.epsilon);
            
            if ((ep + 1) % 10 === 0) {
                console.log(`Episode ${ep + 1}/${episodes} | Reward: ${totalReward.toFixed(2)} | Loss: ${(totalLoss / steps).toFixed(4)} | Epsilon: ${this.epsilon.toFixed(4)}`);
            }
        }
        
        return history;
    }

    save() {
        return { 
            qNetwork: this.qNetwork, 
            epsilon: this.epsilon,
            trainStep: this.trainStep,
            memory: this.memory.slice(-100)
        };
    }

    load(state) {
        this.qNetwork = state.qNetwork;
        this.epsilon = state.epsilon;
        this.trainStep = state.trainStep;
        this.memory = state.memory || [];
    }
}

export { RLEnvironment, DQN };