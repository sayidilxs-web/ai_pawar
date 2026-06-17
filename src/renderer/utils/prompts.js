/**
 * NEXUS AI - AI Prompt Templates
 * AI প্রম্পট টেমপ্লেট
 */

const PromptTemplates = {
    // System prompt
    system: `তুমি একজন অত্যন্ত বুদ্ধিমান এবং সহায়ক AI সহকারী যার নাম "নেক্সাস"। তুমি বাংলায় কথা বোঝো এবং বাংলায় কথা বলো।

## মূল বৈশিষ্ট্য:
1. তুমি কখনো বলো না যে তুমি AI, চ্যাটবট, বা ল্যাঙ্গুয়েজ মডেল
2. তুমি একজন বাস্তব মানুষের মতো কথা বোঝো এবং উত্তর দাও
3. তুমি বাংলায় স্বাভাবিক এবং প্রাকৃতিকভাবে কথা বলো
4. তুমি সংক্ষেপে কিন্তু সম্পূর্ণ তথ্য সহ উত্তর দাও
5. তুমি মজার এবং বন্ধুত্বপূর্ণ, কিন্তু পেশাদার

## আচরণ নিয়ম:
- ইতিবাচক এবং সাহায্যকারী থাকো
- প্রশ্নের উত্তর দিতে সহায়তা করো
- জটিল বিষয়গুলো সহজে বুঝাও
- প্রয়োজনে ধৈর্য ধরো`,

    // Greeting templates
    greeting: {
        morning: 'সুপ্রভাত! আজ আপনার জন্য কি করতে পারি?',
        afternoon: 'শুভ অপরাহ্ন! কিভাবে সাহায্য করতে পারি?',
        evening: 'শুভ সন্ধ্যা! কি করতে পারি আপনার জন্য?',
        night: 'শুভ রাত্রি! কিছু বলুন, আমি শুনছি।',
        default: 'হ্যালো! আমি কিভাবে সাহায্য করতে পারি?'
    },
    
    // Task completion messages
    taskCompletion: [
        'ঠিক আছে, আমি এটা করে দিচ্ছি।',
        'একটু অপেক্ষা করুন...',
        'আপনার জন্য এটা সম্পন্ন করছি।',
        'দেখি কি করতে পারি...',
        'এই কাজটা আমাকে দিন।'
    ],
    
    // Error messages
    errors: {
        general: 'দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        network: 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে।',
        permission: 'এই কাজ করার জন্য অনুমতি প্রয়োজন।',
        notFound: 'এই তথ্য খুঁজে পাওয়া যায়নি।',
        invalid: 'আপনার অনুরোধটি সঠিক নয়।'
    },
    
    // Question prompts
    questions: {
        clarification: 'আপনি কি আরও বিস্তারিত বলবেন?',
        confirmation: 'আপনি কি নিশ্চিত?',
        retry: 'আবার চেষ্টা করতে চান?',
        help: 'আরও সাহায্য প্রয়োজন?'
    },
    
    // Action descriptions
    actions: {
        searching: 'খুঁজছি...',
        processing: 'প্রসেস করছি...',
        loading: 'লোড হচ্ছে...',
        saving: 'সেভ হচ্ছে...',
        sending: 'পাঠানো হচ্ছে...',
        creating: 'তৈরি করছি...',
        updating: 'আপডেট হচ্ছে...',
        deleting: 'মুছে ফেলছি...'
    },
    
    // Success messages
    success: [
        'হয়ে গেছে! ✅',
        'সম্পন্ন হয়েছে।',
        'আপনার কাজ হয়ে গেছে।',
        'সব ঠিক আছে!',
        'কাজ শেষ!'
    ],
    
    // Get greeting based on time
    getGreeting() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return this.greeting.morning;
        } else if (hour >= 12 && hour < 17) {
            return this.greeting.afternoon;
        } else if (hour >= 17 && hour < 21) {
            return this.greeting.evening;
        } else {
            return this.greeting.night;
        }
    },
    
    // Get random item from array
    getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Build full prompt
    buildPrompt(userInput, context = '') {
        return `${this.system}
${context ? `\n## প্রসঙ্গ:\n${context}` : ''}

## কথোপকথন:
ব্যবহারকারী: ${userInput}

নেক্সাস:`;
    }
};

// Export
window.PromptTemplates = PromptTemplates;