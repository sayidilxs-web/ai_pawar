/**
 * NEXUS AI - Transaction Pipeline System
 * Data Flow, Processing, Real-time Streaming
 * ট্রানজেকশন পাইপলাইন সিস্টেম
 */

class TransactionPipeline {
    constructor() {
        this.stages = new Map();
        this.queue = [];
        this.processing = false;
        this.isPaused = false;
        
        // Configuration
        this.config = {
            maxQueueSize: 1000,
            maxConcurrent: 10,
            retryAttempts: 3,
            retryDelay: 1000,
            timeout: 30000,
            autoStart: false
        };
        
        // Statistics
        this.stats = {
            totalProcessed: 0,
            totalFailed: 0,
            totalQueued: 0,
            averageLatency: 0,
            throughput: 0,
            lastProcessedAt: null
        };
        
        // Event handlers
        this.events = {
            start: [],
            end: [],
            error: [],
            progress: [],
            stage: []
        };
        
        // Pipeline state
        this.state = {
            currentTransaction: null,
            stageResults: new Map(),
            metadata: {}
        };
        
        this.initialize();
    }

    initialize() {
        console.log('[Transaction Pipeline] System initialized');
        
        // Register default stages
        this.registerDefaultStages();
        
        if (this.config.autoStart) {
            this.start();
        }
    }

    // ==================== STAGE MANAGEMENT ====================

    registerStage(name, stageConfig) {
        const stage = {
            name,
            handler: stageConfig.handler || this.defaultHandler.bind(this),
            validator: stageConfig.validator || null,
            transformer: stageConfig.transformer || null,
            retryable: stageConfig.retryable !== false,
            parallel: stageConfig.parallel || false,
            timeout: stageConfig.timeout || this.config.timeout,
            priority: stageConfig.priority || 0,
            enabled: stageConfig.enabled !== false,
            dependencies: stageConfig.dependencies || [],
            
            // Statistics
            stats: {
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                totalLatency: 0,
                averageLatency: 0
            }
        };
        
        this.stages.set(name, stage);
        console.log(`[Transaction Pipeline] Stage registered: ${name}`);
        
        return this;
    }

    registerDefaultStages() {
        // Input validation stage
        this.registerStage('validate', {
            handler: async (data) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid input data');
                }
                return data;
            },
            priority: 0
        });
        
        // Data preprocessing stage
        this.registerStage('preprocess', {
            handler: async (data) => {
                // Normalize data
                if (typeof data === 'string') {
                    return { raw: data, normalized: data.trim().toLowerCase() };
                }
                return data;
            },
            dependencies: ['validate'],
            priority: 1
        });
        
        // Feature extraction stage
        this.registerStage('extract', {
            handler: async (data) => {
                const features = {};
                
                if (typeof data === 'object') {
                    for (const [key, value] of Object.entries(data)) {
                        features[key] = {
                            type: typeof value,
                            value,
                            timestamp: Date.now()
                        };
                    }
                }
                
                return { ...data, features };
            },
            dependencies: ['preprocess'],
            priority: 2
        });
        
        // Processing stage
        this.registerStage('process', {
            handler: async (data) => {
                // Main processing logic
                return {
                    ...data,
                    processed: true,
                    processedAt: Date.now()
                };
            },
            dependencies: ['extract'],
            priority: 3
        });
        
        // Output transformation stage
        this.registerStage('transform', {
            handler: async (data) => {
                return {
                    output: data,
                    metadata: {
                        processedAt: Date.now(),
                        pipeline: 'NEXUS-TRANSACTION'
                    }
                };
            },
            dependencies: ['process'],
            priority: 4
        });
    }

    getStage(name) {
        return this.stages.get(name);
    }

    getStagesInOrder() {
        const ordered = [];
        const visited = new Set();
        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);
            
            const stage = this.stages.get(name);
            if (!stage || !stage.enabled) return;
            
            // Visit dependencies first
            for (const dep of stage.dependencies) {
                visit(dep);
            }
            
            ordered.push(stage);
        };
        
        for (const [name] of this.stages) {
            visit(name);
        }
        
        return ordered.sort((a, b) => a.priority - b.priority);
    }

    // ==================== TRANSACTION PROCESSING ====================

    async process(data, options = {}) {
        const transactionId = options.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const transaction = {
            id: transactionId,
            data,
            options,
            status: 'queued',
            stages: [],
            results: {},
            errors: [],
            startTime: Date.now(),
            endTime: null,
            latency: 0
        };
        
        // Add to queue
        this.queue.push(transaction);
        this.stats.totalQueued++;
        
        // Emit start event
        this.emit('start', transaction);
        
        console.log(`[Transaction Pipeline] Transaction queued: ${transactionId}`);
        
        // Process immediately if not processing
        if (!this.processing) {
            this.processNext();
        }
        
        return transaction;
    }

    async processNext() {
        if (this.isPaused || this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        
        const transaction = this.queue.shift();
        this.state.currentTransaction = transaction;
        transaction.status = 'processing';
        
        try {
            await this.executePipeline(transaction);
            
            transaction.status = 'completed';
            transaction.endTime = Date.now();
            transaction.latency = transaction.endTime - transaction.startTime;
            
            this.stats.totalProcessed++;
            this.stats.lastProcessedAt = Date.now();
            this.updateThroughput();
            
            this.emit('end', transaction);
            
        } catch (error) {
            transaction.status = 'failed';
            transaction.errors.push({
                error: error.message,
                timestamp: Date.now()
            });
            
            this.stats.totalFailed++;
            
            this.emit('error', { transaction, error });
            
            console.error(`[Transaction Pipeline] Transaction failed: ${transaction.id}`, error);
        }
        
        this.state.currentTransaction = null;
        
        // Process next
        if (this.queue.length > 0) {
            this.processNext();
        } else {
            this.processing = false;
        }
    }

    async executePipeline(transaction) {
        const stages = this.getStagesInOrder();
        
        for (const stage of stages) {
            if (!stage.enabled) continue;
            
            const stageStart = Date.now();
            
            try {
                this.emit('stage', { transaction, stage: stage.name, status: 'start' });
                
                // Validate dependencies
                if (!this.validateDependencies(transaction, stage)) {
                    throw new Error(`Dependencies not met for stage: ${stage.name}`);
                }
                
                // Execute stage
                let result = await this.executeWithTimeout(
                    stage,
                    transaction.data,
                    stage.timeout
                );
                
                // Apply transformer if exists
                if (stage.transformer) {
                    result = stage.transformer(result);
                }
                
                // Store result
                transaction.data = result;
                transaction.results[stage.name] = {
                    success: true,
                    latency: Date.now() - stageStart,
                    timestamp: Date.now()
                };
                
                // Update stage stats
                stage.stats.totalExecutions++;
                stage.stats.successfulExecutions++;
                stage.stats.totalLatency += Date.now() - stageStart;
                stage.stats.averageLatency = stage.stats.totalLatency / stage.stats.successfulExecutions;
                
                this.emit('stage', { transaction, stage: stage.name, status: 'complete' });
                this.emit('progress', {
                    transaction,
                    progress: (stages.indexOf(stage) + 1) / stages.length,
                    stage: stage.name
                });
                
            } catch (error) {
                stage.stats.totalExecutions++;
                stage.stats.failedExecutions++;
                
                transaction.results[stage.name] = {
                    success: false,
                    error: error.message,
                    latency: Date.now() - stageStart,
                    timestamp: Date.now()
                };
                
                this.emit('stage', { transaction, stage: stage.name, status: 'error', error });
                
                if (!stage.retryable) {
                    throw error;
                }
                
                // Retry logic
                for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                    console.log(`[Transaction Pipeline] Retrying stage ${stage.name}, attempt ${attempt}`);
                    
                    await this.delay(this.config.retryDelay * attempt);
                    
                    try {
                        transaction.data = await this.executeWithTimeout(stage, transaction.data, stage.timeout);
                        break;
                    } catch (retryError) {
                        if (attempt === this.config.retryAttempts) {
                            throw retryError;
                        }
                    }
                }
            }
        }
        
        return transaction.data;
    }

    async executeWithTimeout(stage, data, timeout) {
        return Promise.race([
            stage.handler(data),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Stage ${stage.name} timed out`)), timeout)
            )
        ]);
    }

    validateDependencies(transaction, stage) {
        for (const dep of stage.dependencies) {
            if (!transaction.results[dep] || !transaction.results[dep].success) {
                return false;
            }
        }
        return true;
    }

    // ==================== STREAM PROCESSING ====================

    createStream() {
        return new TransactionStream(this);
    }

    async processStream(dataGenerator, options = {}) {
        const stream = this.createStream();
        
        for await (const data of dataGenerator) {
            await stream.write(data);
        }
        
        return stream.flush();
    }

    // ==================== BATCH PROCESSING ====================

    async processBatch(items, options = {}) {
        const batchSize = options.batchSize || 10;
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            
            const batchResults = await Promise.all(
                batch.map(item => this.process(item, { batch: true }))
            );
            
            results.push(...batchResults);
            
            // Allow other tasks
            if (options.yieldInterval && (i / batchSize) % options.yieldInterval === 0) {
                await this.delay(0);
            }
        }
        
        return results;
    }

    // ==================== CONTROL ====================

    pause() {
        this.isPaused = true;
        console.log('[Transaction Pipeline] Paused');
    }

    resume() {
        this.isPaused = false;
        console.log('[Transaction Pipeline] Resumed');
        
        if (!this.processing && this.queue.length > 0) {
            this.processNext();
        }
    }

    clear() {
        this.queue = [];
        console.log('[Transaction Pipeline] Queue cleared');
    }

    // ==================== EVENTS ====================

    on(event, callback) {
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            for (const callback of this.events[event]) {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`[Transaction Pipeline] Event handler error: ${event}`, e);
                }
            }
        }
    }

    // ==================== STATISTICS ====================

    updateThroughput() {
        const windowMs = 60000; // 1 minute window
        const recentTransactions = this.state.metadata.recentTransactions || [];
        
        recentTransactions.push(Date.now());
        
        // Keep only recent transactions
        const cutoff = Date.now() - windowMs;
        while (recentTransactions.length > 0 && recentTransactions[0] < cutoff) {
            recentTransactions.shift();
        }
        
        this.stats.throughput = recentTransactions.length;
        this.state.metadata.recentTransactions = recentTransactions;
    }

    getStats() {
        const stageStats = {};
        for (const [name, stage] of this.stages) {
            stageStats[name] = { ...stage.stats };
        }
        
        return {
            ...this.stats,
            queueLength: this.queue.length,
            isProcessing: this.processing,
            isPaused: this.isPaused,
            stages: stageStats
        };
    }

    getStatus() {
        return {
            running: this.processing,
            paused: this.isPaused,
            queueLength: this.queue.length,
            currentTransaction: this.state.currentTransaction?.id || null,
            throughput: this.stats.throughput
        };
    }

    // ==================== UTILITIES ====================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    defaultHandler(data) {
        return data;
    }

    reset() {
        this.queue = [];
        this.processing = false;
        this.isPaused = false;
        this.stats = {
            totalProcessed: 0,
            totalFailed: 0,
            totalQueued: 0,
            averageLatency: 0,
            throughput: 0,
            lastProcessedAt: null
        };
        
        for (const stage of this.stages.values()) {
            stage.stats = {
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                totalLatency: 0,
                averageLatency: 0
            };
        }
        
        console.log('[Transaction Pipeline] Reset complete');
    }
}

// ==================== STREAM CLASS ====================

class TransactionStream {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.buffer = [];
        this.maxBufferSize = 100;
        this.isFlushing = false;
    }

    async write(data) {
        this.buffer.push(data);
        
        if (this.buffer.length >= this.maxBufferSize) {
            await this.flush();
        }
    }

    async flush() {
        if (this.buffer.length === 0 || this.isFlushing) return;
        
        this.isFlushing = true;
        const batch = [...this.buffer];
        this.buffer = [];
        
        await this.pipeline.processBatch(batch);
        
        this.isFlushing = false;
    }

    async end() {
        await this.flush();
    }
}

// Export
window.TransactionPipeline = TransactionPipeline;
window.transactionPipeline = new TransactionPipeline();
