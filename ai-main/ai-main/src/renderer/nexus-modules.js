/**
 * NEXUS AI System - Complete Module Index
 * All modules integrated and ready to use
 */

// AI/ML Modules
export { Transformer, TransformerLayer } from './ai-modules/transformer.js';
export { RLEnvironment, DQN } from './ai-modules/reinforcement-learning.js';
export { KnowledgeGraph } from './ai-modules/knowledge-graph.js';
export { 
    MultiModalProcessor, 
    ImageEncoder, 
    TextEncoder, 
    AudioEncoder, 
    FusionLayer, 
    AttentionFusion 
} from './ai-modules/multimodal.js';
export { FineTuningPipeline, SimpleTokenizer } from './ai-modules/finetuning.js';

// System Modules
export { FileManager } from './system/file-manager.js';
export { Database } from './system/database.js';
export { APIBridge, RateLimiter } from './system/api-bridge.js';
export { TaskScheduler } from './system/scheduler.js';
export { Logger, Handlers, logger } from './system/logger.js';

// Integration Modules
export { WebScraper } from './integrations/web-scraper.js';
export { RSSReader } from './integrations/rss-reader.js';
export { EmailConnector, EmailTemplates } from './integrations/email-connector.js';
export { CloudStorage } from './integrations/cloud-storage.js';
export { BotIntegration, SlackBot, DiscordBot } from './integrations/bot-integration.js';

// Security Modules
export { AuthManager } from './security/auth-manager.js';
export { InputValidator } from './security/input-validator.js';

// UI/UX Modules
export { DarkModeManager } from './ui/dark-mode.js';
export { ChatHistory } from './ui/chat-history.js';
export { VoiceCommands, VoiceSynthesis } from './ui/voice-commands.js';
export { KeyboardShortcuts } from './ui/keyboard-shortcuts.js';

/**
 * NEXUS System - Main Entry Point
 * Initialize all modules with a single call
 */
class NEXUS {
    constructor(config = {}) {
        this.config = config;
        this.modules = {};
        this.initialized = false;
    }

    async init() {
        console.log('🧠 NEXUS AI System Initializing...');

        // Initialize AI/ML modules
        this.modules.transformer = new Transformer({ numLayers: 6, hiddenSize: 512 });
        this.modules.dqn = new DQN({ stateSize: 4, actionSize: 2 });
        this.modules.knowledgeGraph = new KnowledgeGraph();
        this.modules.multimodal = new MultiModalProcessor();
        this.modules.fineTuning = new FineTuningPipeline(this.modules.transformer);

        // Initialize System modules
        this.modules.fileManager = new FileManager();
        this.modules.database = new Database();
        this.modules.apiBridge = new APIBridge();
        this.modules.scheduler = new TaskScheduler();
        this.modules.logger = new Logger({ name: 'NEXUS' });

        // Initialize Integration modules
        this.modules.webScraper = new WebScraper();
        this.modules.rssReader = new RSSReader();
        this.modules.emailConnector = new EmailConnector();
        this.modules.cloudStorage = new CloudStorage();
        this.modules.botIntegration = new BotIntegration();

        // Initialize Security modules
        this.modules.authManager = new AuthManager();
        this.modules.inputValidator = new InputValidator();

        // Initialize UI/UX modules
        this.modules.darkMode = new DarkModeManager();
        this.modules.chatHistory = new ChatHistory();
        this.modules.voiceCommands = new VoiceCommands();
        this.modules.voiceSynthesis = new VoiceSynthesis();
        this.modules.keyboardShortcuts = new KeyboardShortcuts();

        // Connect modules
        this.connectModules();

        // Start scheduler
        this.modules.scheduler.start();

        this.initialized = true;
        console.log('✅ NEXUS AI System Ready!');

        return this;
    }

    connectModules() {
        // Connect voice commands to synthesis
        this.modules.voiceCommands.on('transcript', ({ transcript }) => {
            this.modules.logger.debug(`Voice input: ${transcript}`);
        });

        // Connect chat history to voice
        this.modules.voiceCommands.on('command', ({ result }) => {
            if (result.action === 'clearChat') {
                this.modules.chatHistory.clearAll();
            }
        });

        // Connect scheduler to logger
        this.modules.scheduler.on('taskComplete', ({ task }) => {
            this.modules.logger.debug(`Task completed: ${task}`);
        });

        this.modules.logger.info('All modules connected');
    }

    getModule(name) {
        return this.modules[name];
    }

    getAllModules() {
        return Object.keys(this.modules);
    }

    async shutdown() {
        this.modules.scheduler.stop();
        this.modules.voiceSynthesis.stop();
        this.initialized = false;
        console.log('🔴 NEXUS AI System Shutdown');
    }
}

// Default export
export default NEXUS;

// Quick access instances
export const nexus = {
    transformer: null,
    rl: null,
    knowledgeGraph: null,
    database: null,
    api: null,
    scheduler: null,
    logger: null,
    scraper: null,
    rss: null,
    email: null,
    cloud: null,
    auth: null,
    validator: null,
    darkMode: null,
    chat: null,
    voice: null,
    shortcuts: null
};

export function initNEXUS(config = {}) {
    const instance = new NEXUS(config);
    return instance.init().then(n => {
        Object.assign(nexus, n.modules);
        return n;
    });
}