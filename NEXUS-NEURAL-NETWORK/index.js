/**
 * NEXUS NEURAL NETWORK - Index
 * সব মডিউল এক্সপোর্ট
 */

// Core
export { default as NEXUSModel } from './core/model.js';
export { NEXUS_LAYERS } from './core/layers.js';
export { NEXUS_ACTIVATIONS } from './core/activations.js';

// Learning
export { SmartLearningSystem } from './learning/smart-learning.js';

// Auto-Start
export { AutoStartSystem } from './auto-start/auto-start.js';

// Remind
export { SmartRemindSystem } from './remind/smart-remind.js';

// Object Detection
export { ObjectDetectionSystem } from './object-detection/object-detection.js';

// Transaction Pipeline
export { TransactionPipeline } from './transaction/transaction-pipeline.js';

// Main
export { default as NEXUS } from './nexus-main.js';

// Auto-load for browser
if (typeof window !== 'undefined') {
    // Load all modules
    const scripts = [
        './core/layers.js',
        './core/activations.js',
        './core/model.js',
        './core/index.js',
        './learning/smart-learning.js',
        './auto-start/auto-start.js',
        './remind/smart-remind.js',
        './object-detection/object-detection.js',
        './transaction/transaction-pipeline.js',
        './nexus-main.js'
    ];
    
    console.log('[NEXUS Neural Network] All modules ready');
    console.log('[NEXUS] Available exports:');
    console.log('  - NEXUS: Main AI system');
    console.log('  - NEXUSModel: Neural network model');
    console.log('  - SmartLearningSystem: Adaptive learning');
    console.log('  - AutoStartSystem: Auto-start and recovery');
    console.log('  - SmartRemindSystem: Intelligent reminders');
    console.log('  - ObjectDetectionSystem: Object detection');
    console.log('  - TransactionPipeline: Data processing');
}
