/**
 * NEXUS AI - লাইভ ডেটা সিস্টেম
 * API ছাড়াই সরাসরি ওয়েবসাইট থেকে তথ্য নেয়
 */

class LiveData {
    constructor() {
        this.isLoading = false;
    }

    async fetchPage(url) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return await response.text();
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    }

    // 🌤️ আবহাওয়া - Open-Meteo (Key লাগে না!)
    async getWeather(city = 'Dhaka') {
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                return { error: `${city} এর আবহাওয়া পাওয়া যায়নি` };
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
            
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            
            const current = weatherData.current;
            const weatherCode = this.getWeatherDescription(current.weather_code);

            return {
                city: name,
                country: country,
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                weather: weatherCode,
                wind: Math.round(current.wind_speed_10m),
                icon: this.getWeatherIcon(current.weather_code)
            };
        } catch (error) {
            return { error: 'আবহাওয়া লোড করতে সমস্যা হয়েছে' };
        }
    }

    getWeatherDescription(code) {
        const codes = {
            0: 'পরিষ্কার আকাশ ☀️', 1: 'মেঘলা আকাশ', 2: 'আংশিক মেঘলা', 3: 'মেঘলা',
            45: 'কুয়াশা', 48: 'কুয়াশা', 51: 'হালকা বৃষ্টি', 53: 'মাঝারি বৃষ্টি',
            55: 'ভারী বৃষ্টি', 61: 'বৃষ্টি', 63: 'মাঝারি বৃষ্টি', 65: 'ভারী বৃষ্টি',
            71: 'হালকা তুষারপাত', 73: 'মাঝারি তুষারপাত', 75: 'ভারী তুষারপাত',
            80: 'বৃষ্টির সাথে বজ্র', 81: 'বৃষ্টির সাথে বজ্র', 82: 'ভারী বৃষ্টির সাথে বজ্র',
            95: 'বজ্রপাত ⛈️', 96: 'বজ্রপাত সহ ঝড়', 99: 'ভারী ঝড়'
        };
        return codes[code] || 'আবহাওয়া অজানা';
    }

    getWeatherIcon(code) {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 99) return '⛈️';
        return '🌤️';
    }

    // 📰 সর্বশেষ নিউজ - Prothom Alo
    async getNews(category = 'top') {
        try {
            const sources = {
                'top': 'https://www.prothomalo.com/',
                'bangladesh': 'https://www.prothomalo.com/bangladesh',
                'international': 'https://www.prothomalo.com/world',
                'sports': 'https://www.prothomalo.com/sports',
                'technology': 'https://www.prothomalo.com/technology',
                'entertainment': 'https://www.prothomalo.com/entertainment',
                'economy': 'https://www.prothomalo.com/business'
            };

            const url = sources[category] || sources['top'];
            const html = await this.fetchPage(url);
            
            if (!html) {
                return { error: 'নিউজ লোড করতে সমস্যা হয়েছে' };
            }

            const headlines = [];
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const links = tempDiv.querySelectorAll('a[href*="prothomalo.com"]');
            
            links.forEach(link => {
                const text = link.textContent.trim();
                const href = link.getAttribute('href');
                if (text.length > 20 && text.length < 200 && !text.includes('<') && href) {
                    if (!headlines.find(h => h.title === text)) {
                        headlines.push({
                            title: text,
                            url: href.startsWith('http') ? href : 'https://www.prothomalo.com' + href
                        });
                    }
                }
            });

            if (headlines.length === 0) {
                const allText = tempDiv.innerText;
                const lines = allText.split('\n').filter(l => l.trim().length > 30 && l.trim().length < 150);
                for (let i = 0; i < Math.min(10, lines.length); i++) {
                    headlines.push({ title: lines[i].trim(), url: url });
                }
            }

            return {
                category: category,
                source: 'প্রথম আলো',
                count: headlines.length,
                headlines: headlines.slice(0, 10)
            };
        } catch (error) {
            return { error: 'নিউজ লোড করতে সমস্যা হয়েছে' };
        }
    }

    // 💱 কারেন্সি রেট - Frankfurter API (Key লাগে না!)
    async getAllCurrencies(base = 'USD') {
        try {
            const response = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
            const data = await response.json();
            
            const currencies = {
                'BDT': { name: 'বাংলাদেশী টাকা', flag: '🇧🇩' },
                'EUR': { name: 'ইউরো', flag: '🇪🇺' },
                'GBP': { name: 'পাউন্ড স্টার্লিং', flag: '🇬🇧' },
                'INR': { name: 'ভারতীয় রুপি', flag: '🇮🇳' },
                'JPY': { name: 'জাপানি ইয়েন', flag: '🇯🇵' },
                'CNY': { name: 'চীনা ইয়েন', flag: '🇨🇳' },
                'SAR': { name: 'সৌদি রিয়াল', flag: '🇸🇦' },
                'AED': { name: 'আমিরাতি দিরহাম', flag: '🇦🇪' }
            };

            const results = [];
            for (const [code, info] of Object.entries(currencies)) {
                if (data.rates[code]) {
                    results.push({ ...info, code: code, rate: data.rates[code] });
                }
            }

            return { base: base, date: data.date, currencies: results };
        } catch (error) {
            return { error: 'কারেন্সি রেট লোড করতে সমস্যা হয়েছে' };
        }
    }

    // ⏰ বর্তমান সময় ও তারিখ
    getDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        
        return {
            date: now.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // 🔍 Wikipedia সামগ্রিক তথ্য
    async getWikipediaInfo(query) {
        try {
            const url = `https://bn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                return { error: `"${query}" সম্পর্কে তথ্য পাওয়া যায়নি` };
            }

            const data = await response.json();
            return {
                title: data.title,
                description: data.description,
                extract: data.extract,
                url: data.content_urls.desktop.page
            };
        } catch (error) {
            return { error: 'তথ্য লোড করতে সমস্যা হয়েছে' };
        }
    }

    // 🎯 মূল ইন্টেলিজেন্ট হ্যান্ডলার
    async processLiveDataRequest(query) {
        query = query.toLowerCase();
        
        // আবহাওয়া
        if (query.includes('আবহাওয়া') || query.includes('বৃষ্টি') || query.includes('তাপমাত্রা') || query.includes('weather') || query.includes('কেমন') || query.includes('গরম') || query.includes('ঠান্ডা')) {
            let city = 'Dhaka';
            if (query.includes('চট্টগ্রাম')) city = 'Chittagong';
            else if (query.includes('সিলেট')) city = 'Sylhet';
            else if (query.includes('খুলনা')) city = 'Khulna';
            else if (query.includes('রাজশাহী')) city = 'Rajshahi';
            return await this.getWeather(city);
        }
        
        // নিউজ
        if (query.includes('নিউজ') || query.includes('খবর') || query.includes('সংবাদ') || query.includes('news') || query.includes('today') || query.includes('আজকের')) {
            let category = 'top';
            if (query.includes('বাংলাদেশ')) category = 'bangladesh';
            else if (query.includes('আন্তর্জাতিক') || query.includes('বিদেশ')) category = 'international';
            else if (query.includes('ক্রীড়া') || query.includes('খেলা')) category = 'sports';
            else if (query.includes('টেক') || query.includes('প্রযুক্তি')) category = 'technology';
            return await this.getNews(category);
        }
        
        // কারেন্সি/টাকা
        if (query.includes('দাম') || query.includes('রেট') || query.includes('কারেন্সি') || query.includes('টাকা') || query.includes('ডলার') || query.includes('ইউরো') || query.includes('পাউন্ড') || query.includes('currency')) {
            return await this.getAllCurrencies('USD');
        }
        
        // তারিখ/সময়
        if (query.includes('তারিখ') || query.includes('সময়') || query.includes('দিন') || query.includes('date') || query.includes('time') || query.includes('এখন') || query.includes('আজ') || query.includes('কোন')) {
            return this.getDateTime();
        }
        
        // সার্চ/খোঁজ
        if (query.includes('সার্চ') || query.includes('খুঁজ') || query.includes('জান') || query.includes('বল') || query.includes('what is') || query.includes('কি') || query.includes('কে') || query.includes('কোথায়') || query.includes('কখন') || query.includes('কিভাবে') || query.includes('কেন')) {
            let searchQuery = query.replace(/সার্চ\s*/gi, '').replace(/খুঁজে\s*দেখ\s*/gi, '').replace(/বল\s*/gi, '').replace(/জান\s*/gi, '').replace(/কি\s*(এই|হয়|আছে|হলো|করে)/gi, '').replace(/what is\s*/gi, '').trim();
            if (searchQuery.length > 2) {
                return await this.getWikipediaInfo(searchQuery);
            }
        }
        
        return { error: 'আপনি কী জানতে চান বুঝতে পারিনি' };
    }

    // 📝 ফরম্যাটেড আউটপু্ট তৈরি
    formatOutput(data, type) {
        if (data.error) return `❌ ${data.error}`;

        switch (type) {
            case 'weather':
                return `\n🌤️ **আবহাওয়া রিপোর্ট**\n━━━━━━━━━━━━━━━\n📍 ${data.city}, ${data.country}\n${data.icon} ${data.weather}\n🌡️ তাপমাত্রা: ${data.temp}°C\n💧 আর্দ্রতা: ${data.humidity}%\n💨 বাতাস: ${data.wind} km/h\n━━━━━━━━━━━━━━━`;
            case 'news':
                let newsText = `\n📰 **${data.source} - সর্বশেষ খবর**\n━━━━━━━━━━━━━━━\n`;
                data.headlines.forEach((item, i) => { newsText += `${i + 1}. ${item.title}\n`; });
                return newsText + `\n━━━━━━━━━━━━━━━\n📊 মোট ${data.count}টি খবর`;
            case 'currency':
                let currText = `\n💱 **কারেন্সি রেট (${data.base})**\n━━━━━━━━━━━━━━━\n`;
                data.currencies.forEach(item => { currText += `${item.flag} ${item.code}: ${item.rate.toFixed(2)} ${item.name}\n`; });
                return currText + `\n📅 তারিখ: ${data.date}`;
            case 'datetime':
                return `\n📅 **তারিখ ও সময়**\n━━━━━━━━━━━━━━━\n📆 ${data.date}\n🕐 ${data.time}\n🌐 ${data.timezone}\n━━━━━━━━━━━━━━━`;
            case 'search':
                return `\n🔍 **"${data.title}"**\n━━━━━━━━━━━━━━━\n${data.description ? `📝 ${data.description}\n` : ''}\n${data.extract ? data.extract : ''}\n━━━━━━━━━━━━━━━\n🔗 ${data.url}\n━━━━━━━━━━━━━━━`;
            default:
                return JSON.stringify(data, null, 2);
        }
    }
}

const liveData = new LiveData();
