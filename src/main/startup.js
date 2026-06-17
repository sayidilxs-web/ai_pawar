/**
 * NEXUS AI - Startup Script
 * অ্যাপ্লিকেশন শুরু করার জন্য
 */

const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024;
log.transports.console.level = 'debug';

log.info('===========================================');
log.info('🚀 NEXUS AI Starting...');
log.info('Version: 1.0.0');
log.info('Platform:', process.platform);
log.info('===========================================');

let mainWindow = null;
let tray = null;
let isQuitting = false;

process.on('uncaughtException', (error) => {
    log.error('❌ Uncaught Exception:', error);
    log.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('❌ Unhandled Rejection:', reason);
});

// Import automation modules
let robot = null;
let nutJs = null;

// Try to load automation libraries
try {
    robot = require('robotjs');
    log.info('✅ RobotJS loaded');
} catch (e) {
    log.warn('⚠️ RobotJS not available:', e.message);
}

try {
    nutJs = require('@nut-tree/nut-js');
    log.info('✅ NutJS loaded');
} catch (e) {
    log.warn('⚠️ NutJS not available:', e.message);
}

function createWindow() {
    log.info('📦 Creating main window...');
    
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        backgroundColor: '#0a0a0f',
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: true
        },
        show: false,
        icon: path.join(__dirname, '../../assets/icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    mainWindow.once('ready-to-show', () => {
        log.info('✅ Window ready');
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            log.info('📦 Window hidden to tray');
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    log.info('✅ Main window created');
}

function createTray() {
    log.info('🔧 Creating system tray...');
    
    // Create a simple colored icon
    const iconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGgSURBVFiF7ZYxTsNAEEX/rBMFCooUKSgoKFBQoKCgQEFBQUFBwR8gCgoUFBQoKChQUFCgQEGBggIFBQoKChQUKCgoKFBQUKBAQYECBQUFCgoUFCgoKChQUKCgoEBBgYICBQUFCgoUFCgoKCgoKCgoKChQUKCgoECh4A8UZJmZ3TvO+gdJltf7dmd3ZqXWGhERERGRvy4i8A8j8o9lZCIiIiIif11Go4hIKCI+IvLvJDQaERERERH56zIaEYnRaBQR+XciGo2IiIiIiPx1GY0iIqH/BojIH4dGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB+ERiN/EBqN/EFoNPIHodHIH4RGI38QGo38QWg08geh0cgfhEYjfxAajfxBaDTyB6HRyB/0F0YlIiIiIiIiIv8d/gF6dR0L5f8XKgAAAABJRU5ErkJggg==';
    
    let trayIcon = nativeImage.createFromDataURL(iconDataUrl);
    
    tray = new Tray(trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '🎯 NEXUS AI চালু করুন',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: '📸 স্ক্রিনশট নিন',
            click: async () => {
                const screenshot = await takeScreenshot();
                if (screenshot && mainWindow) {
                    mainWindow.webContents.send('screenshot-taken', screenshot);
                }
            }
        },
        { type: 'separator' },
        {
            label: '❌ বের হয়ে যান',
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
    
    log.info('✅ System tray created');
}

async function takeScreenshot() {
    log.debug('📸 Taking screenshot...');
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: screen.getPrimaryDisplay().workAreaSize
        });
        
        if (sources.length > 0) {
            return sources[0].thumbnail.toDataURL();
        }
    } catch (error) {
        log.error('❌ Screenshot error:', error);
    }
    return null;
}

// IPC Handlers
ipcMain.handle('get-sources', async () => {
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
        log.error('❌ Get sources error:', error);
        return [];
    }
});

ipcMain.handle('take-screenshot', async () => {
    return await takeScreenshot();
});

ipcMain.handle('capture-screen', async (event, sourceId) => {
    log.debug('📸 Capturing screen:', sourceId);
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: screen.getPrimaryDisplay().workAreaSize
        });
        
        const source = sources.find(s => s.id === sourceId);
        if (source) {
            return source.thumbnail.toDataURL();
        }
    } catch (error) {
        log.error('❌ Screen capture error:', error);
    }
    return null;
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
    log.debug(`🖱️ Mouse move: ${x}, ${y}`);
    try {
        if (nutJs) {
            const { mouse } = nutJs;
            await mouse.setPosition(parseInt(x), parseInt(y));
            return true;
        } else if (robot) {
            robot.moveMouse(parseInt(x), parseInt(y));
            return true;
        }
    } catch (error) {
        log.error('❌ Mouse move error:', error);
    }
    return false;
});

ipcMain.handle('mouse-click', async (event, button = 'left') => {
    log.debug(`🖱️ Mouse click: ${button}`);
    try {
        if (nutJs) {
            const { mouse, Button } = nutJs;
            await mouse.click(button === 'right' ? Button.RIGHT : Button.LEFT);
            return true;
        } else if (robot) {
            robot.mouseClick(button);
            return true;
        }
    } catch (error) {
        log.error('❌ Mouse click error:', error);
    }
    return false;
});

ipcMain.handle('mouse-double-click', async () => {
    log.debug('🖱️ Mouse double click');
    try {
        if (nutJs) {
            const { mouse, Button } = nutJs;
            await mouse.click(Button.LEFT);
            await new Promise(r => setTimeout(r, 100));
            await mouse.click(Button.LEFT);
            return true;
        } else if (robot) {
            robot.mouseClick();
            robot.mouseClick();
            return true;
        }
    } catch (error) {
        log.error('❌ Mouse double click error:', error);
    }
    return false;
});

ipcMain.handle('key-type', async (event, text) => {
    log.debug(`⌨️ Typing: ${text.substring(0, 30)}...`);
    try {
        if (nutJs) {
            const { keyboard } = nutJs;
            await keyboard.type(text);
            return true;
        } else if (robot) {
            robot.typeString(text);
            return true;
        }
    } catch (error) {
        log.error('❌ Key type error:', error);
    }
    return false;
});

ipcMain.handle('key-press', async (event, key) => {
    log.debug(`⌨️ Key press: ${key}`);
    try {
        if (nutJs) {
            const { keyboard, Key } = nutJs;
            const keyMap = {
                'enter': Key.Enter, 'tab': Key.Tab, 'escape': Key.Escape,
                'backspace': Key.Backspace, 'delete': Key.Delete,
                'up': Key.Up, 'down': Key.Down, 'left': Key.Left, 'right': Key.Right
            };
            
            if (keyMap[key]) {
                await keyboard.pressKey(keyMap[key]);
                await new Promise(r => setTimeout(r, 50));
                await keyboard.releaseKey(keyMap[key]);
                return true;
            }
        } else if (robot) {
            robot.keyTap(key);
            return true;
        }
    } catch (error) {
        log.error('❌ Key press error:', error);
    }
    return false;
});

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

ipcMain.handle('get-app-info', () => {
    return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        arch: process.arch
    };
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        log.error('❌ Read file error:', error);
        return null;
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        log.error('❌ Write file error:', error);
        return false;
    }
});

// App lifecycle
app.whenReady().then(() => {
    log.info('✅ App ready, initializing...');
    createWindow();
    createTray();
    
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
    
    log.info('🎉 NEXUS AI initialized successfully!');
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
    log.info('👋 NEXUS AI shutting down...');
});

app.on('will-quit', () => {
    log.info('✅ NEXUS AI shutdown complete');
});