# NEXUS AI - আপনার ব্যক্তিগত AI সহকারী

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-00f0ff?style=for-the-badge">
  <img src="https://img.shields.io/badge/Platform-Electron-47848F?style=for-the-badge">
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge">
  <img src="https://img.shields.io/badge/Language-Bengali-00ff88?style=for-the-badge">
</div>

## 🎯 বিবরণ

NEXUS AI হলো একটি শক্তিশালী AI অ্যাসিস্ট্যান্ট যা বাংলায় কথা বোঝে এবং বাংলায় কথা বলে। এটি আপনার কম্পিউটারের স্ক্রিন দেখতে পারে, মাউস ও কিবোর্ড কন্ট্রোল করতে পারে, এবং আপনার সাথে স্বাভাবিক কথোপকথন করতে পারে।

## ✨ বৈশিষ্ট্য

### 🗣️ ভয়েস ইন্টারঅ্যাকশন
- বাংলায় কথা বলুন, NEXUS বাংলায় উত্তর দেবে
- Speech-to-Text এবং Text-to-Speech
- কোনো ক্লিক ছাড়াই কথা বলুন

### 👁️ স্ক্রিন দেখতে পারা
- রিয়েল-টাইম স্ক্রিনশট
- স্ক্রিনে ক্লিক, ডাবল ক্লিক, রাইট ক্লিক
- টেক্সট টাইপ করা
- মাউস মুভমেন্ট

### 😊 চেহারা চিনতে পারা
- Face Recognition দিয়ে ব্যবহারকারী চিনতে পারা
- স্বয়ংক্রিয় গ্রিটিং

### 🎨 সাইবারপাঙ্ক ইন্টারফেস
- অ্যানিমেটেড অরব
- ম্যাট্রিক্স ব্যাকগ্রাউন্ড
- অডিও ভিজ্যুয়ালাইজার

### 🤖 AI পাওয়ার
- Google Gemini API দিয়ে চালিত
- বুদ্ধিমান কথোপকথন
- কনটেক্সট অ্যাওয়ার

## 🚀 ইনস্টলেশন

### প্রয়োজনীয়তা
- Node.js 18+
- npm বা yarn
- Windows 10+, macOS 10.15+, বা Linux

### স্টেপ ১: রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/rifat1122ddf-commits/ai.git
cd ai
```

### স্টেপ ২: ডিপেন্ডেন্সি ইনস্টল করুন
```bash
npm install
```

### স্টেপ ৩: জেমিনি API কী পান
1. [Google AI Studio](https://makersuite.google.com/app/apikey) যান
2. API কী তৈরি করুন
3. অ্যাপে সেটিংসে API কী যোগ করুন

### স্টেপ ৪: অ্যাপ চালান
```bash
npm start
```

## 📁 প্রজেক্ট স্ট্রাকচার

```
ai/
├── package.json          # NPM কনফিগারেশন
├── src/
│   ├── main/
│   │   └── main.js       # Electron মেইন প্রসেস
│   ├── preload/
│   │   └── preload.js    # IPC ব্রিজ
│   └── renderer/
│       ├── index.html    # মূল HTML
│       ├── styles.css    # স্টাইলিং
│       ├── config.js     # কনফিগারেশন
│       ├── app.js        # মূল অ্যাপ লজিক
│       ├── ai-core.js    # AI কোর
│       ├── voice-recognition.js   # ভয়েস রিকগনিশন
│       ├── voice-synthesis.js     # ভয়েস সিনথেসিস
│       ├── face-recognition.js    # ফেস রিকগনিশন
│       ├── screen-capture.js      # স্ক্রিন ক্যাপচার
│       └── automation.js   # অটোমেশন
└── assets/
    └── models/           # ML মডেল ফাইল
```

## 🎮 ব্যবহার

### ভয়েস কমান্ড
- "হ্যালো নেক্সাস" - অ্যাসিস্ট্যান্ট জাগান
- "ক্লিক করো" - বর্তমান পজিশনে ক্লিক
- "এখানে ডাবল ক্লিক করো" - ডাবল ক্লিক
- "ওখানে ক্লিক করো" - নির্দিষ্ট জায়গায় ক্লিক
- "টাইপ করো [টেক্সট]" - টেক্সট টাইপ করা
- "সেভ করো" - Ctrl+S
- "কপি করো" - Ctrl+C
- "পেস্ট করো" - Ctrl+V

### কীবোর্ড শর্টকাট
- `Ctrl+Shift+N` - NEXUS AI টগল করুন

## ⚙️ সেটিংস

### API কী
- জেমিনি API কী কনফিগার করুন
- [Google AI Studio](https://makersuite.google.com/app/apikey) থেকে পান

### ভাষা
- ইনপুট ভাষা: বাংলা (bn-BD)
- আউটপুট ভাষা: বাংলা (bn)

### ফিচার টগল
- চেহারা চিনতে পারা সক্রিয়/নিষ্ক্রিয়
- স্ক্রিন দেখতে পারা সক্রিয়/নিষ্ক্রিয়
- স্বয়ংক্রিয় শোনা সক্রিয়/নিষ্ক্রিয়

## 🔧 ডেভেলপমেন্ট

### ডেভ মোডে চালান
```bash
npm run dev
```

### বিল্ড করুন
```bash
npm run build
```

### উইন্ডোজ exe তৈরি
```bash
npm run pack
```

## 📝 লাইসেন্স

MIT License - ব্যবহার করুন, পরিবর্তন করুন, এবং উন্নতি করুন!

## 🙏 ধন্যবাদ

NEXUS AI তৈরি করা হয়েছে ❤️ দিয়ে

---

**নোট:** এই প্রজেক্টটি একটি ডেমো/শিক্ষামূলক প্রজেক্ট। বাণিজ্যিক ব্যবহারের জন্য উপযুক্ত লাইসেন্স এবং সিকিউরিটি বিবেচনা প্রয়োজন।