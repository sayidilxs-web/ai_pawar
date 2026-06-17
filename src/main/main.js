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
        const { mouse } = require('@nut-tree/nut-js');
        await mouse.setPosition(parseInt(x), parseInt(y));
        return true;
    } catch (error) {
        log.error('Mouse move error:', error);
        // Fallback using RobotJS
        try {
            const robot = require('robotjs');
            robot.moveMouse(parseInt(x), parseInt(y));
            return true;
        } catch (robotError) {
            log.error('RobotJS move error:', robotError);
            return false;
        }
    }
});

ipcMain.handle('mouse-click', async (event, button = 'left') => {
    log.debug('Mouse click:', button);
    try {
        const { mouse, Button } = require('@nut-tree/nut-js');
        const btn = button === 'right' ? Button.RIGHT : Button.LEFT;
        await mouse.click(btn);
        return true;
    } catch (error) {
        log.error('Mouse click error:', error);
        // Fallback using RobotJS
        try {
            const robot = require('robotjs');
            if (button === 'right') {
                robot.mouseClick('right');
            } else {
                robot.mouseClick('left');
            }
            return true;
        } catch (robotError) {
            log.error('RobotJS click error:', robotError);
            return false;
        }
    }
});

ipcMain.handle('mouse-double-click', async () => {
    log.debug('Mouse double click');
    try {
        const { mouse, Button } = require('@nut-tree/nut-js');
        await mouse.click(Button.LEFT);
        await new Promise(r => setTimeout(r, 100));
        await mouse.click(Button.LEFT);
        return true;
    } catch (error) {
        log.error('Mouse double click error:', error);
        try {
            const robot = require('robotjs');
            robot.mouseClick();
            robot.mouseClick();
            return true;
        } catch (robotError) {
            log.error('RobotJS double click error:', robotError);
            return false;
        }
    }
});

ipcMain.handle('key-type', async (event, text) => {
    log.debug('Typing text:', text.substring(0, 50));
    try {
        const { keyboard } = require('@nut-tree/nut-js');
        await keyboard.type(text);
        return true;
    } catch (error) {
        log.error('Key type error:', error);
        try {
            const robot = require('robotjs');
            robot.typeString(text);
            return true;
        } catch (robotError) {
            log.error('RobotJS type error:', robotError);
            return false;
        }
    }
});

ipcMain.handle('key-press', async (event, key) => {
    log.debug('Pressing key:', key);
    try {
        const { keyboard, Key } = require('@nut-tree/nut-js');
        const keyMap = {
            'enter': Key.Enter,
            'tab': Key.Tab,
            'escape': Key.Escape,
            'backspace': Key.Backspace,
            'delete': Key.Delete,
            'ctrl': Key.LeftControl,
            'alt': Key.LeftAlt,
            'shift': Key.LeftShift,
            'cmd': Key.LeftSuper,
            'up': Key.Up,
            'down': Key.Down,
            'left': Key.Left,
            'right': Key.Right
        };
        
        if (keyMap[key]) {
            await keyboard.pressKey(keyMap[key]);
            await new Promise(r => setTimeout(r, 50));
            await keyboard.releaseKey(keyMap[key]);
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
        const { keyboard, Key } = require('@nut-tree/nut-js');
        await keyboard.pressKey(...keys);
        await new Promise(r => setTimeout(r, 50));
        await keyboard.releaseKey(...keys);
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

// App lifecycle
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