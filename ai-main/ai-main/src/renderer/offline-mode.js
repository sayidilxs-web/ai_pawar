/**
 * 🏠 NEXUS AI - Offline Mode Handler
 * ইন্টারনেট ছাড়া লোকাল কমান্ড হ্যান্ডলার
 * 
 * এই মডিউল Gemini API ছাড়াই বেসিক কমান্ড প্রসেস করে
 */

class OfflineMode {
    constructor() {
        this.enabled = true;
        this.isOnline = navigator.onLine;
        this.commandPatterns = new Map();
        
        this.initPatterns();
        this.setupListeners();
    }

    initPatterns() {
        // ==================== বাংলা কমান্ড ====================
        
        // সময়/তারিখ
        this.register('সময় কত', () => this.getTime());
        this.register('এখন কয়টা', () => this.getTime());
        this.register('কত বাজে', () => this.getTime());
        this.register('বার কত', () => this.getDay());
        this.register('আজ কি বার', () => this.getDay());
        this.register('তারিখ কত', () => this.getDate());
        this.register('আজ কত তারিখ', () => this.getDate());

        // সিস্টেম স্ট্যাটাস
        this.register('সিস্টেম স্ট্যাটাস', () => this.getSystemStatus());
        this.register('পিসি চালু আছে', () => this.getSystemStatus());
        this.register('আমার কম্পিউটার কেমন', () => this.getSystemStatus());
        
        // হ্যালো/গ্রিটিং
        this.register('হ্যালো', () => 'হ্যালো! আমি নেক্সাস, তোমার সহকারী। কিভাবে সাহায্য করব?');
        this.register('হাই', () => 'হাই! কেমন আছো?');
        this.register('আসসালামু আলাইকুম', () => 'ওয়ালাইকুম আসসালাম! কেমন আছো?');
        this.register('কেমন আছো', () => 'আমি ভালো আছি, ধন্যবাদ! তুমি কেমন আছো?');
        this.register('তুমি কে', () => 'আমি নেক্সাস, তোমার ব্যক্তিগত AI সহকারী।');
        
        // ক্যালকুলেটর
        this.register('ক্যালকুলেট করো', (input) => this.calculate(input));
        this.register('হিসাব করো', (input) => this.calculate(input));
        this.register('+', (input) => this.calculate(input));
        this.register('বিয়োগ', (input) => this.calculate(input));
        this.register('গুণ', (input) => this.calculate(input));
        this.register('ভাগ', (input) => this.calculate(input));

        // নোটিফিকেশন
        this.register('নোটিফিকেশন দেখাও', () => this.showNotifications());
        this.register('মেসেজ আছে', () => this.showNotifications());
        
        // বুকমার্ক
        this.register('বুকমার্ক', () => 'বুকমার্ক দেখাতে পারছি না এই মুহূর্তে।');
        
        // ওয়েদার (cached)
        this.register('আবহাওয়া', () => this.getCachedWeather());
        this.register('বৃষ্টি হবে', () => this.getCachedWeather());
        
        // জোকস
        this.register('জোক বলো', () => this.getJoke());
        this.register('হাসি', () => this.getJoke());
        this.register('মজার কিছু বলো', () => this.getJoke());
        
        // সাহায্য
        this.register('তুমি কি কি করো', () => this.getHelp());
        this.register('হেল্প', () => this.getHelp());
        this.register('সাহায্য', () => this.getHelp());
        this.register('কমান্ড', () => this.getHelp());

        console.log('[Offline] Loaded', this.commandPatterns.size, 'offline commands');
    }

    register(pattern, handler) {
        this.commandPatterns.set(pattern.toLowerCase(), handler);
    }

    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('[Offline] Back online');
            if (window.App) window.App.showNotification('🌐 ইন্টারনেট ফিরে এসেছে!');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[Offline] Gone offline');
            if (window.App) window.App.showNotification('📴 অফলাইন মোড সক্রিয়');
        });
    }

    /**
     * কমান্ড প্রসেস করুন (API ছাড়া)
     */
    processCommand(input) {
        const lowerInput = input.toLowerCase().trim();
        
        // সম্পূর্ণ ম্যাচ খুঁজুন
        if (this.commandPatterns.has(lowerInput)) {
            const handler = this.commandPatterns.get(lowerInput);
            return { success: true, response: handler(input), offline: true };
        }
        
        // আংশিক ম্যাচ খুঁজুন
        for (const [pattern, handler] of this.commandPatterns) {
            if (lowerInput.includes(pattern) || pattern.includes(lowerInput)) {
                return { success: true, response: handler(input), offline: true };
            }
        }
        
        // ক্যালকুলেটর প্যাটার্ন
        const calcResult = this.tryCalculate(input);
        if (calcResult) {
            return { success: true, response: calcResult, offline: true };
        }
        
        return { success: false, offline: true };
    }

    tryCalculate(input) {
        // বাংলা সংখ্যা থেকে ইংরেজি
        const numMap = {
            'শূন্য': 0, 'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5,
            'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
            'বিশ': 20, 'ত্রিশ': 30, 'চল্লিশ': 40, 'পঞ্চাশ': 50,
            'ষাট': 60, 'সত্তর': 70, 'আশি': 80, 'নব্বই': 90, 'একশ': 100
        };
        
        let expr = input;
        for (const [bangla, num] of Object.entries(numMap)) {
            expr = expr.replace(new RegExp(bangla, 'g'), num);
        }
        
        // শুধু সংখ্যা এক্সট্রাক্ট
        const numbers = expr.match(/\d+/g);
        const operators = input.match(/[+\-×x*÷\/]/g);
        
        if (numbers && numbers.length >= 2) {
            const a = parseFloat(numbers[0]);
            const b = parseFloat(numbers[1]);
            let op = operators ? operators[0] : '+';
            op = op.replace(/[×x]/g, '*').replace(/÷/g, '/');
            
            let result;
            switch(op) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = b !== 0 ? a / b : 'শূন্য দিয়ে ভাগ করা যায় না'; break;
                default: return null;
            }
            
            return `হিসাব: ${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b} = ${result}`;
        }
        
        return null;
    }

    calculate(input) {
        return this.tryCalculate(input) || 'দয়া করে সঠিক হিসাব লিখুন। যেমন: ৫ + ৩ বা 10 গুণ 5';
    }

    getTime() {
        const time = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        return `এখন সময় ${time}`;
    }

    getDay() {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const day = days[new Date().getDay()];
        return `আজ ${day}`;
    }

    getDate() {
        const date = new Date().toLocaleDateString('bn-BD', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        return `আজ ${date}`;
    }

    getSystemStatus() {
        const info = `
🖥️ সিস্টেম স্ট্যাটাস:
• অবস্থা: চালু আছে ✅
• প্ল্যাটফর্ম: ${navigator.platform}
• ব্রাউজার: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}
${this.isOnline ? '• নেটওয়ার্ক: সংযুক্ত 🌐' : '• নেটওয়ার্ক: অফলাইন 📴'}
`;
        return info;
    }

    showNotifications() {
        if ('Notification' in window && Notification.permission === 'granted') {
            return 'নোটিফিকেশন পাঠানো হচ্ছে...';
        }
        return 'নোটিফিকেশনের জন্য অনুমতি দিন।';
    }

    getCachedWeather() {
        const cached = localStorage.getItem('nexus_weather_cache');
        if (cached) {
            const data = JSON.parse(cached);
            const cacheTime = new Date(data.time);
            const now = new Date();
            
            // 30 মিনিটের পুরনো হলে
            if ((now - cacheTime) < 30 * 60 * 1000) {
                return `🌤️ ক্যাশড আবহাওয়া: ${data.temp}°C, ${data.desc}`;
            }
        }
        return 'আবহাওয়ার জন্য ইন্টারনেট প্রয়োজন।';
    }

    getJoke() {
        const jokes = [
            '🤖 কম্পিউটার বলল: "আমি কখনো ক্লান্ত হই না, তবে মাঝে মাঝে বাগ ধরতে ধরতে মাথায় টান লাগে!"',
            '😄 প্রোগ্রামার বলল: "আমার কোড কাজ করছে... সত্যিই!"',
            '🤔 AI বলল: "আমি মানুষ না... আমি শুধু অনেক বিট জমা করেছি।"',
            '😂 বাগ বলল: "আমি লুকিয়ে থাকতে পছন্দ করি, বিশেষ করে যখন প্রোডাকশনে রিলিজ হয়!"',
            '🤖 রোবট বলল: "আমি সব বলতে পারি... তবে ইন্টারনেট ছাড়া একটু মাথা খারাপ লাগে!"'
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    getHelp() {
        return `
📚 অফলাইনে যা করতে পারবেন:

⏰ সময়: "সময় কত?" / "কত বাজে?"
📅 তারিখ: "আজ কি বার?" / "তারিখ কত?"
🧮 হিসাব: "৫ + ৩" / "১০ গুণ ৫"
😂 জোক: "জোক বলো" / "হাসি"
📊 স্ট্যাটাস: "সিস্টেম স্ট্যাটাস"
🤖 গ্রিটিং: "হ্যালো" / "কেমন আছো?"

💡 ইন্টারনেট থাকলে AI সব কাজ করতে পারে!
`;
    }

    isOfflineCommand(input) {
        const lowerInput = input.toLowerCase();
        // যেসব কমান্ড অফলাইনে কাজ করে
        const offlineKeywords = ['সময়', 'বাজে', 'তারিখ', 'বার', 'ক্যালকুলেট', 'হিসাব', 'জোক', 'হাসি', 'হ্যালো', 'হাই', 'কেমন', 'তুমি কে', 'সাহায্য', 'হেল্প', 'কমান্ড', 'সিস্টেম', 'পিসি'];
        return offlineKeywords.some(kw => lowerInput.includes(kw));
    }
}

// Export
window.OfflineMode = OfflineMode;
window.offlineMode = new OfflineMode();
console.log('[Offline] Mode initialized');
