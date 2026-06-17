/**
 * NEXUS AI - Preload Script
 * Secure IPC Bridge between Main and Renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('nexusAI', {
    // ==================== Screen Capture ====================
    getSources: () => ipcRenderer.invoke('get-sources'),
    takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
    captureScreen: (sourceId) => ipcRenderer.invoke('capture-screen', sourceId),
    getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
    
    // ==================== Mouse Control ====================
    mouseMove: (x, y) => ipcRenderer.invoke('mouse-move', x, y),
    mouseClick: (button) => ipcRenderer.invoke('mouse-click', button || 'left'),
    mouseDoubleClick: () => ipcRenderer.invoke('mouse-double-click'),
    mouseScroll: (amount) => ipcRenderer.invoke('mouse-scroll', amount),
    
    // ==================== Keyboard Control ====================
    keyType: (text) => ipcRenderer.invoke('key-type', text),
    keyPress: (key) => ipcRenderer.invoke('key-press', key),
    keyCombination: (keys) => ipcRenderer.invoke('key-combination', keys),
    
    // ==================== Window Controls ====================
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
    
    // ==================== App Info ====================
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    
    // ==================== File Operations ====================
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
    listDir: (dirPath) => ipcRenderer.invoke('list-dir', dirPath),
    createDir: (dirPath) => ipcRenderer.invoke('create-dir', dirPath),
    
    // ==================== Phone Connection (ADB) ====================
    phone: {
        scanDevices: () => ipcRenderer.invoke('phone-scan-devices'),
        connectUSB: () => ipcRenderer.invoke('phone-connect-usb'),
        connectWiFi: (ip, port) => ipcRenderer.invoke('phone-connect-wifi', ip, port),
        disconnect: () => ipcRenderer.invoke('phone-disconnect'),
        getDeviceInfo: () => ipcRenderer.invoke('phone-get-device-info'),
        installAPK: (path) => ipcRenderer.invoke('phone-install-apk', path),
        takeScreen: () => ipcRenderer.invoke('phone-take-screenshot'),
        openApp: (pkg) => ipcRenderer.invoke('phone-open-app', pkg),
        sendText: (text) => ipcRenderer.invoke('phone-send-text', text),
        tap: (x, y) => ipcRenderer.invoke('phone-tap', x, y),
        swipe: (x1, y1, x2, y2) => ipcRenderer.invoke('phone-swipe', x1, y1, x2, y2),
        execCommand: (cmd) => ipcRenderer.invoke('phone-exec-command', cmd),
        getInstalledApps: () => ipcRenderer.invoke('phone-get-apps'),
        getBattery: () => ipcRenderer.invoke('phone-get-battery'),
        pullFile: (remote, local) => ipcRenderer.invoke('phone-pull-file', remote, local),
        pushFile: (local, remote) => ipcRenderer.invoke('phone-push-file', local, remote)
    },
    
    // ==================== Database Operations ====================
    database: {
        query: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
        run: (sql, params) => ipcRenderer.invoke('db-run', sql, params),
        getChatHistory: (limit) => ipcRenderer.invoke('db-get-chat-history', limit),
        saveChat: (msg, response) => ipcRenderer.invoke('db-save-chat', msg, response),
        getLearningData: () => ipcRenderer.invoke('db-get-learning-data'),
        saveLearningData: (data) => ipcRenderer.invoke('db-save-learning-data', data),
        getUserAnalytics: () => ipcRenderer.invoke('db-get-analytics'),
        searchKnowledge: (query) => ipcRenderer.invoke('db-search-knowledge', query),
        addKnowledge: (q, a, cat) => ipcRenderer.invoke('db-add-knowledge', q, a, cat)
    },
    
    // ==================== System Operations ====================
    system: {
        openExternal: (url) => ipcRenderer.invoke('system-open-external', url),
        openPath: (path) => ipcRenderer.invoke('system-open-path', path),
        getClipboard: () => ipcRenderer.invoke('system-get-clipboard'),
        setClipboard: (text) => ipcRenderer.invoke('system-set-clipboard', text),
        showNotification: (title, body) => ipcRenderer.invoke('system-show-notification', title, body),
        getCPUUsage: () => ipcRenderer.invoke('system-get-cpu-usage'),
        getMemoryUsage: () => ipcRenderer.invoke('system-get-memory-usage'),
        getBatteryInfo: () => ipcRenderer.invoke('system-get-battery-info'),
        openApp: (appPath) => ipcRenderer.invoke('system-open-app', appPath)
    },
    
    // ==================== Integrations ====================
    integrations: {
        github: {
            getRepos: () => ipcRenderer.invoke('github-get-repos'),
            createIssue: (owner, repo, title, body) => ipcRenderer.invoke('github-create-issue', owner, repo, title, body),
            getPRs: (owner, repo) => ipcRenderer.invoke('github-get-prs', owner, repo)
        },
        gmail: {
            sendEmail: (to, subject, body) => ipcRenderer.invoke('gmail-send', to, subject, body),
            getEmails: (limit) => ipcRenderer.invoke('gmail-get-emails', limit)
        },
        telegram: {
            sendMessage: (chatId, text) => ipcRenderer.invoke('telegram-send-message', chatId, text),
            getUpdates: () => ipcRenderer.invoke('telegram-get-updates')
        },
        weather: {
            getCurrent: (city) => ipcRenderer.invoke('weather-get-current', city),
            getForecast: (city, days) => ipcRenderer.invoke('weather-get-forecast', city, days)
        },
        currency: {
            getRate: (from, to) => ipcRenderer.invoke('currency-get-rate', from, to),
            convert: (amount, from, to) => ipcRenderer.invoke('currency-convert', amount, from, to)
        }
    },
    
    // ==================== Event Listeners ====================
    onScreenCapture: (callback) => {
        ipcRenderer.on('screen-capture', (event, data) => callback(data));
    },
    onPhoneNotification: (callback) => {
        ipcRenderer.on('phone-notification', (event, data) => callback(data));
    },
    onShortcutTriggered: (callback) => {
        ipcRenderer.on('shortcut-triggered', (event, data) => callback(data));
    },
    onBatteryChange: (callback) => {
        ipcRenderer.on('battery-change', (event, data) => callback(data));
    },
    
    // ==================== Logging ====================
    log: {
        info: (...args) => console.log('[NEXUS INFO]', ...args),
        warn: (...args) => console.warn('[NEXUS WARN]', ...args),
        error: (...args) => console.error('[NEXUS ERROR]', ...args),
        debug: (...args) => console.log('[NEXUS DEBUG]', ...args)
    }
});

// Signal that preload is ready
console.log('[NEXUS] Preload script loaded successfully - All modules connected');