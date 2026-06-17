/**
 * NEXUS AI - Locale Strings (Bengali)
 * লোকাল স্ট্রিংস
 */

const Locale = {
    // App
    app: {
        name: 'NEXUS AI',
        version: 'ভার্সন',
        loading: 'লোড হচ্ছে...',
        ready: 'প্রস্তুত'
    },
    
    // Status
    status: {
        ready: 'প্রস্তুত',
        listening: 'শুনছি...',
        processing: 'ভাবছি...',
        speaking: 'বলছি...',
        error: 'সমস্যা',
        offline: 'অফলাইন',
        online: 'অনলাইন'
    },
    
    // Actions
    actions: {
        listen: 'শুনুন',
        stop: 'বন্ধ করুন',
        speak: 'বলুন',
        capture: 'স্ক্রিনশট',
        settings: 'সেটিংস',
        close: 'বন্ধ করুন',
        save: 'সেভ করুন',
        cancel: 'বাতিল',
        clear: 'পরিষ্কার করুন',
        refresh: 'রিফ্রেশ',
        retry: 'আবার চেষ্টা'
    },
    
    // Panels
    panels: {
        actions: 'অ্যাকশন লগ',
        response: 'আলোচনা'
    },
    
    // Settings
    settings: {
        title: 'সেটিংস',
        apiKey: 'জেমিনি API কী',
        wakeWord: 'ওয়েক ওয়ার্ড',
        language: 'ভাষা',
        outputLang: 'আউটপুট ভাষা',
        camera: 'ক্যামেরা',
        faceRecognition: 'চেহারা চিনতে পারা',
        screenCapture: 'স্ক্রিন দেখতে পারা',
        autoListen: 'স্বয়ংক্রিয় শোনা'
    },
    
    // Errors
    errors: {
        noApiKey: 'দয়া করে সেটিংসে জেমিনি API কী যোগ করুন।',
        noMicrophone: 'মাইক খুঁজে পাওয়া যায়নি',
        noCamera: 'ক্যামেরা পাওয়া যায়নি',
        networkError: 'ইন্টারনেট সংযোগে সমস্যা',
        unknownError: 'কিছু সমস্যা হয়েছে',
        permissionDenied: 'অনুমতি প্রত্যাখ্যাত'
    },
    
    // Notifications
    notifications: {
        welcome: 'NEXUS AI স্বাগতম!',
        saved: 'সেভ হয়েছে!',
        copied: 'কপি হয়েছে!',
        done: 'হয়ে গেছে!'
    },
    
    // Greetings
    greeting: {
        morning: 'সুপ্রভাত!',
        afternoon: 'শুভ অপরাহ্ন!',
        evening: 'শুভ সন্ধ্যা!',
        night: 'শুভ রাত্রি!',
        hello: 'হ্যালো!'
    },
    
    // Voice
    voice: {
        saySomething: 'কিছু বলুন...',
        listening: 'শুনছি...',
        thinking: 'ভাবছি...',
        speaking: 'বলছি...'
    },
    
    // Screen
    screen: {
        viewing: 'স্ক্রিন দেখছি',
        click: 'ক্লিক করুন',
        doubleClick: 'ডাবল ক্লিক',
        rightClick: 'রাইট ক্লিক',
        type: 'টাইপ করুন'
    }
};

// Export
window.Locale = Locale;