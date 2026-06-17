/**
 * NEXUS Logger Module
 * Advanced logging with levels and persistence
 */

class Logger {
    constructor(options = {}) {
        this.name = options.name || 'NEXUS';
        this.level = this.parseLevel(options.level || 'info');
        this.handlers = [];
        this.history = [];
        this.maxHistory = options.maxHistory || 1000;
        this.enableConsole = options.enableConsole !== false;
        this.enableStorage = options.enableStorage !== false;
        this.formatter = options.formatter || this.defaultFormatter.bind(this);
        
        this.levels = {
            trace: 0,
            debug: 1,
            info: 2,
            warn: 3,
            error: 4,
            fatal: 5
        };

        this.colors = {
            trace: '#999',
            debug: '#666',
            info: '#2196F3',
            warn: '#FF9800',
            error: '#F44336',
            fatal: '#9C27B0'
        };
    }

    parseLevel(level) {
        return this.levels[level] ?? this.levels.info;
    }

    defaultFormatter(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}${metaStr}`;
    }

    addHandler(handler) {
        this.handlers.push(handler);
        return () => this.removeHandler(handler);
    }

    removeHandler(handler) {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }

    shouldLog(level) {
        return this.levels[level] >= this.level;
    }

    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return this;

        const entry = {
            timestamp: Date.now(),
            level,
            message,
            meta,
            logger: this.name
        };

        this.history.push(entry);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        const formatted = this.formatter(level, message, meta);

        if (this.enableConsole) {
            this.consoleLog(level, formatted);
        }

        for (const handler of this.handlers) {
            try {
                handler(entry, formatted);
            } catch (error) {
                console.error('[Logger] Handler error:', error);
            }
        }

        if (this.enableStorage) {
            this.persistEntry(entry);
        }

        return this;
    }

    consoleLog(level, message) {
        const style = `color: ${this.colors[level]}`;
        
        switch (level) {
            case 'trace':
            case 'debug':
                console.debug(`%c${message}`, style);
                break;
            case 'info':
                console.info(`%c${message}`, style);
                break;
            case 'warn':
                console.warn(`%c${message}`, style);
                break;
            case 'error':
            case 'fatal':
                console.error(`%c${message}`, style);
                break;
            default:
                console.log(message);
        }
    }

    persistEntry(entry) {
        try {
            const key = `log_${entry.level}`;
            let logs = [];
            
            try {
                const existing = localStorage.getItem(key);
                if (existing) {
                    logs = JSON.parse(existing);
                }
            } catch (e) {}

            logs.push({
                timestamp: entry.timestamp,
                message: entry.message,
                meta: entry.meta
            });

            if (logs.length > 100) {
                logs = logs.slice(-100);
            }

            localStorage.setItem(key, JSON.stringify(logs));
        } catch (error) {
            console.warn('[Logger] Failed to persist log:', error);
        }
    }

    trace(message, meta = {}) {
        return this.log('trace', message, meta);
    }

    debug(message, meta = {}) {
        return this.log('debug', message, meta);
    }

    info(message, meta = {}) {
        return this.log('info', message, meta);
    }

    warn(message, meta = {}) {
        return this.log('warn', message, meta);
    }

    error(message, meta = {}) {
        return this.log('error', message, meta);
    }

    fatal(message, meta = {}) {
        return this.log('fatal', message, meta);
    }

    group(label = 'Group') {
        if (this.enableConsole) {
            console.group(`[${this.name}] ${label}`);
        }
        return {
            end: () => {
                if (this.enableConsole) {
                    console.groupEnd();
                }
            }
        };
    }

    table(data, columns = null) {
        if (this.enableConsole) {
            if (columns) {
                console.table(data, columns);
            } else {
                console.table(data);
            }
        }
        return this;
    }

    time(label = 'default') {
        if (this.enableConsole) {
            console.time(`${this.name}:${label}`);
        }
        return {
            end: (value) => {
                if (this.enableConsole) {
                    console.timeEnd(`${this.name}:${label}`);
                }
                if (value !== undefined) {
                    this.debug(`${label} took ${value}ms`);
                }
            }
        };
    }

    assert(condition, message) {
        if (!condition) {
            return this.error(`Assertion failed: ${message}`);
        }
        return this;
    }

    getHistory(level = null, limit = 100) {
        let filtered = this.history;
        
        if (level) {
            filtered = filtered.filter(e => e.level === level);
        }
        
        return filtered.slice(-limit);
    }

    clearHistory() {
        this.history = [];
        return this;
    }

    clearStorage() {
        const prefixes = ['log_trace', 'log_debug', 'log_info', 'log_warn', 'log_error', 'log_fatal'];
        
        for (const prefix of prefixes) {
            localStorage.removeItem(prefix);
        }
        
        return this;
    }

    getStats() {
        const stats = {
            total: this.history.length,
            byLevel: {}
        };

        for (const level of Object.keys(this.levels)) {
            stats.byLevel[level] = this.history.filter(e => e.level === level).length;
        }

        const now = Date.now();
        stats.last24h = this.history.filter(e => now - e.timestamp < 86400000).length;
        stats.last1h = this.history.filter(e => now - e.timestamp < 3600000).length;
        
        return stats;
    }

    setLevel(level) {
        this.level = this.parseLevel(level);
        return this;
    }

    export() {
        return {
            name: this.name,
            level: Object.keys(this.levels).find(k => this.levels[k] === this.level),
            history: this.history,
            exportedAt: Date.now()
        };
    }

    import(data) {
        if (data.history) {
            this.history = data.history;
        }
        if (data.level) {
            this.level = this.parseLevel(data.level);
        }
        return this;
    }

    createChild(name, options = {}) {
        return new Logger({
            name: `${this.name}:${name}`,
            level: options.level || Object.keys(this.levels).find(k => this.levels[k] === this.level),
            enableConsole: options.enableConsole !== false,
            enableStorage: options.enableStorage !== false,
            maxHistory: options.maxHistory || this.maxHistory
        });
    }
}

// Predefined handlers
const Handlers = {
    file: (filename = 'app.log') => {
        return (entry, formatted) => {
            try {
                const logs = JSON.parse(localStorage.getItem(`file_${filename}`) || '[]');
                logs.push({ ...entry, formatted });
                if (logs.length > 500) {
                    logs.splice(0, logs.length - 500);
                }
                localStorage.setItem(`file_${filename}`, JSON.stringify(logs));
            } catch (e) {}
        };
    },

    remote: (url, options = {}) => {
        return async (entry, formatted) => {
            try {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...entry, formatted, ...options.metadata })
                });
            } catch (e) {}
        };
    },

    buffer: (flushInterval = 5000, maxSize = 100) => {
        let buffer = [];
        let intervalId = null;

        const flush = () => {
            if (buffer.length > 0) {
                console.log('[BufferHandler] Flushing', buffer.length, 'entries');
                buffer = [];
            }
        };

        return {
            handler: (entry) => {
                buffer.push(entry);
                if (buffer.length >= maxSize) {
                    flush();
                }
            },
            start: () => {
                if (!intervalId) {
                    intervalId = setInterval(flush, flushInterval);
                }
            },
            stop: () => {
                if (intervalId) {
                    clearInterval(intervalId);
                    flush();
                }
            }
        };
    }
};

// Global logger instance
const logger = new Logger({ name: 'NEXUS' });

export { Logger, Handlers, logger };