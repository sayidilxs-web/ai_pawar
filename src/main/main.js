/**
 * NEXUS AI - Main Process
 * পাওয়ারফুল AI অ্যাসিস্ট্যান্ট
 */

const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
log.transports.console.level = 'debug';

// Log startup
log.info('===========================================');
log.info('NEXUS AI Assistant Starting...');
log.info('Version: 1.0.0');
log.info('===========================================');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    log.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Create the main application window
 */
function createWindow() {
    log.info('Creating main window...');
    
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        backgroundColor: '#0a0a0f',
        frame: true,
        transparent: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: true
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    mainWindow.once('ready-to-show', () => {
        log.info('Window ready to show');
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            log.info('Window hidden to tray');
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development
    if (process.argv.includes('--enable-logging')) {
        mainWindow.webContents.openDevTools();
    }

    log.info('Main window created successfully');
}

/**
 * Create system tray
 */
function createTray() {
    log.info('Creating system tray...');
    
    const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
    let trayIcon;
    
    if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
    } else {
        // Create a simple icon if not exists
        trayIcon = nativeImage.createEmpty();
    }
    
    tray = new Tray(trayIcon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADSSURBVDiNpZMxDsIwDEV/pAfpETqADqAD6AA6gA6gA+gAOoAOoAPoADqADqAD6AA6gA5QtRIlFhuTEiWK/SSL7bz/4/hJwzfVgANwAR7AHXiI7xZYZ4F9cAUuwEN8t8C5WOEInIAr8BS/LbDOT7oCF+AGvMVvC6zzk67AFXgAX+LLBdb5SVfgBryAb/Fl8c0C6/ykG/ACvsSXC6zzk27AC/gGvyywzE+6Ay/gO/y2wDI/6RF8wO/w2wLz/KRH8A1/wW8LTPOT3sE3/A2/LTDNT/oCP+C3/+0C8/ykL/ADfsFf8d8C0/ykH/ALfsNf8d8Ck7ykF3CG/3b9B4YpLyU2C1t4AAAAAElFTkSuQmCC') : trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'NEXUS AI চালু করুন',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'স্ক্রিনশট নিন',
            click: () => takeScreenshot()
        },
        { type: 'separator' },
        {
            label: 'বের হয়ে যান',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('NEXUS AI - আপনার ব্যক্তিগত সহকারী');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
    
    log.info('System tray created');
}

/**
 * Take screenshot and return as base64
 */
async function takeScreenshot() {
    log.info('Taking screenshot...');
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: screen.getPrimaryDisplay().workAreaSize
        });
        
        if (sources.length > 0) {
            const screenshot = sources[0].thumbnail.toDataURL();
            log.info('Screenshot captured successfully');
            return screenshot;
        }
        return null;
    } catch (error) {
        log.error('Screenshot error:', error);
        return null;
    }
}

/**
 * Get all screens for selection
 */
async function getSources() {
    log.info('Getting screen sources...');
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen', 'window'],
            thumbnailSize: { width: 320, height: 180 }
        });
        
        return sources.map(source => ({
            id: source.id,
            name: source.name,
            thumbnail: source.thumbnail.toDataURL()
        }));
    } catch (error) {
        log.error('Get sources error:', error);
        return [];
    }
}

// IPC Handlers
ipcMain.handle('get-sources', async () => {
    return await getSources();
});

ipcMain.handle('take-screenshot', async () => {
    return await takeScreenshot();
});

ipcMain.handle('capture-screen', async (event, sourceId) => {
    log.info('Capturing specific screen:', sourceId);
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: screen.getPrimaryDisplay().workAreaSize
        });
        
        const source = sources.find(s => s.id === sourceId);
        if (source) {
            return source.thumbnail.toDataURL();
        }
        return null;
    } catch (error) {
        log.error('Screen capture error:', error);
        return null;
    }
});

ipcMain.handle('get-screen-size', () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
        width: primaryDisplay.size.width,
        height: primaryDisplay.size.height,
        workArea: primaryDisplay.workArea
    };
});

ipcMain.handle('mouse-move', async (event, x, y) => {
    log.debug('Moving mouse to:', x, y);
    try {
        const { screen } = require('electron');
        const point = { x: parseInt(x), y: parseInt(y) };
        const currentDisplay = screen.getDisplayNearestPoint(point);
        mainWindow.webContents.sendInputMouseMove(point);
        return true;
    } catch (error) {
        log.error('Mouse move error:', error);
        return false;
    }
});

ipcMain.handle('mouse-click', async (event, button = 'left') => {
    log.debug('Mouse click:', button);
    try {
        if (button === 'right') {
            mainWindow.webContents.sendInputMouseClick({ x: 0, y: 0 }, 'right');
        } else {
            mainWindow.webContents.sendInputMouseClick({ x: 0, y: 0 }, 'left');
        }
        return true;
    } catch (error) {
        log.error('Mouse click error:', error);
        return false;
    }
});

ipcMain.handle('mouse-double-click', async () => {
    log.debug('Mouse double click');
    try {
        mainWindow.webContents.sendInputMouseClick({ x: 0, y: 0 }, 'left');
        await new Promise(r => setTimeout(r, 100));
        mainWindow.webContents.sendInputMouseClick({ x: 0, y: 0 }, 'left');
        return true;
    } catch (error) {
        log.error('Mouse double click error:', error);
        return false;
    }
});

ipcMain.handle('key-type', async (event, text) => {
    log.debug('Typing text:', text.substring(0, 50));
    try {
        // Use clipboard and paste for text input
        const { clipboard } = require('electron');
        const originalClipboard = clipboard.readText();
        clipboard.writeText(text);
        mainWindow.webContents.sendInputKey({ key: 'v', modifiers: ['control'] });
        await new Promise(r => setTimeout(r, 100));
        clipboard.writeText(originalClipboard);
        return true;
    } catch (error) {
        log.error('Key type error:', error);
        return false;
    }
});

ipcMain.handle('key-press', async (event, key) => {
    log.debug('Pressing key:', key);
    try {
        const keyMap = {
            'enter': 'Return',
            'tab': 'Tab',
            'escape': 'Escape',
            'backspace': 'Backspace',
            'delete': 'Delete',
            'ctrl': 'Control',
            'alt': 'Alt',
            'shift': 'Shift',
            'cmd': 'Meta',
            'up': 'ArrowUp',
            'down': 'ArrowDown',
            'left': 'ArrowLeft',
            'right': 'ArrowRight'
        };
        
        if (keyMap[key]) {
            mainWindow.webContents.sendInputKey(keyMap[key]);
            return true;
        }
        return false;
    } catch (error) {
        log.error('Key press error:', error);
        return false;
    }
});

ipcMain.handle('key-combination', async (event, keys) => {
    log.debug('Pressing key combination:', keys);
    try {
        mainWindow.webContents.sendInputKey(...keys);
        return true;
    } catch (error) {
        log.error('Key combination error:', error);
        return false;
    }
});

// Window controls
ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.handle('close-window', () => {
    if (mainWindow) mainWindow.hide();
});

// Get app info
ipcMain.handle('get-app-info', () => {
    return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        arch: process.arch
    };
});

// Read file
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
    } catch (error) {
        log.error('Read file error:', error);
        return null;
    }
});

// Write file
ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        log.error('Write file error:', error);
        return false;
    }
});

// ============================================
// 🚀 অ্যাপ অটোমেশন - যেকোনো অ্যাপ কন্ট্রোল
// ============================================

const { exec, spawn } = require('child_process');
const robot = require('robotjs'); // মাউস ও কীবোর্ড কন্ট্রোল

// অ্যাপ খোলা
ipcMain.handle('open-app', async (event, appName) => {
    try {
        log.info(`Opening app: ${appName}`);
        
        if (process.platform === 'win32') {
            // Windows - অ্যাপ নাম দিয়ে খোলা
            exec(`start ${appName}`, (error) => {
                if (error) {
                    log.error('Open app error:', error);
                }
            });
            return { success: true, message: `${appName} খোলা হচ্ছে...` };
        } else if (process.platform === 'darwin') {
            exec(`open -a "${appName}"`, (error) => {
                if (error) log.error('Open app error:', error);
            });
            return { success: true, message: `${appName} খোলা হচ্ছে...` };
        }
        return { success: true };
    } catch (error) {
        log.error('Open app error:', error);
        return { error: error.message };
    }
});

// WhatsApp/মেসেঞ্জার খোলা এবং মেসেজ পাঠানো
ipcMain.handle('send-message-to-app', async (event, appName, message) => {
    try {
        log.info(`Sending message to ${appName}: ${message}`);
        
        // প্রথমে অ্যাপ খুলি
        if (process.platform === 'win32') {
            exec(`start ${appName}`, async (error) => {
                if (error) {
                    log.error('Open app error:', error);
                    return;
                }
                
                // 3 সেকেন্ড অপেক্ষা অ্যাপ খোলার জন্য
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // মেসেজ টাইপ করা
                robot.typeString(message);
                
                // Enter প্রেস করা
                robot.keyTap('enter');
            });
        }
        
        return { success: true, message: `${appName}-এ মেসেজ পাঠানো হচ্ছে...` };
    } catch (error) {
        log.error('Send message error:', error);
        return { error: error.message };
    }
});

// মাউস ক্লিক
ipcMain.handle('mouse-click', async (event, x, y) => {
    try {
        robot.moveMouse(x, y);
        robot.mouseClick();
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// মাউস মুভ
ipcMain.handle('mouse-move', async (event, x, y) => {
    try {
        robot.moveMouse(x, y);
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// ডাবল ক্লিক
ipcMain.handle('mouse-double-click', async (event, x, y) => {
    try {
        robot.moveMouse(x, y);
        robot.mouseClick('left', true);
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// কীবোর্ড টাইপ
ipcMain.handle('type-text', async (event, text) => {
    try {
        robot.typeString(text);
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// কী প্রেস
ipcMain.handle('press-key', async (event, key, modifiers = []) => {
    try {
        if (modifiers.length > 0) {
            modifiers.forEach(mod => robot.keyToggle(mod, 'down'));
        }
        robot.keyTap(key);
        if (modifiers.length > 0) {
            modifiers.forEach(mod => robot.keyToggle(mod, 'up'));
        }
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// স্ক্রিনশট
ipcMain.handle('take-screenshot', async () => {
    try {
        const screenshot = robot.screen.capture();
        if (screenshot) {
            return {
                success: true,
                image: screenshot.image.toString('base64'),
                width: screenshot.width,
                height: screenshot.height
            };
        }
        return { error: 'স্ক্রিনশট নেওয়া যায়নি' };
    } catch (error) {
        log.error('Screenshot error:', error);
        return { error: error.message };
    }
});

// স্ক্রিন রেজোলিউশন
ipcMain.handle('get-screen-size', async () => {
    try {
        const size = screen.getPrimaryDisplay().size;
        return { width: size.width, height: size.height };
    } catch (error) {
        return { error: error.message };
    }
});

// টেক্সট কপি
ipcMain.handle('copy-text', async (event, text) => {
    try {
        // Clipboard-এ কপি
        const { clipboard } = require('electron');
        clipboard.writeText(text);
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// URL খোলা (ব্রাউজারে)
ipcMain.handle('open-url', async (event, url) => {
    try {
        if (process.platform === 'win32') {
            exec(`start ${url}`);
        } else if (process.platform === 'darwin') {
            exec(`open ${url}`);
        }
        return { success: true, message: `${url} খোলা হচ্ছে...` };
    } catch (error) {
        return { error: error.message };
    }
});

// URL-এ যাওয়া এবং তথ্য নেওয়া
ipcMain.handle('browse-and-extract', async (event, url, selector = 'body') => {
    try {
        // BrowserWindow-এ লোড করা
        if (mainWindow) {
            await mainWindow.loadURL(url);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // DOM থেকে কন্টেন্ট নেওয়া
            const content = await mainWindow.webContents.executeJavaScript(`
                document.querySelector('${selector}')?.innerText || 
                document.body.innerText.substring(0, 5000)
            `);
            
            return { success: true, content, url };
        }
        return { error: 'Window not available' };
    } catch (error) {
        log.error('Browse error:', error);
        return { error: error.message };
    }
});

// WhatsApp সরাসরি মেসেজ পাঠানো
ipcMain.handle('whatsapp-send', async (event, phoneNumber, message) => {
    try {
        // WhatsApp Web ব্যবহার করে
        const waUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        if (mainWindow) {
            await mainWindow.loadURL(waUrl);
            await new Promise(resolve => setTimeout(resolve, 5000)); // WhatsApp লোড হতে সময়
            
            // সেন্ড বাটনে ক্লিক
            await mainWindow.webContents.executeJavaScript(`
                document.querySelector('[data-testid="send-button"]')?.click();
            `);
            
            return { success: true, message: 'WhatsApp-এ মেসেজ পাঠানো হচ্ছে...' };
        }
        return { error: 'Window not available' };
    } catch (error) {
        log.error('WhatsApp error:', error);
        return { error: error.message };
    }
});

// স্ক্রোল
ipcMain.handle('scroll', async (event, direction, amount = 10) => {
    try {
        if (direction === 'up') {
            for (let i = 0; i < amount; i++) {
                robot.keyTap('up', 'control');
                await new Promise(r => setTimeout(r, 50));
            }
        } else {
            for (let i = 0; i < amount; i++) {
                robot.keyTap('down', 'control');
                await new Promise(r => setTimeout(r, 50));
            }
        }
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

// App lifecycle
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(() => {
    log.info('App ready, initializing...');
    createWindow();
    createTray();
    
    // Register global shortcuts
    globalShortcut.register('CommandOrControl+Shift+N', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
    
    log.info('NEXUS AI initialized successfully');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    log.info('NEXUS AI shutting down...');
});

app.on('will-quit', () => {
    log.info('NEXUS AI shutdown complete');
});