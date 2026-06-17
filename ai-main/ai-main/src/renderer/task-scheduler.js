/**
 * ⏰ NEXUS AI - Task Scheduler
 * টাস্ক শিডিউলার - সময় নির্ভর টাস্ক পরিকল্পনা
 */

class TaskScheduler {
    constructor() {
        this.tasks = new Map();
        this.runningTasks = new Map();
        this.schedules = [];
        this.isRunning = false;
        
        // Load saved tasks
        this.loadTasks();
    }

    /**
     * Initialize scheduler
     */
    init() {
        console.log('[Scheduler] Initializing task scheduler...');
        
        // Start the scheduler loop
        this.start();
        
        return true;
    }

    /**
     * Start scheduler
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('[Scheduler] Started');
        
        // Run every second
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    /**
     * Stop scheduler
     */
    stop() {
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('[Scheduler] Stopped');
    }

    /**
     * Scheduler tick
     */
    tick() {
        const now = new Date();
        const currentTime = now.getTime();
        
        this.schedules.forEach(schedule => {
            if (!schedule.enabled) return;
            
            const nextRun = this.getNextRunTime(schedule);
            if (nextRun && nextRun.getTime() <= currentTime) {
                this.executeTask(schedule);
                schedule.lastRun = now.toISOString();
                schedule.runCount = (schedule.runCount || 0) + 1;
                
                // Update next run
                if (schedule.type === 'once') {
                    schedule.enabled = false;
                }
            }
        });
        
        // Save updated schedules
        this.saveTasks();
    }

    /**
     * Get next run time for a schedule
     */
    getNextRunTime(schedule) {
        const now = new Date();
        
        switch (schedule.type) {
            case 'once':
                return schedule.runAt ? new Date(schedule.runAt) : null;
                
            case 'interval':
                if (!schedule.lastRun) {
                    return new Date();
                }
                return new Date(new Date(schedule.lastRun).getTime() + schedule.interval);
                
            case 'daily':
                const [hours, minutes] = (schedule.time || '09:00').split(':');
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                // Check if today's time has passed
                const todayTime = new Date(now);
                todayTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                return todayTime > now ? todayTime : tomorrow;
                
            case 'weekly':
                const [wh, wm] = (schedule.time || '09:00').split(':');
                const nextWeek = new Date(now);
                const targetDay = schedule.daysOfWeek?.[0] || 1; // Monday default
                
                const currentDay = now.getDay();
                let daysUntilTarget = targetDay - currentDay;
                if (daysUntilTarget <= 0) daysUntilTarget += 7;
                
                nextWeek.setDate(now.getDate() + daysUntilTarget);
                nextWeek.setHours(parseInt(wh), parseInt(wm), 0, 0);
                
                return nextWeek;
                
            case 'cron':
                // Simple cron-like support
                return this.getCronNextRun(schedule.cronExpression);
                
            default:
                return null;
        }
    }

    /**
     * Execute scheduled task
     */
    async executeTask(schedule) {
        console.log(`[Scheduler] Executing: ${schedule.name}`);
        
        try {
            const taskId = `task_${Date.now()}`;
            this.runningTasks.set(taskId, {
                id: taskId,
                name: schedule.name,
                startTime: new Date(),
                status: 'running'
            });
            
            // Execute based on task type
            let result;
            
            switch (schedule.action.type) {
                case 'command':
                    result = await this.executeCommand(schedule.action.command);
                    break;
                    
                case 'voice':
                    if (window.App) {
                        await window.App.speak(schedule.action.text);
                    }
                    result = { success: true };
                    break;
                    
                case 'notification':
                    if (window.App) {
                        window.App.showNotification(schedule.action.message);
                    }
                    result = { success: true };
                    break;
                    
                case 'automation':
                    if (window.nexusAutomation) {
                        result = await window.nexusAutomation.parseAndExecute(schedule.action.command);
                    }
                    break;
                    
                case 'phone':
                    if (window.phoneConnection) {
                        result = await window.phoneConnection.sendNotification(
                            schedule.action.title,
                            schedule.action.message
                        );
                    }
                    break;
                    
                default:
                    result = { success: false, error: 'Unknown action type' };
            }
            
            // Update task status
            this.runningTasks.set(taskId, {
                ...this.runningTasks.get(taskId),
                status: 'completed',
                endTime: new Date(),
                result
            });
            
            // Log execution
            this.logExecution(schedule, result);
            
            return result;
            
        } catch (error) {
            console.error('[Scheduler] Task error:', error);
            
            this.runningTasks.set(`task_${Date.now()}`, {
                status: 'failed',
                error: error.message
            });
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Execute command
     */
    async executeCommand(command) {
        try {
            // Parse and execute command
            if (window.nexusAutomation) {
                return await window.nexusAutomation.parseAndExecute(command);
            }
            
            return { success: false, error: 'Automation not available' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Schedule a new task
     */
    scheduleTask(config) {
        const schedule = {
            id: `schedule_${Date.now()}`,
            name: config.name,
            type: config.type || 'once',
            
            // Time settings
            runAt: config.runAt,
            time: config.time,
            interval: config.interval,
            daysOfWeek: config.daysOfWeek,
            cronExpression: config.cronExpression,
            
            // Action
            action: config.action,
            
            // Status
            enabled: true,
            lastRun: null,
            runCount: 0,
            createdAt: new Date().toISOString()
        };
        
        this.schedules.push(schedule);
        this.saveTasks();
        
        console.log(`[Scheduler] Scheduled: ${schedule.name}`);
        return schedule;
    }

    /**
     * Create daily task
     */
    scheduleDaily(name, time, action) {
        return this.scheduleTask({
            name,
            type: 'daily',
            time,
            action
        });
    }

    /**
     * Create interval task
     */
    scheduleInterval(name, intervalMs, action) {
        return this.scheduleTask({
            name,
            type: 'interval',
            interval: intervalMs,
            action
        });
    }

    /**
     * Create one-time task
     */
    scheduleOnce(name, runAt, action) {
        return this.scheduleTask({
            name,
            type: 'once',
            runAt,
            action
        });
    }

    /**
     * Create weekly task
     */
    scheduleWeekly(name, time, daysOfWeek, action) {
        return this.scheduleTask({
            name,
            type: 'weekly',
            time,
            daysOfWeek,
            action
        });
    }

    /**
     * Cancel scheduled task
     */
    cancelTask(scheduleId) {
        const index = this.schedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            this.schedules.splice(index, 1);
            this.saveTasks();
            console.log(`[Scheduler] Cancelled: ${scheduleId}`);
            return true;
        }
        return false;
    }

    /**
     * Enable/disable task
     */
    setTaskEnabled(scheduleId, enabled) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.enabled = enabled;
            this.saveTasks();
            return true;
        }
        return false;
    }

    /**
     * Get all scheduled tasks
     */
    getTasks() {
        return this.schedules.map(s => ({
            ...s,
            nextRun: this.getNextRunTime(s)
        }));
    }

    /**
     * Get running tasks
     */
    getRunningTasks() {
        return Array.from(this.runningTasks.values());
    }

    /**
     * Log task execution
     */
    logExecution(schedule, result) {
        const logs = JSON.parse(localStorage.getItem('nexusSchedulerLogs') || '[]');
        
        logs.unshift({
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            executedAt: new Date().toISOString(),
            result,
            success: result?.success
        });
        
        // Keep only last 100 logs
        while (logs.length > 100) logs.pop();
        
        localStorage.setItem('nexusSchedulerLogs', JSON.stringify(logs));
    }

    /**
     * Get execution logs
     */
    getLogs(limit = 20) {
        const logs = JSON.parse(localStorage.getItem('nexusSchedulerLogs') || '[]');
        return logs.slice(0, limit);
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        localStorage.setItem('nexusScheduler', JSON.stringify(this.schedules));
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        const saved = localStorage.getItem('nexusScheduler');
        if (saved) {
            try {
                this.schedules = JSON.parse(saved);
                console.log(`[Scheduler] Loaded ${this.schedules.length} tasks`);
            } catch (e) {
                console.error('[Scheduler] Load error:', e);
            }
        }
    }

    /**
     * Clear all tasks
     */
    clearAllTasks() {
        this.schedules = [];
        this.saveTasks();
        console.log('[Scheduler] All tasks cleared');
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
        this.runningTasks.clear();
        console.log('[Scheduler] Destroyed');
    }
}

// Export
window.TaskScheduler = TaskScheduler;
window.taskScheduler = new TaskScheduler();

console.log('[Scheduler] Task scheduler initialized');