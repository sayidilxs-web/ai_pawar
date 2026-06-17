/**
 * NEXUS AI - Auto-Start System
 * System Startup, Background Service, Auto Recovery
 * অটো-স্টার্ট সিস্টেম
 */

class AutoStartSystem {
    constructor() {
        this.isRunning = false;
        this.isBackground = false;
        this.startupTime = null;
        this.lastHeartbeat = null;
        this.heartbeatInterval = 30000; // 30 seconds
        
        // Startup configuration
        this.config = {
            autoStart: true,
            minimizeToTray: true,
            startMinimized: false,
            startWithSystem: false,
            recoveryEnabled: true,
            maxRecoveryAttempts: 3,
            recoveryDelay: 5000
        };
        
        // Service workers
        this.services = new Map();
        this.serviceStatus = new Map();
        
        // Background tasks
        this.backgroundTasks = [];
        this.taskInterval = null;
        
        // Recovery tracking
        this.recoveryAttempts = 0;
        this.crashHistory = [];
        
        // System events
        this.eventListeners = {
            startup: [],
            shutdown: [],
            crash: [],
            recovery: [],
            heartbeat: []
        };
        
        this.initialize();
    }

    initialize() {
        console.log('[Auto-Start] System initialized');
        this.loadConfig();
        this.registerSystemHandlers();
    }

    // ==================== STARTUP ====================

    async start(options = {}) {
        if (this.isRunning) {
            console.log('[Auto-Start] Already running');
            return true;
        }
        
        console.log('[Auto-Start] Starting system...');
        this.startupTime = Date.now();
        this.isRunning = true;
        this.lastHeartbeat = Date.now();
        
        try {
            // Start all registered services
            for (const [name, service] of this.services) {
                await this.startService(name);
            }
            
            // Start background tasks
            this.startBackgroundTasks();
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Emit startup event
            this.emit('startup', { timestamp: this.startupTime });
            
            // Register with system
            if (options.registerStartup !== false) {
                this.registerWithSystem();
            }
            
            console.log('[Auto-Start] System started successfully');
            return true;
            
        } catch (error) {
            console.error('[Auto-Start] Startup failed:', error);
            this.handleCrash(error);
            return false;
        }
    }

    async stop() {
        if (!this.isRunning) {
            console.log('[Auto-Start] Not running');
            return true;
        }
        
        console.log('[Auto-Start] Stopping system...');
        
        try {
            // Stop all services
            for (const [name] of this.services) {
                await this.stopService(name);
            }
            
            // Stop background tasks
            this.stopBackgroundTasks();
            
            // Stop heartbeat
            this.stopHeartbeat();
            
            this.isRunning = false;
            this.emit('shutdown', { timestamp: Date.now() });
            
            console.log('[Auto-Start] System stopped');
            return true;
            
        } catch (error) {
            console.error('[Auto-Start] Stop failed:', error);
            return false;
        }
    }

    // ==================== SERVICES ====================

    registerService(name, service) {
        this.services.set(name, {
            name,
            service,
            status: 'stopped',
            startedAt: null,
            restartCount: 0,
            lastError: null,
            config: service.config || {}
        });
        
        console.log(`[Auto-Start] Service registered: ${name}`);
    }

    async startService(name) {
        const serviceInfo = this.services.get(name);
        
        if (!serviceInfo) {
            console.error(`[Auto-Start] Service not found: ${name}`);
            return false;
        }
        
        if (serviceInfo.status === 'running') {
            console.log(`[Auto-Start] Service already running: ${name}`);
            return true;
        }
        
        try {
            console.log(`[Auto-Start] Starting service: ${name}`);
            
            // Initialize service
            if (serviceInfo.service.init) {
                await serviceInfo.service.init();
            }
            
            // Start service
            if (serviceInfo.service.start) {
                await serviceInfo.service.start();
            }
            
            serviceInfo.status = 'running';
            serviceInfo.startedAt = Date.now();
            serviceInfo.lastError = null;
            this.serviceStatus.set(name, 'running');
            
            console.log(`[Auto-Start] Service started: ${name}`);
            return true;
            
        } catch (error) {
            console.error(`[Auto-Start] Service start failed: ${name}`, error);
            serviceInfo.status = 'error';
            serviceInfo.lastError = error.message;
            this.serviceStatus.set(name, 'error');
            
            // Try recovery
            if (this.config.recoveryEnabled) {
                await this.recoverService(name);
            }
            
            return false;
        }
    }

    async stopService(name) {
        const serviceInfo = this.services.get(name);
        
        if (!serviceInfo) return true;
        
        try {
            if (serviceInfo.service.stop) {
                await serviceInfo.service.stop();
            }
            
            serviceInfo.status = 'stopped';
            serviceInfo.startedAt = null;
            this.serviceStatus.set(name, 'stopped');
            
            console.log(`[Auto-Start] Service stopped: ${name}`);
            return true;
            
        } catch (error) {
            console.error(`[Auto-Start] Service stop failed: ${name}`, error);
            return false;
        }
    }

    async recoverService(name) {
        if (this.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            console.error(`[Auto-Start] Max recovery attempts reached for: ${name}`);
            return false;
        }
        
        this.recoveryAttempts++;
        
        console.log(`[Auto-Start] Recovering service: ${name} (attempt ${this.recoveryAttempts})`);
        
        await new Promise(r => setTimeout(r, this.config.recoveryDelay));
        
        // Stop service first
        await this.stopService(name);
        
        // Restart service
        return await this.startService(name);
    }

    // ==================== BACKGROUND TASKS ====================

    registerBackgroundTask(task) {
        this.backgroundTasks.push({
            id: task.id || `task_${Date.now()}`,
            task,
            interval: task.interval || 60000, // Default 1 minute
            lastRun: null,
            nextRun: null,
            enabled: true,
            errorCount: 0,
            maxErrors: 3
        });
        
        console.log(`[Auto-Start] Background task registered: ${task.id}`);
    }

    startBackgroundTasks() {
        if (this.taskInterval) return;
        
        this.taskInterval = setInterval(() => {
            this.runBackgroundTasks();
        }, 1000); // Check every second
        
        console.log('[Auto-Start] Background tasks started');
    }

    stopBackgroundTasks() {
        if (this.taskInterval) {
            clearInterval(this.taskInterval);
            this.taskInterval = null;
        }
        
        console.log('[Auto-Start] Background tasks stopped');
    }

    async runBackgroundTasks() {
        const now = Date.now();
        
        for (const taskInfo of this.backgroundTasks) {
            if (!taskInfo.enabled) continue;
            
            if (!taskInfo.nextRun || now >= taskInfo.nextRun) {
                try {
                    await taskInfo.task.execute();
                    taskInfo.lastRun = now;
                    taskInfo.nextRun = now + taskInfo.interval;
                    taskInfo.errorCount = 0;
                } catch (error) {
                    console.error(`[Auto-Start] Task error: ${taskInfo.id}`, error);
                    taskInfo.errorCount++;
                    
                    if (taskInfo.errorCount >= taskInfo.maxErrors) {
                        taskInfo.enabled = false;
                        console.warn(`[Auto-Start] Task disabled: ${taskInfo.id}`);
                    }
                }
            }
        }
    }

    // ==================== HEARTBEAT ====================

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, this.heartbeatInterval);
        
        console.log('[Auto-Start] Heartbeat started');
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        console.log('[Auto-Start] Heartbeat stopped');
    }

    sendHeartbeat() {
        this.lastHeartbeat = Date.now();
        
        // Check for stale services
        for (const [name, info] of this.services) {
            if (info.status === 'running' && info.startedAt) {
                const uptime = Date.now() - info.startedAt;
                // Service is healthy if running
            }
        }
        
        this.emit('heartbeat', {
            timestamp: this.lastHeartbeat,
            services: this.getServiceStatus()
        });
    }

    // ==================== SYSTEM INTEGRATION ====================

    registerWithSystem() {
        // Register with operating system for auto-start
        if (navigator.platform.includes('Win')) {
            this.registerWindowsStartup();
        } else if (navigator.platform.includes('Mac')) {
            this.registerMacStartup();
        } else {
            this.registerLinuxStartup();
        }
    }

    registerWindowsStartup() {
        // For Windows, would typically write to registry
        // This is a placeholder for the actual implementation
        console.log('[Auto-Start] Windows startup registration');
        
        // Store preference
        if (this.config.startWithSystem) {
            localStorage.setItem('nexus_autostart_windows', 'true');
        }
    }

    registerMacStartup() {
        console.log('[Auto-Start] Mac startup registration');
        localStorage.setItem('nexus_autostart_mac', this.config.startWithSystem ? 'true' : 'false');
    }

    registerLinuxStartup() {
        console.log('[Auto-Start] Linux startup registration');
        localStorage.setItem('nexus_autostart_linux', this.config.startWithSystem ? 'true' : 'false');
    }

    registerSystemHandlers() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onBackground();
            } else {
                this.onForeground();
            }
        });
        
        // Handle before unload
        window.addEventListener('beforeunload', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Handle online/offline
        window.addEventListener('online', () => {
            console.log('[Auto-Start] Network online');
            this.onNetworkOnline();
        });
        
        window.addEventListener('offline', () => {
            console.log('[Auto-Start] Network offline');
            this.onNetworkOffline();
        });
    }

    onBackground() {
        console.log('[Auto-Start] App moved to background');
        this.isBackground = true;
        
        // Reduce activity in background
        if (this.config.minimizeToTray) {
            // Notify tray
        }
    }

    onForeground() {
        console.log('[Auto-Start] App moved to foreground');
        this.isBackground = false;
        
        // Resume full activity
        this.sendHeartbeat();
    }

    onNetworkOnline() {
        // Resume network operations
        for (const [name, info] of this.services) {
            if (info.status === 'error' && info.service.reconnect) {
                this.startService(name);
            }
        }
    }

    onNetworkOffline() {
        // Pause network operations
        console.log('[Auto-Start] Pausing network operations');
    }

    // ==================== CRASH HANDLING ====================

    handleCrash(error) {
        const crashInfo = {
            error: error.message || String(error),
            stack: error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.crashHistory.push(crashInfo);
        this.emit('crash', crashInfo);
        
        console.error('[Auto-Start] Crash detected:', crashInfo);
        
        // Try recovery
        if (this.config.recoveryEnabled) {
            this.attemptRecovery();
        }
    }

    attemptRecovery() {
        console.log('[Auto-Start] Attempting recovery...');
        
        this.emit('recovery', { attempt: this.recoveryAttempts });
        
        setTimeout(() => {
            this.start({ registerStartup: false }).then(success => {
                if (success) {
                    this.recoveryAttempts = 0;
                    console.log('[Auto-Start] Recovery successful');
                } else if (this.recoveryAttempts < this.config.maxRecoveryAttempts) {
                    this.attemptRecovery();
                } else {
                    console.error('[Auto-Start] Recovery failed');
                }
            });
        }, this.config.recoveryDelay);
    }

    // ==================== EVENT HANDLING ====================

    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            for (const callback of this.eventListeners[event]) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[Auto-Start] Event handler error: ${event}`, error);
                }
            }
        }
    }

    // ==================== STATUS ====================

    getServiceStatus() {
        const status = {};
        for (const [name, info] of this.services) {
            status[name] = {
                status: info.status,
                uptime: info.startedAt ? Date.now() - info.startedAt : 0,
                restartCount: info.restartCount,
                lastError: info.lastError
            };
        }
        return status;
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            isBackground: this.isBackground,
            uptime: this.startupTime ? Date.now() - this.startupTime : 0,
            services: this.getServiceStatus(),
            backgroundTasks: this.backgroundTasks.filter(t => t.enabled).length,
            recoveryAttempts: this.recoveryAttempts,
            lastHeartbeat: this.lastHeartbeat
        };
    }

    // ==================== CONFIGURATION ====================

    loadConfig() {
        try {
            const saved = localStorage.getItem('nexus_autostart_config');
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('[Auto-Start] Config load failed:', e);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('nexus_autostart_config', JSON.stringify(this.config));
        } catch (e) {
            console.error('[Auto-Start] Config save failed:', e);
        }
    }

    setConfig(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }
}

// Export
window.AutoStartSystem = AutoStartSystem;
window.autoStart = new AutoStartSystem();
