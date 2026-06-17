/**
 * 🔔 NEXUS AI - Notification System (বিজ্ঞপ্তি এবং সতর্কতা ব্যবস্থাপনা)
 * 
 * এই মডিউল:
 * - ডেস্কটপ নোটিফিকেশন পাঠায়
 * - কাস্টম রিমাইন্ডার সেট করে
 * - ভয়েস অ্যালার্ট ট্রিগার করে
 * - মাল্টি-চ্যানেল নোটিফিকেশন সাপোর্ট করে
 * - নোটিফিকেশন হিস্টরি ট্র্যাক করে
 * - অগ্রাধিকার-ভিত্তিক নোটিফিকেশন ম্যানেজমেন্ট
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { Notification } = require('electron');

class NotificationSystem extends EventEmitter {
  constructor(databaseManager, voiceSynthesis) {
    super();
    this.db = databaseManager;
    this.voiceSynthesis = voiceSynthesis;
    
    // নোটিফিকেশন স্টোরেজ
    this.notificationQueue = [];
    this.activeReminders = new Map();
    this.notificationHistory = [];
    this.userPreferences = {};
    
    // কনফিগারেশন
    this.config = {
      maxQueueSize: 100,
      defaultDuration: 5000, // 5 সেকেন্ড
      enableSound: true,
      enableVoice: true,
      enableVisual: true,
      soundPath: path.join(__dirname, '../assets/sounds'),
      logPath: path.join(process.env.APPDATA || process.env.HOME, 'NEXUS_AI', 'notifications.log')
    };

    this.initializePriorities();
    this.ensureNotificationDirectories();
  }

  /**
   * অগ্রাধিকার লেভেল ইনিশিয়ালাইজ করুন
   */
  initializePriorities() {
    this.priorities = {
      CRITICAL: { level: 5, color: '#ff0000', icon: '⚠️', timeout: 0 },
      HIGH: { level: 4, color: '#ff6600', icon: '🔴', timeout: 10000 },
      NORMAL: { level: 3, color: '#0066ff', icon: 'ℹ️', timeout: 5000 },
      LOW: { level: 2, color: '#00cc00', icon: '✓', timeout: 3000 },
      INFO: { level: 1, color: '#9933ff', icon: '💡', timeout: 2000 }
    };
  }

  /**
   * নোটিফিকেশন ডিরেক্টরি নিশ্���িত করুন
   */
  ensureNotificationDirectories() {
    const dirs = [
      this.config.soundPath,
      path.dirname(this.config.logPath)
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * 📢 নোটিফিকেশন পাঠান
   */
  async sendNotification(userId, notificationData) {
    const {
      title = 'NEXUS AI',
      message = '',
      priority = 'NORMAL',
      type = 'info',
      actions = [],
      data = {},
      playSound = true,
      playVoice = false,
      icon = null,
      timeout = null
    } = notificationData;

    try {
      // নোটিফিকেশন অবজেক্ট তৈরি করুন
      const notification = {
        id: this.generateNotificationId(),
        userId,
        title,
        message,
        priority,
        type,
        actions,
        data,
        timestamp: new Date(),
        read: false,
        responded: false,
        icon: icon || this.priorities[priority]?.icon,
        timeout: timeout || this.priorities[priority]?.timeout,
        color: this.priorities[priority]?.color
      };

      // কিউতে যোগ করুন
      this.notificationQueue.push(notification);
      if (this.notificationQueue.length > this.config.maxQueueSize) {
        this.notificationQueue.shift();
      }

      // হিস্টরিতে লগ করুন
      this.notificationHistory.push(notification);

      // ব্যবহারকারী পছন্দ চেক করুন
      const userPrefs = await this.getUserPreferences(userId);

      // ভিজ্যুয়াল নোটিফিকেশন দেখান
      if (userPrefs.enableVisual !== false && this.config.enableVisual) {
        await this.showVisualNotification(notification);
      }

      // সাউন্ড প্লে করুন
      if (playSound && userPrefs.enableSound !== false && this.config.enableSound) {
        await this.playNotificationSound(type, priority);
      }

      // ভয়েস নোটিফিকেশন পাঠান
      if (playVoice && userPrefs.enableVoice !== false && this.config.enableVoice) {
        await this.playVoiceNotification(message);
      }

      // ডাটাবেসে সংরক্ষণ করুন
      await this.saveNotificationToDb(userId, notification);

      // ইভেন্ট ইমিট করুন
      this.emit('notification_sent', { notification, userId });

      console.log(`[Notification] Sent to ${userId}: ${title}`);

      return notification;

    } catch (error) {
      console.error('[NotificationSystem Error]', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ডেস্কটপ নোটিফিকেশন দেখান
   */
  async showVisualNotification(notification) {
    try {
      const electronNotification = new Notification({
        title: notification.title,
        body: notification.message,
        icon: notification.icon || 'assets/nexus-icon.png',
        timeoutType: 'default',
        urgency: this.getUrgencyLevel(notification.priority),
        tag: notification.id,
        requireInteraction: notification.priority === 'CRITICAL',
        silent: true // সাউন্ড আমরা আলাদাভাবে পরিচালনা করি
      });

      // ক্লিক ইভেন্ট
      electronNotification.on('click', () => {
        this.emit('notification_clicked', notification);
        this.markNotificationAsRead(notification.id);
      });

      // বন্ধ ইভেন্ট
      electronNotification.on('close', () => {
        this.emit('notification_closed', notification);
      });

      // দেখান
      electronNotification.show();

      // স্বয়ংক্রিয় বন্ধ করার সময় সেট করুন
      if (notification.timeout > 0) {
        setTimeout(() => {
          // নোটিফিকেশন স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যায়
        }, notification.timeout);
      }

    } catch (error) {
      console.warn('[Visual Notification Error]', error);
    }
  }

  /**
   * সাউন্ড প্লে করুন
   */
  async playNotificationSound(type, priority) {
    try {
      const soundFile = this.getSoundFileName(type, priority);
      const soundPath = path.join(this.config.soundPath, soundFile);

      if (fs.existsSync(soundPath)) {
        // Audio API ব্যবহার করে সাউন্ড প্লে করুন (ব্রাউজার এনভায়রনমেন্ট)
        const audio = new Audio(soundPath);
        audio.play().catch(err => console.warn('Sound play error:', err));
      }
    } catch (error) {
      console.warn('[Sound Notification Error]', error);
    }
  }

  /**
   * ভয়েস নোটিফিকেশন প্লে করুন
   */
  async playVoiceNotification(message) {
    try {
      if (this.voiceSynthesis && this.voiceSynthesis.speak) {
        await this.voiceSynthesis.speak(message, {
          rate: 0.9,
          pitch: 1.0,
          volume: 0.8
        });
      }
    } catch (error) {
      console.warn('[Voice Notification Error]', error);
    }
  }

  /**
   * সাউন্ড ফাইলের নাম পান
   */
  getSoundFileName(type, priority) {
    const soundMap = {
      'success': 'success.mp3',
      'error': 'error.mp3',
      'warning': 'warning.mp3',
      'info': 'info.mp3',
      'reminder': 'reminder.mp3',
      'alert': 'alert.mp3',
      'message': 'message.mp3',
      'task_complete': 'task_complete.mp3'
    };

    return soundMap[type] || 'info.mp3';
  }

  /**
   * জরুরীতা লেভেল পান
   */
  getUrgencyLevel(priority) {
    const urgencyMap = {
      CRITICAL: 'critical',
      HIGH: 'critical',
      NORMAL: 'normal',
      LOW: 'low',
      INFO: 'low'
    };

    return urgencyMap[priority] || 'normal';
  }

  /**
   * ⏰ রিমাইন্ডার সেট করুন
   */
  async setReminder(userId, reminderData) {
    const {
      title = 'রিমাইন্ডার',
      message = '',
      time = null,
      duration = null,
      repeat = 'once', // once, daily, weekly, monthly
      recurrence = null,
      notificationWhen = 'at_time', // at_time, before_time, after_time
      minutesOffset = 0 // beforeTime এর জন্য কত মিনিট আগে
    } = reminderData;

    try {
      const reminder = {
        id: this.generateReminderId(),
        userId,
        title,
        message,
        time: new Date(time),
        duration,
        repeat,
        recurrence,
        notificationWhen,
        minutesOffset,
        createdAt: new Date(),
        enabled: true,
        nextTrigger: this.calculateNextTrigger(time, repeat)
      };

      // অ্যাক্টিভ রিমাইন্ডার ম্যাপে যোগ করুন
      this.activeReminders.set(reminder.id, reminder);

      // টাইমার সেট করুন
      this.scheduleReminder(reminder);

      // ডাটাবেসে সংরক্ষণ করুন
      await this.saveReminderToDb(userId, reminder);

      console.log(`[Reminder] Set: ${title} at ${time}`);

      return { success: true, reminderId: reminder.id, reminder };

    } catch (error) {
      console.error('[Reminder Error]', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * রিমাইন্ডার সময়সূচী করুন
   */
  scheduleReminder(reminder) {
    const now = new Date();
    const reminderTime = new Date(reminder.time);
    let delayMs = reminderTime.getTime() - now.getTime();

    // minutesOffset প্রয়োগ করুন
    if (reminder.notificationWhen === 'before_time') {
      delayMs -= reminder.minutesOffset * 60 * 1000;
    } else if (reminder.notificationWhen === 'after_time') {
      delayMs += reminder.minutesOffset * 60 * 1000;
    }

    // যদি সময় অতীত হয় এবং repeating reminder না হয়, তাহলে সেটিংস সামঞ্জস্য করুন
    if (delayMs < 0 && reminder.repeat === 'once') {
      console.warn(`[Reminder] Time is in the past: ${reminder.title}`);
      return;
    }

    if (delayMs < 0 && reminder.repeat !== 'once') {
      // পরবর্তী ঘটনার সময় গণনা করুন
      delayMs = this.getNextRecurrenceDelay(reminder);
    }

    // টাইমার সেট করুন
    const timerId = setTimeout(async () => {
      await this.triggerReminder(reminder);

      // রিকারিং রিমাইন্ডার পুনরায় সময়সূচী করুন
      if (reminder.repeat !== 'once') {
        reminder.nextTrigger = this.calculateNextTrigger(reminder.time, reminder.repeat);
        this.scheduleReminder(reminder);
      } else {
        // এককালীন রিমাইন্ডার সরান
        this.activeReminders.delete(reminder.id);
      }
    }, delayMs);

    reminder.timerId = timerId;
  }

  /**
   * রিমাইন্ডার ট্রিগার করুন
   */
  async triggerReminder(reminder) {
    await this.sendNotification(reminder.userId, {
      title: reminder.title,
      message: reminder.message,
      priority: 'HIGH',
      type: 'reminder',
      playSound: true,
      playVoice: true,
      data: { reminderId: reminder.id }
    });

    this.emit('reminder_triggered', reminder);
  }

  /**
   * পরবর্তী পুনরাবৃত্তি বিলম্ব পান
   */
  getNextRecurrenceDelay(reminder) {
    const now = new Date();
    let nextTime = new Date(reminder.time);

    switch (reminder.repeat) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
    }

    return nextTime.getTime() - now.getTime();
  }

  /**
   * পরবর্তী ট্রিগার সময় গণনা করুন
   */
  calculateNextTrigger(time, repeat) {
    const nextTrigger = new Date(time);

    switch (repeat) {
      case 'daily':
        nextTrigger.setDate(nextTrigger.getDate() + 1);
        break;
      case 'weekly':
        nextTrigger.setDate(nextTrigger.getDate() + 7);
        break;
      case 'monthly':
        nextTrigger.setMonth(nextTrigger.getMonth() + 1);
        break;
    }

    return nextTrigger;
  }

  /**
   * রিমাইন্ডার সম্পাদনা করুন
   */
  async editReminder(reminderId, updates) {
    const reminder = this.activeReminders.get(reminderId);
    
    if (!reminder) {
      return { success: false, error: 'রিমাইন্ডার খুঁজে পাওয়া যায়নি' };
    }

    // পুরনো টাইমার সাফ করুন
    if (reminder.timerId) {
      clearTimeout(reminder.timerId);
    }

    // আপডেট প্রয়োগ করুন
    Object.assign(reminder, updates);

    // নতুন টাইমার সেট করুন
    this.scheduleReminder(reminder);

    // ডাটাবেসে আপডেট করুন
    await this.updateReminderInDb(reminderId, updates);

    return { success: true, reminder };
  }

  /**
   * রিমাইন্ডার মুছুন
   */
  async deleteReminder(reminderId) {
    const reminder = this.activeReminders.get(reminderId);

    if (reminder) {
      if (reminder.timerId) {
        clearTimeout(reminder.timerId);
      }
      this.activeReminders.delete(reminderId);
    }

    // ডাটাবেস থেকে মুছুন
    await this.deleteReminderFromDb(reminderId);

    return { success: true };
  }

  /**
   * সব রিমাইন্ডার পান
   */
  async getAllReminders(userId) {
    const reminders = Array.from(this.activeReminders.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(a.nextTrigger) - new Date(b.nextTrigger));

    return reminders;
  }

  /**
   * 🔔 নোটিফিকেশন পড়া হিসাবে চিহ্নিত করুন
   */
  markNotificationAsRead(notificationId) {
    const notification = this.notificationQueue.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }

    const historyNotif = this.notificationHistory.find(n => n.id === notificationId);
    if (historyNotif) {
      historyNotif.read = true;
    }
  }

  /**
   * নোটিফিকেশনে সাড়া দিন
   */
  async respondToNotification(notificationId, responseData) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);

    if (notification) {
      notification.responded = true;
      notification.response = responseData;

      this.emit('notification_responded', { notification, response: responseData });

      return { success: true };
    }

    return { success: false, error: 'নোটিফিকেশন খুঁজে পাওয়া যায়নি' };
  }

  /**
   * ব্যবহারকারী পছন্দ পান
   */
  async getUserPreferences(userId) {
    if (!this.userPreferences[userId]) {
      this.userPreferences[userId] = {
        enableSound: true,
        enableVoice: true,
        enableVisual: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        blockedTypes: [],
        priorityThreshold: 'LOW'
      };
    }

    return this.userPreferences[userId];
  }

  /**
   * ব্যবহারকারী পছন্দ আপডেট করুন
   */
  async updateUserPreferences(userId, preferences) {
    this.userPreferences[userId] = {
      ...this.userPreferences[userId],
      ...preferences
    };

    return { success: true, preferences: this.userPreferences[userId] };
  }

  /**
   * কোয়েট আওয়ার চেক করুন
   */
  isInQuietHours(userId) {
    const prefs = this.userPreferences[userId];
    if (!prefs) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const startTime = prefs.quietHoursStart;
    const endTime = prefs.quietHoursEnd;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * পড়া নোটিফিকেশন পান
   */
  getUnreadNotifications(userId) {
    return this.notificationQueue.filter(n => n.userId === userId && !n.read);
  }

  /**
   * সব নোটিফিকেশন পান
   */
  getAllNotifications(userId, limit = 50) {
    return this.notificationHistory
      .filter(n => n.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * নোটিফিকেশন ফিল্টার করুন
   */
  filterNotifications(userId, filters) {
    let results = this.notificationHistory.filter(n => n.userId === userId);

    if (filters.type) {
      results = results.filter(n => n.type === filters.type);
    }

    if (filters.priority) {
      results = results.filter(n => n.priority === filters.priority);
    }

    if (filters.read !== undefined) {
      results = results.filter(n => n.read === filters.read);
    }

    if (filters.startDate && filters.endDate) {
      results = results.filter(n => 
        n.timestamp >= new Date(filters.startDate) &&
        n.timestamp <= new Date(filters.endDate)
      );
    }

    return results;
  }

  /**
   * নোটিফিকেশন ক্লিয়ার করুন
   */
  clearNotifications(userId = null) {
    if (userId) {
      this.notificationQueue = this.notificationQueue.filter(n => n.userId !== userId);
      this.notificationHistory = this.notificationHistory.filter(n => n.userId !== userId);
    } else {
      this.notificationQueue = [];
      this.notificationHistory = [];
    }

    return { success: true };
  }

  /**
   * 📊 নোটিফিকেশন স্ট্যাটিস্টিক্স পান
   */
  getStatistics(userId = null) {
    let notifications = this.notificationHistory;
    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }

    const byType = {};
    const byPriority = {};

    for (const notif of notifications) {
      byType[notif.type] = (byType[notif.type] || 0) + 1;
      byPriority[notif.priority] = (byPriority[notif.priority] || 0) + 1;
    }

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType,
      byPriority,
      responded: notifications.filter(n => n.responded).length
    };
  }

  /**
   * সাহায্যকারী ফাংশন - আইডি জেনারেট করুন
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateReminderId() {
    return `remind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ডাটাবেস ফাংশন
   */
  async saveNotificationToDb(userId, notification) {
    if (this.db) {
      await this.db.saveTaskExecution(userId, {
        name: 'notification_sent',
        type: 'notification',
        status: 'success',
        inputData: { notification },
        outputData: {},
        executionTime: 0
      });
    }
  }

  async saveReminderToDb(userId, reminder) {
    if (this.db) {
      await this.db.learnPattern(userId, 'reminder', reminder.title, reminder.message, {
        reminderId: reminder.id,
        repeat: reminder.repeat,
        time: reminder.time
      });
    }
  }

  async updateReminderInDb(reminderId, updates) {
    // রিমাইন্ডার আপডেট লজিক
  }

  async deleteReminderFromDb(reminderId) {
    // রিমাইন্ডার ডিলিট লজিক
  }

  /**
   * লগ নোটিফিকেশন
   */
  async logNotification(notification) {
    try {
      const logEntry = `[${notification.timestamp.toISOString()}] ${notification.priority} - ${notification.title}: ${notification.message}\n`;
      fs.appendFileSync(this.config.logPath, logEntry);
    } catch (error) {
      console.warn('[Log Error]', error);
    }
  }

  /**
   * সিস্টেম বন্ধ করুন
   */
  async shutdown() {
    // সমস্ত সক্রিয় রিমাইন্ডার টাইমার সাফ করুন
    for (const [, reminder] of this.activeReminders) {
      if (reminder.timerId) {
        clearTimeout(reminder.timerId);
      }
    }

    console.log('[NotificationSystem] Shutdown complete');
  }
}

module.exports = NotificationSystem;
