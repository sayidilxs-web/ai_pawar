@echo off
REM NEXUS AI - Windows Setup Script
REM এই স্ক্রিপ্ট প্রজেক্ট সেটআপ করবে

echo ========================================
echo    NEXUS AI সেটআপ শুরু হচ্ছে...
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js ইনস্টল করা নেই!
    echo দয়া করে https://nodejs.org থেকে Node.js ইনস্টল করুন
    pause
    exit /b 1
)

echo [OK] Node.js পাওয়া গেছে
node --version
echo.

REM Install dependencies
echo [INFO] ডিপেন্ডেন্সি ইনস্টল হচ্ছে...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] ডিপেন্ডেন্সি ইনস্টল ব্যর্থ হয়েছে!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    সেটআপ সম্পন্ন!
echo ========================================
echo.
echo অ্যাপ চালানোর জন্য লিখুন: npm start
echo.
echo ডেভ মোডে চালানোর জন্য লিখুন: npm run dev
echo.
pause