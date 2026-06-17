/**
 * NEXUS AI - Commands Handler
 * কমান্ড হ্যান্ডলার
 */

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.init();
    }
    
    init() {
        // Built-in commands
        this.register('help', this.showHelp.bind(this), 'সাহায্য দেখান');
        this.register('settings', this.openSettings.bind(this), 'সেটিংস খুলুন');
        this.register('screenshot', this.takeScreenshot.bind(this), 'স্ক্রিনশট নিন');
        this.register('clear', this.clearScreen.bind(this), 'স্ক্রিন পরিষ্কার করুন');
        this.register('status', this.showStatus.bind(this), 'স্ট্যাটাস দেখান');
        this.register('version', this.showVersion.bind(this), 'ভার্সন দেখান');
        
        console.log('[Command Handler] Initialized with', this.commands.size, 'commands');
    }
    
    register(name, handler, description, aliases = []) {
        this.commands.set(name, { handler, description });
        
        aliases.forEach(alias => {
            this.aliases.set(alias.toLowerCase(), name);
        });
    }
    
    async execute(input) {
        const normalized = input.toLowerCase().trim();
        
        // Check aliases
        const commandName = this.aliases.get(normalized) || normalized.split(' ')[0];
        
        // Get command arguments
        const args = normalized.split(' ').slice(1).join(' ');
        
        // Find and execute command
        const command = this.commands.get(commandName);
        
        if (command) {
            try {
                await command.handler(args);
                return true;
            } catch (error) {
                console.error('[Command Handler] Error:', error);
                if (window.App) {
                    window.App.showNotification('কমান্ডে সমস্যা হয়েছে');
                }
            }
        }
        
        return false;
    }
    
    async showHelp() {
        const helpText = `
📋 উপলব্ধ কমান্ড:

🔧 সাধারণ:
• help - এই সাহায্য দেখান
• settings - সেটিংস খুলুন
• screenshot - স্ক্রিনশট নিন
• clear - স্ক্রিন পরিষ্কার করুন
• status - সিস্টেম স্ট্যাটাস দেখান
• version - ভার্সন দেখান

🖱️ অটোমেশন:
• click - ক্লিক করুন
• double click - ডাবল ক্লিক
• type [text] - টেক্সট লিখুন

💬 AI:
• ask [question] - প্রশ্ন জিজ্ঞেস করুন
        `;
        
        if (window.App) {
            window.App.speak(helpText);
        }
        
        return helpText;
    }
    
    async openSettings() {
        if (window.App) {
            window.App.showNotification('সেটিংস খোলা হচ্ছে...');
            // Settings modal should open from app.js
            document.getElementById('settingsModal')?.classList.add('active');
        }
    }
    
    async takeScreenshot() {
        if (window.App) {
            window.App.showNotification('স্ক্রিনশট নেওয়া হচ্ছে...');
            window.App.addLogEntry('action', 'স্ক্রিনশট নেওয়া হয়েছে');
        }
    }
    
    async clearScreen() {
        if (window.App) {
            const actionLog = document.getElementById('actionLog');
            const responseLog = document.getElementById('responseLog');
            
            if (actionLog) actionLog.innerHTML = '';
            if (responseLog) responseLog.innerHTML = '';
            
            window.App.showNotification('স্ক্রিন পরিষ্কার হয়েছে');
        }
    }
    
    async showStatus() {
        const status = `
সিস্টেম স্ট্যাটাস:
🎯 অবস্থা: ${AppState?.isListening ? 'শুনছি' : 'প্রস্তুত'}
🤖 AI: ${Config?.apiKey ? 'সক্রিয়' : 'API কী প্রয়োজন'}
📷 ক্যামেরা: ${Config?.faceRecognition?.enabled ? 'চালু' : 'বন্ধ'}
🖥️ স্ক্রিন: ${Config?.screenCapture?.enabled ? 'দেখতে পারছে' : 'বন্ধ'}
        `;
        
        if (window.App) {
            window.App.speak(status);
        }
        
        return status;
    }
    
    async showVersion() {
        const version = `NEXUS AI ভার্সন ${Constants.APP.VERSION}`;
        
        if (window.App) {
            window.App.speak(version);
        }
        
        return version;
    }
    
    getCommands() {
        return Array.from(this.commands.entries()).map(([name, cmd]) => ({
            name,
            description: cmd.description
        }));
    }
}

// Export
window.commandHandler = new CommandHandler();