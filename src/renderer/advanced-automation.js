/**
 * NEXUS AI - Advanced Automation System
 * কোডিং, ফাইল ম্যানেজমেন্ট, GitHub সবকিছু
 */

class AdvancedAutomation {
    constructor() {
        this.supportedLanguages = ['python', 'javascript', 'js', 'c', 'cpp', 'java', 'html', 'css'];
    }

    // ==========================================
    // 🔍 ওয়েব সার্চ ও ব্রাউজিং
    // ==========================================
    
    async webSearch(query) {
        try {
            const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`);
            const html = await response.text();
            
            // Simple extraction
            const results = [];
            const regex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
            let match;
            while ((match = regex.exec(html)) !== null && results.length < 10) {
                const title = match[2].replace(/<[^>]*>/g, '').trim();
                const url = match[1];
                if (title.length > 20 && title.length < 200 && url.includes('.')) {
                    results.push({ title, url });
                }
            }
            
            return {
                query: query,
                results: results.slice(0, 10),
                count: results.length
            };
        } catch (error) {
            return { error: 'সার্চ করতে সমস্যা হয়েছে' };
        }
    }

    async getWebPageContent(url) {
        try {
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            const html = await response.text();
            
            // Extract readable text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const text = tempDiv.innerText.substring(0, 2000);
            
            return {
                url: url,
                content: text,
                length: text.length
            };
        } catch (error) {
            return { error: 'পেজ লোড করতে সমস্যা' };
        }
    }

    // ==========================================
    // 💻 কোড এক্সিকিউশন
    // ==========================================
    
    async executeCode(code, language) {
        // এটি ব্রাউজারে সীমিত, তবে কিছু কাজ করা যায়
        const results = [];
        
        try {
            // JavaScript execute
            if (language === 'javascript' || language === 'js') {
                const logs = [];
                const originalLog = console.log;
                
                console.log = (...args) => {
                    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                    originalLog.apply(console, args);
                };
                
                const result = eval(code);
                console.log = originalLog;
                
                return {
                    success: true,
                    output: logs.join('\n'),
                    result: result !== undefined ? String(result) : null,
                    type: 'javascript'
                };
            }
            
            return { error: `${language} ব্রাউজারে এক্সিকিউট করা যায় না` };
            
        } catch (error) {
            return {
                error: true,
                message: error.message,
                type: language
            };
        }
    }

    // ==========================================
    // 📁 ফাইল ম্যানেজমেন্ট (Electron IPC)
    // ==========================================
    
    async createFile(filename, content) {
        if (window.electronAPI && window.electronAPI.createFile) {
            return await window.electronAPI.createFile(filename, content);
        }
        return { error: 'ফাইল সিস্টেম সাপোর্ট করে না' };
    }

    async readFile(filename) {
        if (window.electronAPI && window.electronAPI.readFile) {
            return await window.electronAPI.readFile(filename);
        }
        return { error: 'ফাইল সিস্টেম সাপোর্ট করে না' };
    }

    async listFiles(directory = '.') {
        if (window.electronAPI && window.electronAPI.listFiles) {
            return await window.electronAPI.listFiles(directory);
        }
        return { error: 'ফাইল সিস্টেম সাপোর্ট করে না' };
    }

    // ==========================================
    // 🖥️ স্ক্রিনশট ও স্ক্রিন কন্ট্রোল
    // ==========================================
    
    async captureScreen() {
        if (window.electronAPI && window.electronAPI.captureScreen) {
            return await window.electronAPI.captureScreen();
        }
        return { error: 'স্ক্রিনশট সাপোর্ট করে না' };
    }

    async getScreenSize() {
        if (window.electronAPI && window.electronAPI.getScreenSize) {
            return await window.electronAPI.getScreenSize();
        }
        return { width: window.screen.width, height: window.screen.height };
    }

    // ==========================================
    // ⌨️ কীবোর্ড শর্টকাট
    // ==========================================
    
    async pressKey(key, modifiers = []) {
        if (window.electronAPI && window.electronAPI.pressKey) {
            return await window.electronAPI.pressKey(key, modifiers);
        }
        return { error: 'কীবোর্ড কন্ট্রোল সাপোর্ট করে না' };
    }

    // ==========================================
    // 🔄 টাস্ক অটোমেশন
    // ==========================================
    
    getTaskCommands() {
        return {
            'open': 'ফাইল/ফোল্ডার খোলা',
            'close': 'অ্যাপ বন্ধ করা',
            'minimize': 'মিনিমাইজ',
            'maximize': 'ম্যাক্সিমাইজ',
            'screenshot': 'স্ক্রিনশট নেওয়া',
            'type': 'টেক্সট টাইপ করা',
            'click': 'ক্লিক করা',
            'scroll': 'স্ক্রোল করা',
            'copy': 'কপি করা',
            'paste': 'পেস্ট করা',
            'selectAll': 'সব সিলেক্ট করা',
            'save': 'সেভ করা',
            'refresh': 'রিফ্রেশ করা',
            'back': 'ব্যাক করা',
            'forward': 'ফরওয়ার্ড করা',
            'tab': 'নতুন ট্যাব',
            'closeTab': 'ট্যাব বন্ধ করা',
            'switchWindow': 'উইন্ডো পরিবর্তন'
        };
    }

    // ==========================================
    // 🎯 ইন্টেলিজেন্ট কমান্ড প্রসেসর
    // ==========================================
    
    async processCommand(query) {
        const lowerQuery = query.toLowerCase();
        
        // স্ক্রিনশট
        if (lowerQuery.includes('স্ক্রিনশট') || lowerQuery.includes('screenshot') || 
            lowerQuery.includes('ছবি তুল') || lowerQuery.includes('screen capture')) {
            const screenshot = await this.captureScreen();
            if (!screenshot.error) {
                return {
                    type: 'screenshot',
                    data: screenshot,
                    response: '📸 স্ক্রিনশট নেওয়া হয়েছে!'
                };
            }
            return screenshot;
        }
        
        // স্ক্রিনশট পাঠানো
        if (lowerQuery.includes('স্ক্রিনশট পাঠাও') || lowerQuery.includes('screenshot পাঠাও')) {
            const screenshot = await this.captureScreen();
            if (!screenshot.error) {
                return {
                    type: 'screenshot_for_telegram',
                    data: screenshot,
                    response: '📸 স্ক্রিনশট নিয়ে Telegram-এ পাঠাচ্ছি...'
                };
            }
        }
        
        // ফাইল তৈরি
        if (lowerQuery.includes('ফাইল তৈরি') || lowerQuery.includes('create file')) {
            const filename = this.extractFilename(query);
            const content = this.extractContent(query);
            if (filename) {
                const result = await this.createFile(filename, content);
                return {
                    type: 'file_created',
                    data: result,
                    response: result.error || `📁 ফাইল তৈরি হয়েছে: ${filename}`
                };
            }
        }
        
        // কোড রান
        const codeMatch = query.match(/```(\w+)?\n?([\s\S]*?)```/);
        if (codeMatch) {
            const language = codeMatch[1] || 'javascript';
            const code = codeMatch[2];
            const result = await this.executeCode(code, language);
            return {
                type: 'code_execution',
                data: result,
                response: result.error || `✅ কোড রান হয়েছে!\n\n${result.output || result.result}`
            };
        }
        
        // ওয়েব সার্চ
        if (lowerQuery.includes('সার্চ করো') || lowerQuery.includes('search') ||
            lowerQuery.includes('খুঁজো') || lowerQuery.includes('google')) {
            const searchQuery = this.extractSearchQuery(query);
            if (searchQuery) {
                const results = await this.webSearch(searchQuery);
                return {
                    type: 'web_search',
                    data: results,
                    response: this.formatSearchResults(results)
                };
            }
        }
        
        // ওয়েবসাইট খোলা
        if (lowerQuery.includes('খোলো') || lowerQuery.includes('ওয়েবসাইট') ||
            lowerQuery.includes('open') || lowerQuery.includes('website')) {
            const url = this.extractUrl(query);
            if (url) {
                return {
                    type: 'open_website',
                    data: { url },
                    response: `🌐 ${url} খোলা হচ্ছে...`
                };
            }
        }
        
        return null;
    }

    // Helper functions
    extractFilename(query) {
        const match = query.match(/(?:ফাইল\s*)?(?:তৈরি\s*করো|create)[:\s]+([^\s]+)/i);
        return match ? match[1] : null;
    }

    extractContent(query) {
        const match = query.match(/বিষয়বস্তু[:\s]+([\s\S]*)$/i);
        return match ? match[1] : 'Empty file';
    }

    extractSearchQuery(query) {
        return query
            .replace(/সার্চ\s*করো/gi, '')
            .replace(/search\s*/gi, '')
            .replace(/খুঁজো/gi, '')
            .replace(/google\s*/gi, '')
            .replace(/গুগল\s*/gi, '')
            .trim();
    }

    extractUrl(query) {
        const match = query.match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/i);
        return match ? match[0] : null;
    }

    formatSearchResults(results) {
        if (results.error) return `❌ ${results.error}`;
        
        let text = `🔍 **সার্চ রেজাল্ট: "${results.query}"**\n━━━━━━━━━━━━━━━\n`;
        results.results.forEach((r, i) => {
            text += `${i + 1}. ${r.title}\n   🔗 ${r.url}\n\n`;
        });
        text += `━━━━━━━━━━━━━━━\n📊 ${results.count}টি রেজাল্ট পাওয়া গেছে`;
        return text;
    }
}

const advancedAutomation = new AdvancedAutomation();
