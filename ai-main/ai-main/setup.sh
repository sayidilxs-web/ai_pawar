#!/bin/bash
# NEXUS AI - Unix Setup Script
# এই স্ক্রিপ্ট প্রজেক্ট সেটআপ করবে

echo "========================================"
echo "   NEXUS AI সেটআপ শুরু হচ্ছে..."
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js ইনস্টল করা নেই!"
    echo "দয়া করে https://nodejs.org থেকে Node.js ইনস্টল করুন"
    exit 1
fi

echo "[OK] Node.js পাওয়া গেছে"
node --version
echo ""

# Install dependencies
echo "[INFO] ডিপেন্ডেন্সি ইনস্টল হচ্ছে..."
npm install

if [ $? -ne 0 ]; then
    echo "[ERROR] ডিপেন্ডেন্সি ইনস্টল ব্যর্থ হয়েছে!"
    exit 1
fi

echo ""
echo "========================================"
echo "   সেটআপ সম্পন্ন!"
echo "========================================"
echo ""
echo "অ্যাপ চালানোর জন্য লিখুন: npm start"
echo ""
echo "ডেভ মোডে চালানোর জন্য লিখুন: npm run dev"
echo ""