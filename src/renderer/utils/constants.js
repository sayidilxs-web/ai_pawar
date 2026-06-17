/**
 * NEXUS AI - Constants
 * স্থির মান
 */

const Constants = {
    // App Info
    APP: {
        NAME: 'NEXUS AI',
        VERSION: '1.0.0',
        AUTHOR: 'NEXUS Team',
        DESCRIPTION: 'আপনার ব্যক্তিগত AI সহকারী'
    },
    
    // API
    API: {
        GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        DEFAULT_MODEL: 'gemini-2.0-flash'
    },
    
    // Voice
    VOICE: {
        DEFAULT_LANGUAGE: 'bn-BD',
        DEFAULT_OUTPUT_LANGUAGE: 'bn',
        DEFAULT_WAKE_WORD: 'হ্যালো নেক্সাস',
        RECOGNITION_LANG: 'bn-BD',
        SYNTHESIS_LANG: 'bn-BD'
    },
    
    // UI Colors
    COLORS: {
        PRIMARY: '#00f0ff',
        PRIMARY_DARK: '#0099aa',
        SECONDARY: '#ff00ff',
        ACCENT: '#00ff88',
        WARNING: '#ffaa00',
        DANGER: '#ff3366',
        BG_DARK: '#0a0a0f',
        BG_DARKER: '#050508',
        BG_PANEL: 'rgba(15, 15, 25, 0.85)',
        TEXT_PRIMARY: '#e0e0e0',
        TEXT_SECONDARY: '#8888aa',
        BORDER: 'rgba(0, 240, 255, 0.3)'
    },
    
    // Animation
    ANIMATION: {
        ORB_ROTATION: '20s',
        RING_ROTATION: '10s',
        GLOW_PULSE: '3s',
        CORE_PULSE: '2s'
    },
    
    // Storage Keys
    STORAGE: {
        API_KEY: 'geminiApiKey',
        CONFIG: 'nexusConfig',
        FACES: 'nexusFaces',
        HISTORY: 'nexusHistory'
    },
    
    // Commands
    COMMANDS: {
        CLICK: ['ক্লিক করো', 'ট্যাপ করো', 'ক্লিক', 'ট্যাপ'],
        DOUBLE_CLICK: ['ডাবল ক্লিক করো', 'দুইবার ক্লিক করো'],
        RIGHT_CLICK: ['রাইট ক্লিক করো', 'রাইট ক্লিক'],
        TYPE: ['টাইপ করো', 'লিখো', 'টাইপ'],
        SELECT_ALL: ['সিলেক্ট অল', 'সব সিলেক্ট করো'],
        COPY: ['কপি করো'],
        PASTE: ['পেস্ট করো'],
        CUT: ['কাট করো'],
        UNDO: ['আনডু করো'],
        REDO: ['রিডু করো'],
        SAVE: ['সেভ করো'],
        REFRESH: ['রিফ্রেশ করো', 'রিলোড করো'],
        NEW_TAB: ['নিউ ট্যাব', 'নতুন ট্যাব'],
        CLOSE_TAB: ['ক্লোজ ট্যাব', 'বন্ধ করো'],
        ENTER: ['এন্টার', 'ওকে', 'সাবমিট'],
        ESCAPE: ['বাতিল', 'ব্যাক', 'বের হও'],
        DELETE: ['ডিলিট', 'মুছে ফেলো']
    },
    
    // Status Messages
    STATUS: {
        READY: 'প্রস্তুত',
        LISTENING: 'শুনছি...',
        PROCESSING: 'ভাবছি...',
        SPEAKING: 'বলছি...',
        ERROR: 'সমস্যা হয়েছে'
    },
    
    // Error Messages
    ERRORS: {
        NO_API_KEY: 'দয়া করে সেটিংসে জেমিনি API কী যোগ করুন।',
        NO_MIC: 'মাইক খুঁজে পাওয়া যায়নি',
        NO_CAMERA: 'ক্যামেরা পাওয়া যায়নি',
        NETWORK_ERROR: 'ইন্টারনেট সংযোগে সমস্যা',
        UNKNOWN_ERROR: 'কিছু সমস্যা হয়েছে'
    },
    
    // Success Messages
    SUCCESS: {
        WELCOME: 'NEXUS AI স্বাগতম!',
        SAVED: 'সেভ হয়েছে!',
        COPIED: 'কপি হয়েছে!',
        DONE: 'হয়ে গেছে!'
    }
};

// Freeze to prevent modification
Object.freeze(Constants.APP);
Object.freeze(Constants.API);
Object.freeze(Constants.VOICE);
Object.freeze(Constants.COLORS);
Object.freeze(Constants.ANIMATION);
Object.freeze(Constants.STORAGE);
Object.freeze(Constants.COMMANDS);
Object.freeze(Constants.STATUS);
Object.freeze(Constants.ERRORS);
Object.freeze(Constants.SUCCESS);

// Export
window.Constants = Constants;