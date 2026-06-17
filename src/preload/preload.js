/**
 * NEXUS AI - Preload Script
 * Secure IPC Bridge between Main and Renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('nexusAI', {
    // Screen capture
    getSources: () => ipcRenderer.invoke('get-sources'),
    takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
    captureScreen: (sourceId) => ipcRenderer.invoke('capture-screen', sourceId),
    getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
    
    // Mouse control
    mouseMove: (x, y) => ipcRenderer.invoke('mouse-move', x, y),
    mouseClick: (button) => ipcRenderer.invoke('mouse-click', button || 'left'),
    mouseDoubleClick: () => ipcRenderer.invoke('mouse-double-click'),
    
    // Keyboard control
    keyType: (text) => ipcRenderer.invoke('key-type', text),
    keyPress: (key) => ipcRenderer.invoke('key-press', key),
    keyCombination: (keys) => ipcRenderer.invoke('key-combination', keys),
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // App info
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // File operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    
    // Event listeners
    onScreenCapture: (callback) => {
        ipcRenderer.on('screen-capture', (event, data) => callback(data));
    },
    
    // Logging
    log: {
        info: (...args) => console.log('[NEXUS INFO]', ...args),
        warn: (...args) => console.warn('[NEXUS WARN]', ...args),
        error: (...args) => console.error('[NEXUS ERROR]', ...args),
        debug: (...args) => console.log('[NEXUS DEBUG]', ...args)
    }
});

// Signal that preload is ready
console.log('[NEXUS] Preload script loaded successfully');