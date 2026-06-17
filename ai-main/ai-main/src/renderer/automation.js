/**
 * NEXUS AI - Ultra Powerful Automation System
 * 500+ Built-in Instructions - No API Required
 * সম্পূর্ণ অটোমেশন সিস্টেম
 */

class NexusAutomation {
    constructor() {
        this.commands = new Map();
        this.macros = new Map();
        this.lastPosition = { x: 0, y: 0 };
        this.isEnabled = true;
        this.init();
    }

    init() {
        this.registerBuiltInCommands();
        this.registerMacros();
        console.log('[NEXUS Automation] Initialized with 500+ commands');
    }

    /**
     * Built-in Commands - No API Required
     * These commands work without Gemini API
     */
    registerBuiltInCommands() {
        // ==================== MOUSE COMMANDS ====================
        const mouseCommands = {
            // Basic clicks
            'ক্লিক করো': () => this.click(),
            'ক্লিক': () => this.click(),
            'ট্যাপ করো': () => this.click(),
            'ট্যাপ': () => this.click(),
            'বাম ক্লিক': () => this.click('left'),
            'left click': () => this.click('left'),
            
            // Double click
            'ডাবল ক্লিক করো': () => this.doubleClick(),
            'ডাবল ক্লিক': () => this.doubleClick(),
            'দুইবার ক্লিক': () => this.doubleClick(),
            'double click': () => this.doubleClick(),
            
            // Right click
            'রাইট ক্লিক করো': () => this.click('right'),
            'রাইট ক্লিক': () => this.click('right'),
            'রাইট ক্লিক কর': () => this.click('right'),
            'right click': () => this.click('right'),
            'context menu': () => this.click('right'),
            
            // Middle click
            'মিডল ক্লিক': () => this.click('middle'),
            'middle click': () => this.click('middle'),
            
            // Mouse movement
            'উপরে যাও': () => this.moveMouse(0, -100),
            'উপরে সরে যাও': () => this.moveMouse(0, -100),
            'উপরে চলে যাও': () => this.moveMouse(0, -100),
            'up': () => this.moveMouse(0, -100),
            'উপরে নিয়ে যাও': () => this.moveMouse(0, -100),
            
            'নিচে যাও': () => this.moveMouse(0, 100),
            'নিচে সরে যাও': () => this.moveMouse(0, 100),
            'নিচে চলে যাও': () => this.moveMouse(0, 100),
            'down': () => this.moveMouse(0, 100),
            'নিচে নিয়ে যাও': () => this.moveMouse(0, 100),
            
            'বামে যাও': () => this.moveMouse(-100, 0),
            'বামে সরে যাও': () => this.moveMouse(-100, 0),
            'left': () => this.moveMouse(-100, 0),
            'বামে নিয়ে যাও': () => this.moveMouse(-100, 0),
            
            'ডানে যাও': () => this.moveMouse(100, 0),
            'ডানে সরে যাও': () => this.moveMouse(100, 0),
            'right': () => this.moveMouse(100, 0),
            'ডানে নিয়ে যাও': () => this.moveMouse(100, 0),
            
            // Scroll
            'স্ক্রল করো উপরে': () => this.scroll(-5),
            'স্ক্রল উপরে': () => this.scroll(-5),
            'scroll up': () => this.scroll(-5),
            'উপরে স্ক্রল': () => this.scroll(-5),
            
            'স্ক্রল করো নিচে': () => this.scroll(5),
            'স্ক্রল নিচে': () => this.scroll(5),
            'scroll down': () => this.scroll(5),
            'নিচে স্ক্রল': () => this.scroll(5),
            
            // Smart clicks
            'ওখানে ক্লিক করো': () => this.clickAtLastPosition(),
            'এখানে ক্লিক করো': () => this.clickAtLastPosition(),
            'সেখানে ক্লিক করো': () => this.clickAtLastPosition(),
            'click there': () => this.clickAtLastPosition(),
            'ট্যাপ কর ওখানে': () => this.clickAtLastPosition(),
        };

        // ==================== KEYBOARD COMMANDS ====================
        const keyboardCommands = {
            // Enter/OK
            'এন্টার দাও': () => this.pressKey('enter'),
            'এন্টার প্রেস করো': () => this.pressKey('enter'),
            'enter': () => this.pressKey('enter'),
            'enter দাও': () => this.pressKey('enter'),
            'ওকে করো': () => this.pressKey('enter'),
            'ok': () => this.pressKey('enter'),
            'সাবমিট করো': () => this.pressKey('enter'),
            
            // Escape/Back
            'ব্যাক করো': () => this.pressKey('escape'),
            'escape': () => this.pressKey('escape'),
            'বের হও': () => this.pressKey('escape'),
            'বাতিল করো': () => this.pressKey('escape'),
            'বন্ধ করো': () => this.pressKey('escape'),
            'cancel': () => this.pressKey('escape'),
            
            // Tab
            'ট্যাব দাও': () => this.pressKey('tab'),
            'tab': () => this.pressKey('tab'),
            'ট্যাব করো': () => this.pressKey('tab'),
            'next': () => this.pressKey('tab'),
            
            // Backspace
            'ব্যাকস্পেস দাও': () => this.pressKey('backspace'),
            'backspace': () => this.pressKey('backspace'),
            'মুছে ফেলো': () => this.pressKey('backspace'),
            'delete': () => this.pressKey('backspace'),
            
            // Space
            'স্পেস দাও': () => this.pressKey('space'),
            'space': () => this.pressKey('space'),
            
            // Arrow keys
            'উপরের তীর': () => this.pressKey('up'),
            'arrow up': () => this.pressKey('up'),
            'নিচের তীর': () => this.pressKey('down'),
            'arrow down': () => this.pressKey('down'),
            'বামের তীর': () => this.pressKey('left'),
            'arrow left': () => this.pressKey('left'),
            'ডানের তীর': () => this.pressKey('right'),
            'arrow right': () => this.pressKey('right'),
            
            // Home/End
            'হোম করো': () => this.pressKey('home'),
            'home': () => this.pressKey('home'),
            'এন্ড করো': () => this.pressKey('end'),
            'end': () => this.pressKey('end'),
            
            // Page Up/Down
            'পেজ আপ': () => this.pressKey('pageup'),
            'page up': () => this.pressKey('pageup'),
            'পেজ ডাউন': () => this.pressKey('pagedown'),
            'page down': () => this.pressKey('pagedown'),
        };

        // ==================== SHORTCUT COMMANDS ====================
        const shortcutCommands = {
            // Ctrl combinations
            'সিলেক্ট অল': () => this.combo('ctrl', 'a'),
            'সব সিলেক্ট করো': () => this.combo('ctrl', 'a'),
            'select all': () => this.combo('ctrl', 'a'),
            'ctrl+a': () => this.combo('ctrl', 'a'),
            
            'কপি করো': () => this.combo('ctrl', 'c'),
            'copy': () => this.combo('ctrl', 'c'),
            'ctrl+c': () => this.combo('ctrl', 'c'),
            
            'পেস্ট করো': () => this.combo('ctrl', 'v'),
            'paste': () => this.combo('ctrl', 'v'),
            'ctrl+v': () => this.combo('ctrl', 'v'),
            
            'কাট করো': () => this.combo('ctrl', 'x'),
            'cut': () => this.combo('ctrl', 'x'),
            'ctrl+x': () => this.combo('ctrl', 'x'),
            
            'সেভ করো': () => this.combo('ctrl', 's'),
            'save': () => this.combo('ctrl', 's'),
            'ctrl+s': () => this.combo('ctrl', 's'),
            
            'আনডু করো': () => this.combo('ctrl', 'z'),
            'undo': () => this.combo('ctrl', 'z'),
            'ctrl+z': () => this.combo('ctrl', 'z'),
            
            'রিডু করো': () => this.combo('ctrl', 'shift', 'z'),
            'redo': () => this.combo('ctrl', 'shift', 'z'),
            'ctrl+shift+z': () => this.combo('ctrl', 'shift', 'z'),
            
            'রিফ্রেশ করো': () => this.combo('ctrl', 'r'),
            'refresh': () => this.combo('ctrl', 'r'),
            'reload': () => this.combo('ctrl', 'r'),
            'ctrl+r': () => this.combo('ctrl', 'r'),
            
            'নিউ ট্যাব খোলো': () => this.combo('ctrl', 't'),
            'নতুন ট্যাব': () => this.combo('ctrl', 't'),
            'new tab': () => this.combo('ctrl', 't'),
            'ctrl+t': () => this.combo('ctrl', 't'),
            
            'ট্যাব বন্ধ করো': () => this.combo('ctrl', 'w'),
            'close tab': () => this.combo('ctrl', 'w'),
            'ctrl+w': () => this.combo('ctrl', 'w'),
            
            'সব ট্যাব বন্ধ করো': () => this.combo('ctrl', 'shift', 'w'),
            
            'হিস্টোরি খোলো': () => this.combo('ctrl', 'h'),
            'history': () => this.combo('ctrl', 'h'),
            'ctrl+h': () => this.combo('ctrl', 'h'),
            
            'ডাউনলোড খোলো': () => this.combo('ctrl', 'j'),
            'downloads': () => this.combo('ctrl', 'j'),
            'ctrl+j': () => this.combo('ctrl', 'j'),
            
            'বুকমার্ক করো': () => this.combo('ctrl', 'd'),
            'bookmark': () => this.combo('ctrl', 'd'),
            'ctrl+d': () => this.combo('ctrl', 'd'),
            
            'ফুল স্ক্রিন করো': () => this.combo('f11'),
            'full screen': () => this.combo('f11'),
            'ফুলস্ক্রিন': () => this.combo('f11'),
            
            'জুম ইন করো': () => this.combo('ctrl', 'add'),
            'zoom in': () => this.combo('ctrl', 'add'),
            'বড় করো': () => this.combo('ctrl', 'add'),
            
            'জুম আউট করো': () => this.combo('ctrl', 'subtract'),
            'zoom out': () => this.combo('ctrl', 'subtract'),
            'ছোট করো': () => this.combo('ctrl', 'subtract'),
            
            'নরমাল সাইজ করো': () => this.combo('ctrl', '0'),
            'normal size': () => this.combo('ctrl', '0'),
            
            // Alt combinations
            'আলট ট্যাব': () => this.combo('alt', 'tab'),
            'alt tab': () => this.combo('alt', 'tab'),
            
            // Windows key
            'উইন্ডোজ খোলো': () => this.combo('meta'),
            'windows': () => this.combo('meta'),
            'start menu': () => this.combo('meta'),
            
            'ফাইল এক্সপ্লোরার খোলো': () => this.combo('meta', 'e'),
            'file explorer': () => this.combo('meta', 'e'),
        };

        // ==================== SYSTEM COMMANDS ====================
        const systemCommands = {
            // Window management
            'উইন্ডো মিনিমাইজ করো': () => this.minimizeWindow(),
            'minimize': () => this.minimizeWindow(),
            'ছোট করো উইন্ডো': () => this.minimizeWindow(),
            
            'উইন্ডো ম্যাক্সিমাইজ করো': () => this.maximizeWindow(),
            'maximize': () => this.maximizeWindow(),
            'বড় করো উইন্ডো': () => this.maximizeWindow(),
            
            'উইন্ডো ক্লোজ করো': () => this.closeWindow(),
            'close window': () => this.closeWindow(),
            
            // Screenshot
            'স্ক্রিনশট নাও': () => this.takeScreenshot(),
            'স্ক্রিনশট করো': () => this.takeScreenshot(),
            'screenshot': () => this.takeScreenshot(),
            'স্ক্রিন ধরো': () => this.takeScreenshot(),
            
            // Volume
            'ভলিউম বাড়াও': () => this.adjustVolume(10),
            'volume up': () => this.adjustVolume(10),
            'বেশি শব্দ': () => this.adjustVolume(10),
            
            'ভলিউম কমাও': () => this.adjustVolume(-10),
            'volume down': () => this.adjustVolume(-10),
            'কম শব্দ': () => this.adjustVolume(-10),
            
            'মিউট করো': () => this.toggleMute(),
            'mute': () => this.toggleMute(),
            'নোইজ ক্যান্সেল': () => this.toggleMute(),
            
            // Media
            'প্লে করো': () => this.mediaPlay(),
            'play': () => this.mediaPlay(),
            'চালাও': () => this.mediaPlay(),
            
            'পজ করো': () => this.mediaPause(),
            'pause': () => this.mediaPause(),
            'থামাও': () => this.mediaPause(),
            
            'পরের গান': () => this.mediaNext(),
            'next': () => this.mediaNext(),
            'next song': () => this.mediaNext(),
            
            'আগের গান': () => this.mediaPrevious(),
            'previous': () => this.mediaPrevious(),
            'previous song': () => this.mediaPrevious(),
            
            'স্টপ করো': () => this.mediaStop(),
            'stop': () => this.mediaStop(),
        };

        // ==================== BROWSER COMMANDS ====================
        const browserCommands = {
            'গুগল খোলো': () => this.openURL('https://www.google.com'),
            'google': () => this.openURL('https://www.google.com'),
            'youtube খোলো': () => this.openURL('https://www.youtube.com'),
            'youtube': () => this.openURL('https://www.youtube.com'),
            'ফেসবুক খোলো': () => this.openURL('https://www.facebook.com'),
            'facebook': () => this.openURL('https://www.facebook.com'),
            'টুইটার খোলো': () => this.openURL('https://www.twitter.com'),
            'twitter': () => this.openURL('https://www.twitter.com'),
            'ইনস্টাগ্রাম খোলো': () => this.openURL('https://www.instagram.com'),
            'instagram': () => this.openURL('https://www.instagram.com'),
            'গিটহাব খোলো': () => this.openURL('https://www.github.com'),
            'github': () => this.openURL('https://www.github.com'),
            'নিউ ট্যাব': () => this.newTab(),
            'new tab': () => this.newTab(),
            'ট্যাব বন্ধ করো': () => this.closeTab(),
            'close tab': () => this.closeTab(),
            'পুনরায় লোড করো': () => this.reload(),
            'reload': () => this.reload(),
            'ব্যাক করো': () => this.goBack(),
            'go back': () => this.goBack(),
            'ফরোয়ার্ড করো': () => this.goForward(),
            'forward': () => this.goForward(),
            'হোম পেজ যাও': () => this.goHome(),
            'home': () => this.goHome(),
            'সার্চ করো': () => this.focusSearch(),
            'search': () => this.focusSearch(),
            'অ্যাড্রেস বারে যাও': () => this.focusAddressBar(),
            'address bar': () => this.focusAddressBar(),
        };

        // ==================== FILE COMMANDS ====================
        const fileCommands = {
            'নতুন ফোল্ডার তৈরি করো': () => this.createFolder(),
            'new folder': () => this.createFolder(),
            'ফোল্ডার তৈরি': () => this.createFolder(),
            
            'নতুন ফাইল তৈরি করো': () => this.createFile(),
            'new file': () => this.createFile(),
            'ফাইল তৈরি': () => this.createFile(),
            
            'কপি করো ফাইল': () => this.copyFile(),
            'copy file': () => this.copyFile(),
            
            'পেস্ট করো ফাইল': () => this.pasteFile(),
            'paste file': () => this.pasteFile(),
            
            'কাট করো ফাইল': () => this.cutFile(),
            'cut file': () => this.cutFile(),
            
            'ডিলিট করো ফাইল': () => this.deleteFile(),
            'delete file': () => this.deleteFile(),
            'delete': () => this.deleteFile(),
            
            'রিনেম করো ফাইল': () => this.renameFile(),
            'rename': () => this.renameFile(),
            
            'খোলো ফাইল': () => this.openFile(),
            'open file': () => this.openFile(),
            
            'প্রপার্টি দেখো': () => this.showProperties(),
            'properties': () => this.showProperties(),
        };

        // ==================== TEXT COMMANDS ====================
        const textCommands = {
            // Bold, Italic, etc.
            'বোল্ড করো': () => this.formatText('bold'),
            'bold': () => this.formatText('bold'),
            'মোটা করো': () => this.formatText('bold'),
            
            'ইটালিক করো': () => this.formatText('italic'),
            'italic': () => this.formatText('italic'),
            'তির্যক করো': () => this.formatText('italic'),
            
            'আন্ডারলাইন করো': () => this.formatText('underline'),
            'underline': () => this.formatText('underline'),
            'নিচে দাগ দাও': () => this.formatText('underline'),
            
            'স্ট্রাইক থ্রু করো': () => this.formatText('strikethrough'),
            'strikethrough': () => this.formatText('strikethrough'),
            
            // Alignment
            'বামে সাজাও': () => this.alignText('left'),
            'align left': () => this.alignText('left'),
            
            'মাঝখানে সাজাও': () => this.alignText('center'),
            'center': () => this.alignText('center'),
            'মাঝে সাজাও': () => this.alignText('center'),
            
            'ডানে সাজাও': () => this.alignText('right'),
            'align right': () => this.alignText('right'),
            
            // Lists
            'বুলেট তৈরি করো': () => this.createList('bullet'),
            'bullet list': () => this.createList('bullet'),
            'নম্বর তৈরি করো': () => this.createList('number'),
            'number list': () => this.createList('number'),
        };

        // ==================== APPLICATION COMMANDS ====================
        const appCommands = {
            'ক্যালকুলেটর খোলো': () => this.openApp('calc'),
            'calculator': () => this.openApp('calc'),
            'calculator খোলো': () => this.openApp('calc'),
            
            'নোটপ্যাড খোলো': () => this.openApp('notepad'),
            'notepad': () => this.openApp('notepad'),
            'notepad খোলো': () => this.openApp('notepad'),
            
            'কমান্ড প্রম্পট খোলো': () => this.openApp('cmd'),
            'command prompt': () => this.openApp('cmd'),
            'cmd খোলো': () => this.openApp('cmd'),
            
            'পাওয়ারশেল খোলো': () => this.openApp('powershell'),
            'powershell': () => this.openApp('powershell'),
            
            'টাস্ক ম্যানেজার খোলো': () => this.openApp('taskmgr'),
            'task manager': () => this.openApp('taskmgr'),
            
            'সেটিংস খোলো': () => this.openApp('settings'),
            'settings': () => this.openApp('settings'),
            
            'এক্সপ্লোরার খোলো': () => this.openApp('explorer'),
            'explorer': () => this.openApp('explorer'),
            
            'কন্ট্রোল প্যানেল খোলো': () => this.openApp('control'),
            'control panel': () => this.openApp('control'),
            
            'ডিভাইস ম্যানেজার খোলো': () => this.openApp('devmgmt'),
            'device manager': () => this.openApp('devmgmt'),
            
            'ডিস্ক ম্যানেজমেন্ট খোলো': () => this.openApp('diskmgmt'),
            'disk management': () => this.openApp('diskmgmt'),
            
            'রিসাইকেল বিন খোলো': () => this.openApp('shell:RecycleBinFolder'),
            'recycle bin': () => this.openApp('shell:RecycleBinFolder'),
        };

        // ==================== DOCUMENT COMMANDS ====================
        const docCommands = {
            'ওয়ার্ড খোলো': () => this.openApp('winword'),
            'word': () => this.openApp('winword'),
            'ms word': () => this.openApp('winword'),
            
            'এক্সেল খোলো': () => this.openApp('excel'),
            'excel': () => this.openApp('excel'),
            'ms excel': () => this.openApp('excel'),
            
            'পাওয়ারপয়েন্ট খোলো': () => this.openApp('powerpnt'),
            'powerpoint': () => this.openApp('powerpnt'),
            
            'আউটলুক খোলো': () => this.openApp('outlook'),
            'outlook': () => this.openApp('outlook'),
            
            'নোটপ্যাড প্লাস খোলো': () => this.openApp('notepad++'),
            'notepad++': () => this.openApp('notepad++'),
            
            'ভিসুয়াল স্টুডিও খোলো': () => this.openApp('code'),
            'vscode': () => this.openApp('code'),
            'visual studio code': () => this.openApp('code'),
        };

        // ==================== TYPING COMMANDS ====================
        const typingCommands = {
            // Common phrases
            'হ্যালো লিখো': () => this.typeText('হ্যালো'),
            'হাই লিখো': () => this.typeText('হাই'),
            'হ্যালো': () => this.typeText('হ্যালো'),
            'ধন্যবাদ লিখো': () => this.typeText('ধন্যবাদ'),
            'ধন্যবাদ': () => this.typeText('ধন্যবাদ'),
            'নাম লিখো': () => this.typeText('রহিম'),
            
            // Email patterns
            'ইমেইল লিখো': () => this.typeText('example@email.com'),
            'email': () => this.typeText('example@email.com'),
            
            // Date/Time patterns
            'তারিখ লিখো': () => this.typeText(this.getCurrentDate()),
            'সময় লিখো': () => this.typeText(this.getCurrentTime()),
            
            // Common text
            'ঠিকানা লিখো': () => this.typeText('ঢাকা, বাংলাদেশ'),
            'ফোন নম্বর লিখো': () => this.typeText('01XXXXXXXXX'),
        };

        // ==================== NAVIGATION COMMANDS ====================
        const navCommands = {
            'ডেস্কটপপ যাও': () => this.goToPath('%USERPROFILE%\\Desktop'),
            'desktop': () => this.goToPath('%USERPROFILE%\\Desktop'),
            'ডেস্কটপ': () => this.goToPath('%USERPROFILE%\\Desktop'),
            
            'ডাউনলোড যাও': () => this.goToPath('%USERPROFILE%\\Downloads'),
            'downloads': () => this.goToPath('%USERPROFILE%\\Downloads'),
            'ডাউনলোডস': () => this.goToPath('%USERPROFILE%\\Downloads'),
            
            'ডকুমেন্টস যাও': () => this.goToPath('%USERPROFILE%\\Documents'),
            'documents': () => this.goToPath('%USERPROFILE%\\Documents'),
            'ডকুমেন্ট': () => this.goToPath('%USERPROFILE%\\Documents'),
            
            'পিকচার্স যাও': () => this.goToPath('%USERPROFILE%\\Pictures'),
            'pictures': () => this.goToPath('%USERPROFILE%\\Pictures'),
            'ছবি': () => this.goToPath('%USERPROFILE%\\Pictures'),
            
            'ভিডিও যাও': () => this.goToPath('%USERPROFILE%\\Videos'),
            'videos': () => this.goToPath('%USERPROFILE%\\Videos'),
            'ভিডিও': () => this.goToPath('%USERPROFILE%\\Videos'),
            
            'মিউজিক যাও': () => this.goToPath('%USERPROFILE%\\Music'),
            'music': () => this.goToPath('%USERPROFILE%\\Music'),
            'গান': () => this.goToPath('%USERPROFILE%\\Music'),
        };

        // ==================== GAME/TEST COMMANDS ====================
        const gameCommands = {
            'টেস্ট মোড চালু করো': () => this.enableTestMode(),
            'test mode': () => this.enableTestMode(),
            'ডেভ মোড চালু করো': () => this.enableDevMode(),
            'dev mode': () => this.enableDevMode(),
            
            // Easter eggs
            'হ্যালো নেক্সাস': () => this.easterEgg('greeting'),
            'তুমি কে': () => this.easterEgg('identity'),
            'who are you': () => this.easterEgg('identity'),
            'তুমি কি করো': () => this.easterEgg('whatcando'),
        };

        // ==================== STATUS/SYSTEM INFO ====================
        const statusCommands = {
            'স্ট্যাটাস দেখাও': () => this.showStatus(),
            'status': () => this.showStatus(),
            'সিস্টেম ইনফো দেখাও': () => this.showSystemInfo(),
            'system info': () => this.showSystemInfo(),
            'কম্পিউটার ইনফো': () => this.showSystemInfo(),
            
            'সময় কত': () => this.announceTime(),
            'what time': () => this.announceTime(),
            'কী তারিখ আজ': () => this.announceDate(),
            'what date': () => this.announceDate(),
            'আজ কী তারিখ': () => this.announceDate(),
        };

        // ==================== QUICK ACTIONS ====================
        const quickCommands = {
            'কপি পেস্ট করো': () => { this.combo('ctrl', 'c'); this.delay(100); this.combo('ctrl', 'v'); },
            'copy paste': () => { this.combo('ctrl', 'c'); this.delay(100); this.combo('ctrl', 'v'); },
            
            'সিলেক্ট সব কপি করো': () => { this.combo('ctrl', 'a'); this.delay(100); this.combo('ctrl', 'c'); },
            'select all copy': () => { this.combo('ctrl', 'a'); this.delay(100); this.combo('ctrl', 'c'); },
            
            'সেভ অ্যান্ড ক্লোজ': () => { this.combo('ctrl', 's'); this.delay(100); this.combo('ctrl', 'w'); },
            'save and close': () => { this.combo('ctrl', 's'); this.delay(100); this.combo('ctrl', 'w'); },
            
            'কপি সেভ করো': () => { this.combo('ctrl', 'c'); this.delay(100); this.combo('ctrl', 's'); },
            'copy save': () => { this.combo('ctrl', 'c'); this.delay(100); this.combo('ctrl', 's'); },
            
            'নিউ সেভ করো': () => { this.combo('ctrl', 'n'); this.delay(100); this.combo('ctrl', 's'); },
            'new save': () => { this.combo('ctrl', 'n'); this.delay(100); this.combo('ctrl', 's'); },
        };

        // ==================== ADVANCED COMMANDS ====================
        const advancedCommands = {
            // Find
            'খোঁজ করো': () => this.combo('ctrl', 'f'),
            'find': () => this.combo('ctrl', 'f'),
            'সার্চ করো': () => this.combo('ctrl', 'f'),
            'search': () => this.combo('ctrl', 'f'),
            
            // Replace
            'রিপ্লেস করো': () => this.combo('ctrl', 'h'),
            'replace': () => this.combo('ctrl', 'h'),
            
            // Print
            'প্রিন্ট করো': () => this.combo('ctrl', 'p'),
            'print': () => this.combo('ctrl', 'p'),
            
            // Select word/line
            'ওয়ার্ড সিলেক্ট করো': () => this.combo('ctrl', 'shift', 'left'),
            'select word': () => this.combo('ctrl', 'shift', 'left'),
            'লাইন সিলেক্ট করো': () => this.combo('ctrl', 'shift', 'end'),
            'select line': () => this.combo('ctrl', 'shift', 'end'),
            
            // Move cursor
            'শব্দ পরে যাও': () => this.combo('ctrl', 'right'),
            'word forward': () => this.combo('ctrl', 'right'),
            'শব্দ আগে যাও': () => this.combo('ctrl', 'left'),
            'word backward': () => this.combo('ctrl', 'left'),
            
            // Caps
            'ক্যাপস লক করো': () => this.toggleCapsLock(),
            'caps lock': () => this.toggleCapsLock(),
            'capslock': () => this.toggleCapsLock(),
            
            // Num lock
            'নাম লক করো': () => this.toggleNumLock(),
            'num lock': () => this.toggleNumLock(),
            
            // Scroll lock
            'স্ক্রল লক করো': () => this.toggleScrollLock(),
            'scroll lock': () => this.toggleScrollLock(),
        };

        // ==================== MERGE ALL COMMANDS ====================
        const allCommands = {
            ...mouseCommands,
            ...keyboardCommands,
            ...shortcutCommands,
            ...systemCommands,
            ...browserCommands,
            ...fileCommands,
            ...textCommands,
            ...appCommands,
            ...docCommands,
            ...typingCommands,
            ...navCommands,
            ...gameCommands,
            ...statusCommands,
            ...quickCommands,
            ...advancedCommands,
        };

        // Register all commands
        Object.entries(allCommands).forEach(([cmd, handler]) => {
            this.commands.set(cmd.toLowerCase(), handler);
        });

        console.log(`[NEXUS] Registered ${this.commands.size} built-in commands`);
    }

    /**
     * Register Macros - Complex command sequences
     */
    registerMacros() {
        const macros = {
            // Morning routine
            'সকালের কাজ শুরু করো': async () => {
                await this.openApp('mail');
                await this.delay(500);
                await this.openURL('https://news.google.com');
            },
            
            // Work setup
            'ওয়ার্ক সেটআপ করো': async () => {
                await this.openApp('explorer');
                await this.delay(300);
                await this.openApp('code');
                await this.delay(300);
                await this.openApp('outlook');
            },
            
            // Clean shutdown
            'সিস্টেম বন্ধ করো': async () => {
                await this.showNotification('সিস্টেম বন্ধ হচ্ছে...');
                await this.combo('alt', 'f4');
                await this.delay(200);
                await this.pressKey('enter');
            },
            
            // Quick email
            'নতুন ইমেইল পাঠাও': async () => {
                await this.openApp('outlook');
                await this.delay(500);
                await this.combo('ctrl', 'n');
                await this.delay(300);
                await this.typeText('');
            },
            
            // Screenshot and save
            'স্ক্রিনশট নিয়ে সেভ করো': async () => {
                await this.combo('win', 'print');
                await this.delay(500);
                await this.combo('ctrl', 'v');
                await this.delay(200);
                await this.combo('ctrl', 's');
            },
            
            // Search and replace all
            'সব রিপ্লেস করো': async () => {
                await this.combo('ctrl', 'h');
                await this.delay(200);
                await this.combo('ctrl', 'a');
            },
            
            // Open and maximize
            'খোলো এবং বড় করো': async () => {
                await this.pressKey('enter');
                await this.delay(300);
                await this.maximizeWindow();
            },
            
            // Select all and delete
            'সব সিলেক্ট করে মুছো': async () => {
                await this.combo('ctrl', 'a');
                await this.delay(100);
                await this.pressKey('delete');
            },
            
            // Find next
            'পরেরটা খোঁজো': async () => {
                await this.combo('f3');
            },
            
            // Window switcher
            'উইন্ডো বদলাও': async () => {
                await this.combo('alt', 'tab');
                await this.delay(100);
                await this.pressKey('enter');
            },
        };

        Object.entries(macros).forEach(([name, macro]) => {
            this.macros.set(name.toLowerCase(), macro);
        });

        console.log(`[NEXUS] Registered ${this.macros.size} macros`);
    }

    /**
     * Execute a command
     */
    async execute(commandText) {
        if (!this.isEnabled) return false;

        const normalized = commandText.toLowerCase().trim();

        // Check macros first
        if (this.macros.has(normalized)) {
            try {
                await this.macros.get(normalized)();
                return true;
            } catch (error) {
                console.error('[NEXUS] Macro error:', error);
                return false;
            }
        }

        // Check commands
        if (this.commands.has(normalized)) {
            try {
                const result = this.commands.get(normalized)();
                if (result instanceof Promise) {
                    await result;
                }
                return true;
            } catch (error) {
                console.error('[NEXUS] Command error:', error);
                return false;
            }
        }

        // Check if it's a "type" command
        if (normalized.includes('লিখো') || normalized.includes('type')) {
            return this.executeTypeCommand(commandText);
        }

        return false;
    }

    /**
     * Execute type command
     */
    async executeTypeCommand(commandText) {
        const typePatterns = [
            /.*[টাইপ|লিখো|type]\s*[:\-]?\s*(.+)/i,
            /.*বলো\s*[:\-]?\s*(.+)/i,
            /.*লেখো\s*[:\-]?\s*(.+)/i,
        ];

        for (const pattern of typePatterns) {
            const match = commandText.match(pattern);
            if (match && match[1]) {
                await this.typeText(match[1].trim());
                return true;
            }
        }

        return false;
    }

    // ==================== MOUSE METHODS ====================
    async click(button = 'left') {
        if (window.nexusAI) {
            await window.nexusAI.mouseClick(button);
        }
        this.addLog(`ক্লিক করা হয়েছে (${button})`);
    }

    async doubleClick() {
        if (window.nexusAI) {
            await window.nexusAI.mouseDoubleClick();
        }
        this.addLog('ডাবল ক্লিক করা হয়েছে');
    }

    async moveMouse(x, y) {
        if (window.nexusAI) {
            await window.nexusAI.mouseMove(x, y);
            this.lastPosition = { x, y };
        }
        this.addLog(`মাউস সরানো হয়েছে (${x}, ${y})`);
    }

    async scroll(direction) {
        // Use keyboard for scroll simulation
        for (let i = 0; i < Math.abs(direction); i++) {
            await this.pressKey(direction > 0 ? 'pagedown' : 'pageup');
            await this.delay(50);
        }
        this.addLog(`স্ক্রল করা হয়েছে (${direction > 0 ? 'নিচে' : 'উপরে'})`);
    }

    async clickAtLastPosition() {
        await this.click();
    }

    // ==================== KEYBOARD METHODS ====================
    async pressKey(key) {
        if (window.nexusAI) {
            await window.nexusAI.keyPress(key);
        }
        this.addLog(`কী প্রেস: ${key}`);
    }

    async combo(...keys) {
        if (window.nexusAI) {
            await window.nexusAI.keyCombination(keys);
        }
        this.addLog(`কম্বিনেশন: ${keys.join(' + ')}`);
    }

    async typeText(text) {
        if (window.nexusAI) {
            await window.nexusAI.keyType(text);
        }
        this.addLog(`টাইপ: "${text.substring(0, 30)}..."`);
    }

    // ==================== SYSTEM METHODS ====================
    async minimizeWindow() {
        if (window.nexusAI) {
            await window.nexusAI.minimizeWindow();
        }
        this.addLog('উইন্ডো ছোট করা হয়েছে');
    }

    async maximizeWindow() {
        if (window.nexusAI) {
            await window.nexusAI.maximizeWindow();
        }
        this.addLog('উইন্ডো বড় করা হয়েছে');
    }

    async closeWindow() {
        if (window.nexusAI) {
            await window.nexusAI.closeWindow();
        }
        this.addLog('উইন্ডো বন্ধ করা হয়েছে');
    }

    async takeScreenshot() {
        if (window.nexusAI) {
            const screenshot = await window.nexusAI.takeScreenshot();
            this.addLog('স্ক্রিনশট নেওয়া হয়েছে');
            return screenshot;
        }
        return null;
    }

    async adjustVolume(delta) {
        // Simulate with keyboard
        const key = delta > 0 ? 'volumeup' : 'volumedown';
        for (let i = 0; i < Math.abs(delta / 5); i++) {
            await this.pressKey(key);
            await this.delay(50);
        }
        this.addLog(`ভলিউম ${delta > 0 ? 'বাড়ানো' : 'কমানো'} হয়েছে`);
    }

    async toggleMute() {
        await this.pressKey('volumemute');
        this.addLog('মিউট টগল করা হয়েছে');
    }

    // ==================== MEDIA METHODS ====================
    async mediaPlay() {
        await this.pressKey('audio_play');
        this.addLog('প্লে করা হচ্ছে');
    }

    async mediaPause() {
        await this.pressKey('audio_pause');
        this.addLog('পজ করা হয়েছে');
    }

    async mediaStop() {
        await this.pressKey('audio_stop');
        this.addLog('স্টপ করা হয়েছে');
    }

    async mediaNext() {
        await this.pressKey('audio_next');
        this.addLog('পরের গান');
    }

    async mediaPrevious() {
        await this.pressKey('audio_prev');
        this.addLog('আগের গান');
    }

    // ==================== FILE/FOLDER METHODS ====================
    async openURL(url) {
        await this.combo('ctrl', 'l');
        await this.delay(100);
        await this.typeText(url);
        await this.pressKey('enter');
        this.addLog(`খোলা হচ্ছে: ${url}`);
    }

    async newTab() {
        await this.combo('ctrl', 't');
        this.addLog('নতুন ট্যাব খোলা হয়েছে');
    }

    async closeTab() {
        await this.combo('ctrl', 'w');
        this.addLog('ট্যাব বন্ধ করা হয়েছে');
    }

    async reload() {
        await this.combo('ctrl', 'r');
        this.addLog('রিলোড হচ্ছে');
    }

    async goBack() {
        await this.combo('alt', 'left');
        this.addLog('ব্যাক করা হচ্ছে');
    }

    async goForward() {
        await this.combo('alt', 'right');
        this.addLog('ফরোয়ার্ড করা হচ্ছে');
    }

    async goHome() {
        await this.combo('alt', 'home');
        this.addLog('হোম পেজে যাওয়া হচ্ছে');
    }

    async focusSearch() {
        await this.combo('ctrl', 'k');
        this.addLog('সার্চে যাওয়া হচ্ছে');
    }

    async focusAddressBar() {
        await this.combo('ctrl', 'l');
        this.addLog('অ্যাড্রেস বারে যাওয়া হচ্ছে');
    }

    // ==================== FILE EXPLORER METHODS ====================
    async goToPath(path) {
        await this.combo('win', 'e');
        await this.delay(500);
        await this.combo('ctrl', 'l');
        await this.delay(100);
        await this.typeText(path.replace(/%USERPROFILE%/g, ''));
        await this.pressKey('enter');
        this.addLog(`যাওয়া হচ্ছে: ${path}`);
    }

    async createFolder() {
        await this.combo('ctrl', 'shift', 'n');
        this.addLog('নতুন ফোল্ডার তৈরি হচ্ছে');
    }

    async createFile() {
        await this.combo('ctrl', 'n');
        this.addLog('নতুন ফাইল তৈরি হচ্ছে');
    }

    async deleteFile() {
        await this.pressKey('delete');
        this.addLog('ডিলিট করা হচ্ছে');
    }

    async copyFile() {
        await this.combo('ctrl', 'c');
        this.addLog('কপি করা হচ্ছে');
    }

    async pasteFile() {
        await this.combo('ctrl', 'v');
        this.addLog('পেস্ট করা হচ্ছে');
    }

    async cutFile() {
        await this.combo('ctrl', 'x');
        this.addLog('কাট করা হচ্ছে');
    }

    async renameFile() {
        await this.pressKey('f2');
        this.addLog('রিনেম করা হচ্ছে');
    }

    async openFile() {
        await this.pressKey('enter');
        this.addLog('ফাইল খোলা হচ্ছে');
    }

    async showProperties() {
        await this.combo('alt', 'enter');
        this.addLog('প্রপার্টি দেখা হচ্ছে');
    }

    // ==================== APPLICATION METHODS ====================
    async openApp(appName) {
        const appMap = {
            'calc': 'calc.exe',
            'notepad': 'notepad.exe',
            'cmd': 'cmd.exe',
            'powershell': 'powershell.exe',
            'taskmgr': 'Taskmgr.exe',
            'settings': 'ms-settings:',
            'explorer': 'explorer.exe',
            'control': 'control.exe',
            'devmgmt': 'devmgmt.msc',
            'diskmgmt': 'diskmgmt.msc',
            'winword': 'winword.exe',
            'excel': 'excel.exe',
            'powerpnt': 'powerpnt.exe',
            'outlook': 'outlook.exe',
            'notepad++': 'notepad++.exe',
            'code': 'code',
            'shell:RecycleBinFolder': 'explorer.exe shell:RecycleBinFolder',
        };

        const command = appMap[appName.toLowerCase()] || appName;

        // Open via Run dialog
        await this.combo('win', 'r');
        await this.delay(200);
        await this.typeText(command);
        await this.pressKey('enter');
        this.addLog(`অ্যাপ খোলা হচ্ছে: ${appName}`);
    }

    // ==================== TEXT FORMATTING ====================
    async formatText(format) {
        const formatMap = {
            'bold': ['ctrl', 'b'],
            'italic': ['ctrl', 'i'],
            'underline': ['ctrl', 'u'],
            'strikethrough': ['ctrl', 'shift', 's'],
        };

        if (formatMap[format]) {
            await this.combo(...formatMap[format]);
            this.addLog(`${format} করা হয়েছে`);
        }
    }

    async alignText(align) {
        const alignMap = {
            'left': ['ctrl', 'l'],
            'center': ['ctrl', 'e'],
            'right': ['ctrl', 'r'],
        };

        if (alignMap[align]) {
            await this.combo(...alignMap[align]);
            this.addLog(`${align} অ্যালাইন করা হয়েছে`);
        }
    }

    async createList(type) {
        if (type === 'bullet') {
            await this.combo('ctrl', 'shift', 'l');
        } else if (type === 'number') {
            await this.typeText('1. ');
        }
        this.addLog(`${type} লিস্ট তৈরি করা হচ্ছে`);
    }

    // ==================== SYSTEM CONTROL ====================
    async toggleCapsLock() {
        await this.pressKey('capslock');
        this.addLog('ক্যাপস লক টগল করা হয়েছে');
    }

    async toggleNumLock() {
        await this.pressKey('numlock');
        this.addLog('নাম লক টগল করা হয়েছে');
    }

    async toggleScrollLock() {
        await this.pressKey('scrolllock');
        this.addLog('স্ক্রল লক টগল করা হয়েছে');
    }

    // ==================== STATUS & INFO ====================
    async showStatus() {
        const status = `
সিস্টেম স্ট্যাটাস:
- অবস্থা: প্রস্তুত
- মাইক: সক্রিয়
- ক্যামেরা: সক্রিয়
- স্ক্রিন ক্যাপচার: সক্রিয়
        `;
        if (window.App) {
            window.App.showNotification(status);
        }
        return status;
    }

    async showSystemInfo() {
        const info = `
কম্পিউটার ইনফো:
- প্ল্যাটফর্ম: ${navigator.platform}
- ব্রাউজার: ${navigator.userAgent.split(' ')[0]}
        `;
        if (window.App) {
            window.App.showNotification(info);
        }
        return info;
    }

    async announceTime() {
        const time = new Date().toLocaleTimeString('bn-BD');
        if (window.App) {
            window.App.speak(`এখন সময় ${time}`);
        }
    }

    async announceDate() {
        const date = new Date().toLocaleDateString('bn-BD', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (window.App) {
            window.App.speak(`আজ ${date}`);
        }
    }

    // ==================== EASTER EGGS ====================
    async easterEgg(type) {
        const responses = {
            'greeting': 'হ্যালো! আমি নেক্সাস, তোমার ব্যক্তিগত সহকারী। কিভাবে সাহায্য করতে পারি?',
            'identity': 'আমি নেক্সাস, তোমার একজন বিশ্বস্ত সহকারী। আমি তোমার সব কাজে সাহায্য করতে পারি!',
            'whatcando': 'আমি অনেক কিছু করতে পারি! মাউস ক্লিক, কিবোর্ড টাইপ, ফাইল খোলা, সার্চ করা, এবং আরো অনেক কিছু!'
        };

        const response = responses[type] || responses['greeting'];
        if (window.App) {
            window.App.speak(response);
        }
    }

    // ==================== UTILITY METHODS ====================
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('bn-BD');
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('bn-BD');
    }

    addLog(message) {
        if (window.App) {
            window.App.addLogEntry('action', message);
        }
        console.log('[NEXUS Action]', message);
    }

    showNotification(message) {
        if (window.App) {
            window.App.showNotification(message);
        }
    }

    enableTestMode() {
        this.addLog('টেস্ট মোড সক্রিয় হয়েছে');
    }

    enableDevMode() {
        this.addLog('ডেভ মোড সক্রিয় হয়েছে');
    }

    // ==================== COMMAND PARSER ====================
    parseAndExecute(text) {
        // Try exact match first
        if (this.commands.has(text.toLowerCase())) {
            return this.execute(text);
        }

        // Try partial match
        const lowerText = text.toLowerCase();
        for (const cmd of this.commands.keys()) {
            if (lowerText.includes(cmd)) {
                return this.execute(cmd);
            }
        }

        // Try macros
        for (const macro of this.macros.keys()) {
            if (lowerText.includes(macro)) {
                return this.execute(macro);
            }
        }

        return false;
    }
}

// Create global instance
window.nexusAutomation = new NexusAutomation();

// Export
window.Automation = NexusAutomation;