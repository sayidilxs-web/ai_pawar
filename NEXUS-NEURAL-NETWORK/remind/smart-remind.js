/**
 * NEXUS AI - Smart Remind System
 * Intelligent Notifications, Scheduling, Reminders
 * স্মার্ট রিমাইন্ডার সিস্টেম
 */

class SmartRemindSystem {
    constructor() {
        this.reminders = [];
        this.scheduledTasks = [];
        this.notificationQueue = [];
        this.isEnabled = true;
        
        // Configuration
        this.config = {
            defaultSnoozeTime: 5 * 60 * 1000, // 5 minutes
            maxReminders: 100,
            persistentStorage: true,
            soundEnabled: true,
            vibrationEnabled: true,
            showNotifications: true,
            intelligentTiming: true
        };
        
        // Processing intervals
        this.checkInterval = null;
        this.checkDelay = 1000; // Check every second
        
        // Statistics
        this.stats = {
            totalReminders: 0,
            completedReminders: 0,
            snoozedReminders: 0,
            missedReminders: 0
        };
        
        // Event listeners
        this.listeners = {
            remind: [],
            complete: [],
            snooze: [],
            miss: []
        };
        
        this.initialize();
    }

    initialize() {
        console.log('[Smart Remind] System initialized');
        this.loadFromStorage();
        this.startChecking();
    }

    // ==================== CREATE REMINDER ====================

    createReminder(options = {}) {
        const reminder = {
            id: `remind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            
            // Content
            title: options.title || 'রিমাইন্ডার',
            message: options.message || '',
            details: options.details || '',
            
            // Timing
            time: options.time || Date.now() + 60000, // Default 1 minute
            recurring: options.recurring || null, // 'daily', 'weekly', 'monthly', null
            interval: options.interval || null, // Custom interval in ms
            
            // Notification settings
            priority: options.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
            sound: options.sound !== undefined ? options.sound : this.config.soundEnabled,
            vibration: options.vibration !== undefined ? options.vibration : this.config.vibrationEnabled,
            
            // Actions
            actions: options.actions || [], // [{id, label, callback}]
            link: options.link || null,
            
            // Meta
            category: options.category || 'general',
            tags: options.tags || [],
            
            // State
            status: 'pending', // 'pending', 'active', 'snoozed', 'completed', 'missed'
            snoozeCount: 0,
            snoozedUntil: null,
            completedAt: null,
            createdAt: Date.now(),
            triggeredAt: null
        };
        
        // Validate
        if (reminder.time <= Date.now()) {
            reminder.status = 'active';
            reminder.triggeredAt = Date.now();
        }
        
        // Add to list
        this.reminders.push(reminder);
        this.stats.totalReminders++;
        
        // Sort by time
        this.sortReminders();
        
        // Save
        this.saveToStorage();
        
        // Emit event
        this.emit('remind', reminder);
        
        console.log(`[Smart Remind] Created reminder: ${reminder.title}`);
        return reminder;
    }

    // Create smart reminder based on context
    createSmartReminder(text, context = {}) {
        // Parse natural language timing
        const parsed = this.parseNaturalLanguage(text);
        
        const reminder = {
            title: parsed.title || 'রিমাইন্ডার',
            message: parsed.message || text,
            time: parsed.time || Date.now() + 3600000, // Default 1 hour
            priority: parsed.priority || 'normal',
            ...context
        };
        
        return this.createReminder(reminder);
    }

    // Parse natural language for timing
    parseNaturalLanguage(text) {
        const result = {
            time: null,
            title: '',
            message: '',
            priority: 'normal'
        };
        
        const now = Date.now();
        const lower = text.toLowerCase();
        
        // Time patterns
        if (lower.includes('এখন') || lower.includes('now')) {
            result.time = now;
        } else if (lower.includes('৫ মিনিট') || lower.includes('5 মিনিট') || lower.includes('5 minutes')) {
            result.time = now + 5 * 60 * 1000;
        } else if (lower.includes('১০ মিনিট') || lower.includes('10 মিনিট') || lower.includes('10 minutes')) {
            result.time = now + 10 * 60 * 1000;
        } else if (lower.includes('আধ ঘন্টা') || lower.includes('৩০ মিনিট') || lower.includes('30 minutes')) {
            result.time = now + 30 * 60 * 1000;
        } else if (lower.includes('১ ঘন্টা') || lower.includes('1 hour') || lower.includes('পরে')) {
            result.time = now + 60 * 60 * 1000;
        } else if (lower.includes('আজ সন্ধ্যা') || lower.includes('evening')) {
            const evening = new Date();
            evening.setHours(18, 0, 0, 0);
            if (evening < now) evening.setDate(evening.getDate() + 1);
            result.time = evening.getTime();
        } else if (lower.includes('আজ রাত') || lower.includes('tonight')) {
            const night = new Date();
            night.setHours(21, 0, 0, 0);
            if (night < now) night.setDate(night.getDate() + 1);
            result.time = night.getTime();
        } else if (lower.includes('আগামীকাল') || lower.includes('tomorrow')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            result.time = tomorrow.getTime();
        } else if (lower.includes('সপ্তাহ') || lower.includes('week')) {
            result.time = now + 7 * 24 * 60 * 60 * 1000;
        }
        
        // Priority patterns
        if (lower.includes('জরুরি') || lower.includes('urgent') || lower.includes('important')) {
            result.priority = 'urgent';
        } else if (lower.includes('উচ্চ') || lower.includes('high')) {
            result.priority = 'high';
        } else if (lower.includes('কম') || lower.includes('low')) {
            result.priority = 'low';
        }
        
        // Extract title (everything before timing)
        const timeKeywords = ['মিনিট', 'ঘন্টা', 'সন্ধ্যা', 'রাত', 'আগামীকাল', 'সপ্তাহ', 'now', 'later', 'minute', 'hour'];
        let titleEnd = text.length;
        
        for (const keyword of timeKeywords) {
            const idx = lower.indexOf(keyword);
            if (idx !== -1 && idx < titleEnd) {
                titleEnd = idx;
            }
        }
        
        result.title = text.substring(0, titleEnd).trim() || 'রিমাইন্ডার';
        result.message = text;
        
        return result;
    }

    // ==================== MANAGE REMINDERS ====================

    // Snooze a reminder
    snooze(id, duration = null) {
        const reminder = this.reminders.find(r => r.id === id);
        
        if (!reminder) {
            console.error('[Smart Remind] Reminder not found:', id);
            return false;
        }
        
        const snoozeTime = duration || this.config.defaultSnoozeTime;
        
        reminder.status = 'snoozed';
        reminder.snoozedUntil = Date.now() + snoozeTime;
        reminder.snoozeCount++;
        
        this.stats.snoozedReminders++;
        
        this.saveToStorage();
        this.emit('snooze', { reminder, snoozedUntil: reminder.snoozedUntil });
        
        console.log(`[Smart Remind] Snoozed: ${reminder.title} for ${snoozeTime / 60000} minutes`);
        return true;
    }

    // Complete a reminder
    complete(id) {
        const reminder = this.reminders.find(r => r.id === id);
        
        if (!reminder) {
            console.error('[Smart Remind] Reminder not found:', id);
            return false;
        }
        
        reminder.status = 'completed';
        reminder.completedAt = Date.now();
        
        this.stats.completedReminders++;
        
        // Handle recurring reminders
        if (reminder.recurring || reminder.interval) {
            const nextTime = this.calculateNextTime(reminder);
            this.createReminder({
                ...reminder,
                id: undefined,
                time: nextTime,
                status: undefined,
                completedAt: undefined,
                triggeredAt: undefined
            });
        }
        
        this.saveToStorage();
        this.emit('complete', reminder);
        
        console.log(`[Smart Remind] Completed: ${reminder.title}`);
        return true;
    }

    // Delete a reminder
    delete(id) {
        const index = this.reminders.findIndex(r => r.id === id);
        
        if (index === -1) {
            return false;
        }
        
        const deleted = this.reminders.splice(index, 1)[0];
        this.saveToStorage();
        
        console.log(`[Smart Remind] Deleted: ${deleted.title}`);
        return true;
    }

    // Calculate next time for recurring reminders
    calculateNextTime(reminder) {
        const now = Date.now();
        
        if (reminder.interval) {
            return now + reminder.interval;
        }
        
        switch (reminder.recurring) {
            case 'daily':
                return now + 24 * 60 * 60 * 1000;
            case 'weekly':
                return now + 7 * 24 * 60 * 60 * 1000;
            case 'monthly':
                const next = new Date(now);
                next.setMonth(next.getMonth() + 1);
                return next.getTime();
            default:
                return null;
        }
    }

    // ==================== CHECK & TRIGGER ====================

    startChecking() {
        if (this.checkInterval) return;
        
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, this.checkDelay);
        
        console.log('[Smart Remind] Checking started');
    }

    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    checkReminders() {
        const now = Date.now();
        
        for (const reminder of this.reminders) {
            // Check pending reminders that are due
            if (reminder.status === 'pending' && reminder.time <= now) {
                this.triggerReminder(reminder);
            }
            
            // Check snoozed reminders
            if (reminder.status === 'snoozed' && reminder.snoozedUntil <= now) {
                reminder.status = 'active';
                reminder.triggeredAt = now;
                this.triggerReminder(reminder);
            }
            
            // Check missed reminders
            if (reminder.status === 'active' && !this.wasTriggeredRecently(reminder)) {
                // Reminder was active but not handled
            }
            
            // Mark overdue reminders as missed
            if (reminder.status === 'active' && 
                (now - reminder.triggeredAt) > 30 * 60 * 1000) { // 30 minutes grace period
                reminder.status = 'missed';
                this.stats.missedReminders++;
                this.emit('miss', reminder);
            }
        }
    }

    triggerReminder(reminder) {
        reminder.status = 'active';
        reminder.triggeredAt = Date.now();
        
        // Show notification
        if (this.config.showNotifications) {
            this.showNotification(reminder);
        }
        
        // Play sound
        if (reminder.sound) {
            this.playSound(reminder.priority);
        }
        
        // Vibrate
        if (reminder.vibration && navigator.vibrate) {
            navigator.vibrate(this.getVibrationPattern(reminder.priority));
        }
        
        this.emit('remind', reminder);
        
        console.log(`[Smart Remind] Triggered: ${reminder.title}`);
    }

    wasTriggeredRecently(reminder) {
        if (!reminder.triggeredAt) return false;
        return (Date.now() - reminder.triggeredAt) < 60 * 60 * 1000; // Within 1 hour
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(reminder) {
        // Use Web Notifications API
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.createBrowserNotification(reminder);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.createBrowserNotification(reminder);
                    }
                });
            }
        }
        
        // Also show in-app notification
        this.showInAppNotification(reminder);
    }

    createBrowserNotification(reminder) {
        const notification = new Notification(reminder.title, {
            body: reminder.message,
            icon: '/icons/remind-icon.png',
            badge: '/icons/badge.png',
            tag: reminder.id,
            requireInteraction: reminder.priority === 'urgent' || reminder.priority === 'high',
            vibrate: this.getVibrationPattern(reminder.priority),
            data: { reminderId: reminder.id }
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            if (reminder.link) {
                window.open(reminder.link, '_blank');
            }
            
            // Emit event
            this.emit('remind:click', reminder);
        };
        
        // Auto close after 10 seconds for normal priority
        if (reminder.priority === 'normal' || reminder.priority === 'low') {
            setTimeout(() => notification.close(), 10000);
        }
    }

    showInAppNotification(reminder) {
        // Create in-app notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `nexus-reminder nexus-reminder-${reminder.priority}`;
        notificationEl.innerHTML = `
            <div class="reminder-icon">🔔</div>
            <div class="reminder-content">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-message">${reminder.message}</div>
            </div>
            <div class="reminder-actions">
                <button class="reminder-btn complete" onclick="window.smartRemind?.complete('${reminder.id}')">✓ সম্পন্ন</button>
                <button class="reminder-btn snooze" onclick="window.smartRemind?.snooze('${reminder.id}')">⏰ স্নুজ</button>
            </div>
        `;
        
        document.body.appendChild(notificationEl);
        
        // Animate in
        setTimeout(() => notificationEl.classList.add('show'), 10);
        
        // Auto remove after notification
        setTimeout(() => {
            notificationEl.classList.remove('show');
            setTimeout(() => notificationEl.remove(), 300);
        }, reminder.priority === 'urgent' ? 60000 : 10000);
    }

    getVibrationPattern(priority) {
        switch (priority) {
            case 'urgent':
                return [200, 100, 200, 100, 200];
            case 'high':
                return [200, 100, 200];
            case 'normal':
                return [200];
            default:
                return [100];
        }
    }

    playSound(priority) {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = priority === 'urgent' ? 880 : priority === 'high' ? 660 : 440;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('[Smart Remind] Could not play sound:', e);
        }
    }

    // ==================== QUERY ====================

    getReminders(filter = {}) {
        let filtered = [...this.reminders];
        
        if (filter.status) {
            filtered = filtered.filter(r => r.status === filter.status);
        }
        if (filter.category) {
            filtered = filtered.filter(r => r.category === filter.category);
        }
        if (filter.priority) {
            filtered = filtered.filter(r => r.priority === filter.priority);
        }
        if (filter.upcoming) {
            filtered = filtered.filter(r => r.time > Date.now());
        }
        
        return filtered;
    }

    getUpcoming(limit = 10) {
        return this.reminders
            .filter(r => r.status === 'pending' || r.status === 'active')
            .sort((a, b) => a.time - b.time)
            .slice(0, limit);
    }

    // ==================== EVENT HANDLING ====================

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            for (const callback of this.listeners[event]) {
                try {
                    callback(data);
                } catch (e) {
                    console.error('[Smart Remind] Listener error:', e);
                }
            }
        }
    }

    // ==================== PERSISTENCE ====================

    saveToStorage() {
        if (!this.config.persistentStorage) return;
        
        try {
            const data = {
                reminders: this.reminders,
                stats: this.stats
            };
            
            localStorage.setItem('nexus_reminders', JSON.stringify(data));
        } catch (e) {
            console.error('[Smart Remind] Save failed:', e);
        }
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('nexus_reminders'));
            
            if (data) {
                this.reminders = data.reminders || [];
                this.stats = { ...this.stats, ...data.stats };
                
                console.log(`[Smart Remind] Loaded ${this.reminders.length} reminders`);
            }
        } catch (e) {
            console.error('[Smart Remind] Load failed:', e);
        }
    }

    // ==================== UTILITIES ====================

    sortReminders() {
        this.reminders.sort((a, b) => {
            // Priority first
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (pDiff !== 0) return pDiff;
            
            // Then by time
            return a.time - b.time;
        });
    }

    getStats() {
        return {
            ...this.stats,
            pendingCount: this.reminders.filter(r => r.status === 'pending').length,
            activeCount: this.reminders.filter(r => r.status === 'active').length,
            totalCount: this.reminders.length
        };
    }

    clearCompleted() {
        this.reminders = this.reminders.filter(r => r.status !== 'completed' && r.status !== 'missed');
        this.saveToStorage();
    }

    reset() {
        this.reminders = [];
        this.stats = {
            totalReminders: 0,
            completedReminders: 0,
            snoozedReminders: 0,
            missedReminders: 0
        };
        localStorage.removeItem('nexus_reminders');
        console.log('[Smart Remind] Reset complete');
    }
}

// Export
window.SmartRemindSystem = SmartRemindSystem;
window.smartRemind = new SmartRemindSystem();
