/**
 * NEXUS AI - Main Process
 * পাওয়ারফুল AI অ্যাসিস্ট্যান্ট
 */

const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, Tray, Menu, nativeImage, shell, clipboard, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const os = require('os');
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

// Phone connection state
let phoneDevice = null;
let adbPath = 'adb';

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

// ==================== Screen & Display IPC ====================
ipcMain.handle('get-sources', async () => await getSources());
ipcMain.handle('take-screenshot', async () => await takeScreenshot());
ipcMain.handle('capture-screen', async (event, sourceId) => {
    log.info('Capturing specific screen:', sourceId);
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: screen.getPrimaryDisplay().workAreaSize
        });
        
        const source = sources.find(s => s.id === sourceId);
        if (source) return source.thumbnail.toDataURL();
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

// ==================== Mouse Control IPC ====================
ipcMain.handle('mouse-move', async (event, x, y) => {
    log.debug('Moving mouse to:', x, y);
    try {
        const { mouse } = require('@nut-tree/nut-js');
        await mouse.setPosition(parseInt(x), parseInt(y));
        return true;
    } catch (error) {
        log.error('Mouse move error:', error);
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
        try {
            const robot = require('robotjs');
            if (button === 'right') robot.mouseClick('right');
            else robot.mouseClick('left');
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

ipcMain.handle('mouse-scroll', async (event, amount) => {
    log.debug('Mouse scroll:', amount);
    try {
        const robot = require('robotjs');
        robot.scrollMouse(0, amount);
        return true;
    } catch (error) {
        log.error('Mouse scroll error:', error);
        return false;
    }
});

// ==================== Keyboard Control IPC ====================
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
            'enter': Key.Enter, 'tab': Key.Tab, 'escape': Key.Escape,
            'backspace': Key.Backspace, 'delete': Key.Delete,
            'ctrl': Key.LeftControl, 'alt': Key.LeftAlt, 'shift': Key.LeftShift,
            'cmd': Key.LeftSuper, 'up': Key.Up, 'down': Key.Down,
            'left': Key.Left, 'right': Key.Right
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

// ==================== Window Controls IPC ====================
ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});
ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    }
});
ipcMain.handle('close-window', () => {
    if (mainWindow) mainWindow.hide();
});
ipcMain.handle('set-always-on-top', (event, flag) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(flag);
});

// ==================== App & System Info IPC ====================
ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    arch: process.arch
}));

ipcMain.handle('get-system-info', () => ({
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    hostname: os.hostname(),
    homedir: os.homedir(),
    uptime: os.uptime()
}));

// ==================== File Operations IPC ====================
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
    } catch (error) {
        log.error('Read file error:', error);
        return null;
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        log.error('Write file error:', error);
        return false;
    }
});

ipcMain.handle('delete-file', async (event, filePath) => {
    try {
        fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        log.error('Delete file error:', error);
        return false;
    }
});

ipcMain.handle('list-dir', async (event, dirPath) => {
    try {
        return fs.readdirSync(dirPath).map(name => ({
            name,
            isDirectory: fs.statSync(path.join(dirPath, name)).isDirectory()
        }));
    } catch (error) {
        log.error('List dir error:', error);
        return [];
    }
});

ipcMain.handle('create-dir', async (event, dirPath) => {
    try {
        fs.mkdirSync(dirPath, { recursive: true });
        return true;
    } catch (error) {
        log.error('Create dir error:', error);
        return false;
    }
});

// ==================== Phone (ADB) Connection IPC ====================
ipcMain.handle('phone-scan-devices', async () => {
    log.info('Scanning for Android devices...');
    return new Promise((resolve) => {
        exec(`${adbPath} devices`, (error, stdout) => {
            if (error) {
                log.error('ADB scan error:', error);
                resolve([]);
            } else {
                const devices = [];
                const lines = stdout.split('\n').filter(l => l.trim());
                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split('\t');
                    if (parts.length >= 2) {
                        devices.push({
                            id: parts[0],
                            status: parts[1].trim()
                        });
                    }
                }
                resolve(devices);
            }
        });
    });
});

ipcMain.handle('phone-connect-wifi', async (event, ip, port = 5555) => {
    log.info(`Connecting to phone at ${ip}:${port}...`);
    return new Promise((resolve) => {
        exec(`${adbPath} connect ${ip}:${port}`, (error, stdout) => {
            if (error) resolve({ success: false, error: error.message });
            else {
                phoneDevice = `${ip}:${port}`;
                resolve({ success: true, output: stdout });
            }
        });
    });
});

ipcMain.handle('phone-disconnect', async () => {
    if (phoneDevice) {
        return new Promise((resolve) => {
            exec(`${adbPath} disconnect ${phoneDevice}`, (error, stdout) => {
                phoneDevice = null;
                resolve({ success: !error, output: stdout });
            });
        });
    }
    return { success: true };
});

ipcMain.handle('phone-get-device-info', async () => {
    if (!phoneDevice) return null;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell getprop ro.product.model`, (error, model) => {
            if (error) resolve(null);
            else {
                exec(`${adbPath} -s ${phoneDevice} shell getprop ro.build.version.release`, (err2, version) => {
                    resolve({
                        model: model.trim(),
                        androidVersion: version.trim()
                    });
                });
            }
        });
    });
});

ipcMain.handle('phone-take-screenshot', async () => {
    if (!phoneDevice) return null;
    return new Promise((resolve) => {
        const localPath = path.join(app.getPath('temp'), 'phone_screenshot.png');
        exec(`${adbPath} -s ${phoneDevice} shell screencap -p /sdcard/screenshot.png && ${adbPath} -s ${phoneDevice} pull /sdcard/screenshot.png "${localPath}"`, (error) => {
            if (error) resolve(null);
            else {
                const data = fs.readFileSync(localPath);
                fs.unlinkSync(localPath);
                resolve(`data:image/png;base64,${data.toString('base64')}`);
            }
        });
    });
});

ipcMain.handle('phone-open-app', async (event, packageName) => {
    if (!phoneDevice) return false;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`, (error) => {
            resolve(!error);
        });
    });
});

ipcMain.handle('phone-send-text', async (event, text) => {
    if (!phoneDevice) return false;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell input text "${text.replace(/"/g, '\\"')}"`, (error) => {
            resolve(!error);
        });
    });
});

ipcMain.handle('phone-tap', async (event, x, y) => {
    if (!phoneDevice) return false;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell input tap ${x} ${y}`, (error) => {
            resolve(!error);
        });
    });
});

ipcMain.handle('phone-swipe', async (event, x1, y1, x2, y2) => {
    if (!phoneDevice) return false;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell input swipe ${x1} ${y1} ${x2} ${y2}`, (error) => {
            resolve(!error);
        });
    });
});

ipcMain.handle('phone-get-apps', async () => {
    if (!phoneDevice) return [];
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell pm list packages`, (error, stdout) => {
            if (error) resolve([]);
            else {
                const apps = stdout.split('\n')
                    .filter(l => l.includes('package:'))
                    .map(l => l.replace('package:', '').trim());
                resolve(apps);
            }
        });
    });
});

ipcMain.handle('phone-get-battery', async () => {
    if (!phoneDevice) return null;
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell dumpsys battery`, (error, stdout) => {
            if (error) resolve(null);
            else {
                const level = stdout.match(/level:\s*(\d+)/)?.[1] || 0;
                const status = stdout.match(/status:\s*(\d+)/)?.[1] || 0;
                resolve({ level: parseInt(level), status: parseInt(status) });
            }
        });
    });
});

ipcMain.handle('phone-exec-command', async (event, cmd) => {
    if (!phoneDevice) return { success: false, error: 'No device connected' };
    return new Promise((resolve) => {
        exec(`${adbPath} -s ${phoneDevice} shell "${cmd}"`, (error, stdout, stderr) => {
            resolve({ success: !error, output: stdout, error: stderr });
        });
    });
});

// ==================== System Operations IPC ====================
ipcMain.handle('system-open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
});

ipcMain.handle('system-open-path', async (event, filePath) => {
    await shell.openPath(filePath);
    return true;
});

ipcMain.handle('system-get-clipboard', () => clipboard.readText());
ipcMain.handle('system-set-clipboard', (event, text) => {
    clipboard.writeText(text);
    return true;
});

ipcMain.handle('system-show-notification', (event, title, body) => {
    new Notification({ title, body }).show();
    return true;
});

ipcMain.handle('system-get-cpu-usage', () => {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(cpu => {
        for (let type in cpu.times) totalTick += cpu.times[type];
        totalIdle += cpu.times.idle;
    });
    return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length,
        usage: ((1 - totalIdle / totalTick) * 100).toFixed(1)
    };
});

ipcMain.handle('system-get-memory-usage', () => ({
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem(),
    percentage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1)
}));

ipcMain.handle('system-open-app', async (event, appPath) => {
    return new Promise((resolve) => {
        spawn(appPath, [], { detached: true, shell: true });
        resolve(true);
    });
});

// ==================== GitHub Integration IPC ====================
ipcMain.handle('github-get-repos', async (event, token) => {
    try {
        const response = await fetch('https://api.github.com/user/repos', {
            headers: { 'Authorization': `token ${token}` }
        });
        return await response.json();
    } catch (error) {
        log.error('GitHub repos error:', error);
        return [];
    }
});

ipcMain.handle('github-create-issue', async (event, token, owner, repo, title, body) => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body })
        });
        return await response.json();
    } catch (error) {
        log.error('GitHub issue error:', error);
        return { error: error.message };
    }
});

// ==================== Weather Integration IPC ====================
ipcMain.handle('weather-get-current', async (event, city, apiKey) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        return await response.json();
    } catch (error) {
        log.error('Weather error:', error);
        return null;
    }
});

ipcMain.handle('weather-get-forecast', async (event, city, days, apiKey) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        return await response.json();
    } catch (error) {
        log.error('Forecast error:', error);
        return null;
    }
});

// ==================== Currency Integration IPC ====================
ipcMain.handle('currency-get-rate', async (event, from, to, apiKey) => {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
        const data = await response.json();
        return { from, to, rate: data.conversion_rates?.[to] };
    } catch (error) {
        log.error('Currency rate error:', error);
        return null;
    }
});

ipcMain.handle('currency-convert', async (event, amount, from, to, apiKey) => {
    const rate = await ipcMain.handle('currency-get-rate', null, from, to, apiKey);
    return rate ? amount * rate.rate : null;
});

// App lifecycle
app.whenReady().then(() => {
    log.info('App ready, initializing...');
    createWindow();
    createTray();
    
    // Register global shortcuts
    globalShortcut.register('CommandOrControl+Shift+N', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) mainWindow.hide();
            else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
    
    log.info('NEXUS AI initialized successfully');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    log.info('NEXUS AI shutting down...');
});

app.on('will-quit', () => {
    log.info('NEXUS AI shutdown complete');
});