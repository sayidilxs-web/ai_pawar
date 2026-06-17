/**
 * NEXUS AI - Logger Utility
 * লগিং ইউটিলিটি
 */

const logLevels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

class Logger {
    constructor(name) {
        this.name = name;
        this.level = logLevels.DEBUG;
        this.logs = [];
        this.maxLogs = 100;
    }
    
    setLevel(level) {
        this.level = level;
    }
    
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level}] [${this.name}] ${message}${dataStr}`;
    }
    
    debug(message, data) {
        if (this.level <= logLevels.DEBUG) {
            const formatted = this.formatMessage('DEBUG', message, data);
            console.debug(formatted);
            this.addLog(formatted);
        }
    }
    
    info(message, data) {
        if (this.level <= logLevels.INFO) {
            const formatted = this.formatMessage('INFO', message, data);
            console.info(formatted);
            this.addLog(formatted);
        }
    }
    
    warn(message, data) {
        if (this.level <= logLevels.WARN) {
            const formatted = this.formatMessage('WARN', message, data);
            console.warn(formatted);
            this.addLog(formatted);
        }
    }
    
    error(message, data) {
        if (this.level <= logLevels.ERROR) {
            const formatted = this.formatMessage('ERROR', message, data);
            console.error(formatted);
            this.addLog(formatted);
        }
    }
    
    fatal(message, data) {
        if (this.level <= logLevels.FATAL) {
            const formatted = this.formatMessage('FATAL', message, data);
            console.error(formatted);
            this.addLog(formatted);
        }
    }
    
    addLog(message) {
        this.logs.push({
            message,
            timestamp: Date.now()
        });
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }
    
    getLogs() {
        return this.logs;
    }
    
    clearLogs() {
        this.logs = [];
    }
    
    exportLogs() {
        return this.logs.map(log => log.message).join('\n');
    }
}

// Create global logger
window.logger = {
    main: new Logger('Main'),
    voice: new Logger('Voice'),
    ai: new Logger('AI'),
    screen: new Logger('Screen'),
    automation: new Logger('Automation'),
    face: new Logger('Face'),
    
    create(name) {
        return new Logger(name);
    }
};