/**
 * NEXUS Scheduler Module
 * Cron-job style task scheduling
 */

class TaskScheduler {
    constructor() {
        this.tasks = new Map();
        this.taskId = 0;
        this.intervalId = null;
        this.running = false;
        this.listeners = new Map();
    }

    start() {
        if (this.running) return;
        
        this.running = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
        console.log('[Scheduler] Started');
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.running = false;
        console.log('[Scheduler] Stopped');
    }

    tick() {
        const now = Date.now();
        
        for (const [id, task] of this.tasks) {
            if (this.shouldRun(task, now)) {
                this.executeTask(id);
            }
        }
    }

    shouldRun(task, now) {
        if (task.disabled) return false;
        if (task.type === 'interval') {
            return now - task.lastRun >= task.interval;
        }
        if (task.type === 'timeout') {
            return now >= task.scheduledTime && !task.executed;
        }
        if (task.type === 'cron') {
            return this.matchCron(task.cronExpression, new Date(now));
        }
        return false;
    }

    executeTask(id) {
        const task = this.tasks.get(id);
        if (!task) return;

        task.lastRun = Date.now();
        task.runCount++;

        if (task.type === 'timeout') {
            task.executed = true;
        }

        try {
            const result = task.callback(task.data);
            
            this.emit('taskStart', { id, task: task.name });
            
            Promise.resolve(result)
                .then(value => {
                    this.emit('taskComplete', { id, task: task.name, result: value });
                })
                .catch(error => {
                    this.emit('taskError', { id, task: task.name, error });
                });
        } catch (error) {
            this.emit('taskError', { id, task: task.name, error });
        }

        if (task.maxRuns && task.runCount >= task.maxRuns) {
            this.remove(id);
        }
    }

    addInterval(callback, intervalMs, name = 'interval', data = {}) {
        const id = ++this.taskId;
        this.tasks.set(id, {
            id,
            name,
            type: 'interval',
            callback,
            interval: intervalMs,
            lastRun: Date.now(),
            runCount: 0,
            data,
            disabled: false
        });
        
        this.emit('taskAdded', { id, name, type: 'interval' });
        return id;
    }

    addTimeout(callback, delayMs, name = 'timeout', data = {}) {
        const id = ++this.taskId;
        this.tasks.set(id, {
            id,
            name,
            type: 'timeout',
            callback,
            scheduledTime: Date.now() + delayMs,
            runCount: 0,
            data,
            disabled: false,
            executed: false
        });
        
        this.emit('taskAdded', { id, name, type: 'timeout' });
        return id;
    }

    addCron(callback, cronExpression, name = 'cron', data = {}) {
        const id = ++this.taskId;
        this.tasks.set(id, {
            id,
            name,
            type: 'cron',
            callback,
            cronExpression,
            lastRun: Date.now(),
            runCount: 0,
            data,
            disabled: false
        });
        
        this.emit('taskAdded', { id, name, type: 'cron' });
        return id;
    }

    addDaily(hour, minute, callback, name = 'daily', data = {}) {
        const cron = `${minute} ${hour} * * *`;
        return this.addCron(callback, cron, name, data);
    }

    addWeekly(days, hour, minute, callback, name = 'weekly', data = {}) {
        const dayList = Array.isArray(days) ? days.join(',') : days;
        const cron = `${minute} ${hour} * * ${dayList}`;
        return this.addCron(callback, cron, name, data);
    }

    remove(id) {
        const task = this.tasks.get(id);
        if (task) {
            this.tasks.delete(id);
            this.emit('taskRemoved', { id, name: task.name });
            return true;
        }
        return false;
    }

    disable(id) {
        const task = this.tasks.get(id);
        if (task) {
            task.disabled = true;
            this.emit('taskDisabled', { id, name: task.name });
            return true;
        }
        return false;
    }

    enable(id) {
        const task = this.tasks.get(id);
        if (task) {
            task.disabled = false;
            this.emit('taskEnabled', { id, name: task.name });
            return true;
        }
        return false;
    }

    matchCron(cronExpression, date) {
        const parts = cronExpression.split(' ');
        if (parts.length !== 5) return false;

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        
        return (
            this.matchCronPart(minute, date.getMinutes()) &&
            this.matchCronPart(hour, date.getHours()) &&
            this.matchCronPart(dayOfMonth, date.getDate()) &&
            this.matchCronPart(month, date.getMonth() + 1) &&
            this.matchCronPart(dayOfWeek, date.getDay())
        );
    }

    matchCronPart(pattern, value) {
        if (pattern === '*') return true;
        
        if (pattern.includes(',')) {
            return pattern.split(',').some(p => this.matchCronPart(p.trim(), value));
        }
        
        if (pattern.includes('-')) {
            const [start, end] = pattern.split('-').map(Number);
            return value >= start && value <= end;
        }
        
        if (pattern.includes('/')) {
            const [, step] = pattern.split('/');
            return value % parseInt(step) === 0;
        }
        
        return parseInt(pattern) === value;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[Scheduler] Event handler error:`, error);
                }
            }
        }
    }

    getTask(id) {
        return this.tasks.get(id);
    }

    getAllTasks() {
        return Array.from(this.tasks.values()).map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            runCount: t.runCount,
            disabled: t.disabled,
            lastRun: t.lastRun,
            nextRun: this.getNextRun(t)
        }));
    }

    getNextRun(task) {
        if (task.disabled) return null;
        
        if (task.type === 'interval') {
            return task.lastRun + task.interval;
        }
        
        if (task.type === 'cron') {
            return this.getNextCronRun(task.cronExpression);
        }
        
        return null;
    }

    getNextCronRun(cronExpression) {
        const date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);
        
        for (let i = 0; i < 525600; i++) {
            date.setTime(date.getTime() + 60000);
            if (this.matchCron(cronExpression, date)) {
                return date.getTime();
            }
        }
        
        return null;
    }

    clear() {
        const count = this.tasks.size;
        this.tasks.clear();
        this.emit('allCleared', { count });
        return count;
    }

    save() {
        const data = Array.from(this.tasks.entries()).map(([id, task]) => ({
            id,
            name: task.name,
            type: task.type,
            interval: task.interval,
            cronExpression: task.cronExpression,
            scheduledTime: task.scheduledTime,
            data: task.data,
            disabled: task.disabled
        }));
        
        return JSON.stringify(data);
    }

    load(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.clear();
            
            for (const taskData of data) {
                const { id, name, type, interval, cronExpression, scheduledTime, data, disabled } = taskData;
                
                let newId;
                if (type === 'interval') {
                    newId = this.addInterval(() => {}, interval, name, data);
                } else if (type === 'cron') {
                    newId = this.addCron(() => {}, cronExpression, name, data);
                } else if (type === 'timeout') {
                    newId = this.addTimeout(() => {}, scheduledTime - Date.now(), name, data);
                }
                
                if (newId && disabled) {
                    this.disable(newId);
                }
            }
            
            return { success: true, count: data.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export { TaskScheduler };