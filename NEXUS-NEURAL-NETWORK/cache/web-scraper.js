/**
 * NEXUS AI - Light Web Scraper
 * ⚡ দ্রুত ডেটা সংগ্রহ - No Heavy Models
 * বিনামূল্যে রিয়েল-টাইম ডেটা
 */

class NEXUSLightScraper {
    constructor() {
        // CORS Proxy (Free)
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        
        // Cache
        this.cache = window.nexusCache;
        
        // Sources
        this.sources = {
            news: 'https://news.google.com/rss?hl=bn-BD&gl=BD&ceid=BD:bn',
            weather: 'https://wttr.in/Dhaka?format=j1',
            crypto: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
            dictionary: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
            wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
            facts: 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=bn'
        };
        
        // Stats
        this.stats = {
            requests: 0,
            successes: 0,
            errors: 0
        };
        
        console.log('[NEXUS Scraper] 🌐 Light Web Scraper চালু');
    }
    
    // ==================== FETCH WITH PROXY ====================
    
    async fetch(url) {
        try {
            this.stats.requests++;
            
            // Check cache first
            const cached = this.cache.get('scraper:' + url);
            if (cached) {
                console.log('[NEXUS Scraper] 📦 Cached:', url);
                return cached;
            }
            
            // Fetch with CORS proxy
            const response = await fetch(this.corsProxy + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.text();
            
            // Cache for 5 minutes
            this.cache.set('scraper:' + url, data, 1000 * 60 * 5);
            this.stats.successes++;
            
            return data;
        } catch (e) {
            console.error('[NEXUS Scraper] ❌ Error:', e);
            this.stats.errors++;
            return null;
        }
    }
    
    // ==================== NEWS ====================
    
    async getNews(category = 'bd') {
        try {
            const rss = await this.fetch(this.sources.news);
            if (!rss) return [];
            
            const parser = new DOMParser();
            const xml = parser.parseFromString(rss, 'text/xml');
            const items = xml.querySelectorAll('item');
            
            const news = [];
            items.forEach((item, i) => {
                if (i >= 10) return;
                
                news.push({
                    title: item.querySelector('title')?.textContent || '',
                    link: item.querySelector('link')?.textContent || '',
                    pubDate: item.querySelector('pubDate')?.textContent || '',
                    description: item.querySelector('description')?.textContent || ''
                });
            });
            
            // Cache
            this.cache.setTagged('news', category, news, 1000 * 60 * 10);
            
            return news;
        } catch (e) {
            console.error('[NEXUS Scraper] News error:', e);
            return [];
        }
    }
    
    // ==================== WEATHER ====================
    
    async getWeather(city = 'Dhaka') {
        try {
            const data = await this.fetch(this.sources.weather);
            if (!data) return null;
            
            const json = JSON.parse(data);
            const current = json.current_condition?.[0];
            
            if (!current) return null;
            
            const weather = {
                city: city,
                temp_C: current.temp_C,
                temp_F: current.temp_F,
                condition: current.weatherDesc?.[0]?.value || 'Unknown',
                humidity: current.humidity,
                wind: current.windspeedKmph + ' km/h',
                feelsLike: current.FeelsLikeC + '°C'
            };
            
            // Cache for 30 minutes
            this.cache.setTagged('weather', city, weather, 1000 * 60 * 30);
            
            return weather;
        } catch (e) {
            console.error('[NEXUS Scraper] Weather error:', e);
            return null;
        }
    }
    
    // ==================== CRYPTO ====================
    
    async getCrypto() {
        try {
            const data = await this.fetch(this.sources.crypto);
            if (!data) return null;
            
            const json = JSON.parse(data);
            
            const crypto = {
                bitcoin: {
                    price: json.bitcoin?.usd || 0,
                    change24h: json.bitcoin?.usd_24h_change?.toFixed(2) || 0
                },
                ethereum: {
                    price: json.ethereum?.usd || 0,
                    change24h: json.ethereum?.usd_24h_change?.toFixed(2) || 0
                }
            };
            
            // Cache for 5 minutes
            this.cache.setTagged('crypto', 'prices', crypto, 1000 * 60 * 5);
            
            return crypto;
        } catch (e) {
            console.error('[NEXUS Scraper] Crypto error:', e);
            return null;
        }
    }
    
    // ==================== DICTIONARY ====================
    
    async getDefinition(word) {
        try {
            const data = await this.fetch(this.sources.dictionary + encodeURIComponent(word));
            if (!data) return null;
            
            const json = JSON.parse(data);
            if (!json[0]) return null;
            
            const entry = json[0];
            const meanings = entry.meanings?.[0]?.definitions?.[0];
            
            const definition = {
                word: entry.word,
                phonetic: entry.phonetic || '',
                partOfSpeech: entry.meanings?.[0]?.partOfSpeech || '',
                definition: meanings?.definition || 'No definition found',
                example: meanings?.example || ''
            };
            
            // Cache for 1 day
            this.cache.setTagged('dictionary', word, definition, 1000 * 60 * 60 * 24);
            
            return definition;
        } catch (e) {
            console.error('[NEXUS Scraper] Dictionary error:', e);
            return null;
        }
    }
    
    // ==================== WIKIPEDIA ====================
    
    async getWikipedia(topic) {
        try {
            const data = await this.fetch(this.sources.wikipedia + encodeURIComponent(topic));
            if (!data) return null;
            
            const json = JSON.parse(data);
            
            const wiki = {
                title: json.title || topic,
                extract: json.extract || '',
                thumbnail: json.thumbnail?.source || null,
                url: json.content_urls?.desktop?.page || ''
            };
            
            // Cache for 1 hour
            this.cache.setTagged('wikipedia', topic, wiki, 1000 * 60 * 60);
            
            return wiki;
        } catch (e) {
            console.error('[NEXUS Scraper] Wikipedia error:', e);
            return null;
        }
    }
    
    // ==================== RANDOM FACT ====================
    
    async getRandomFact() {
        try {
            const data = await this.fetch(this.sources.facts);
            if (!data) return null;
            
            const json = JSON.parse(data);
            
            // Cache for 1 hour
            this.cache.setTagged('facts', 'random', json.text || json, 1000 * 60 * 60);
            
            return json;
        } catch (e) {
            console.error('[NEXUS Scraper] Facts error:', e);
            return null;
        }
    }
    
    // ==================== ALL IN ONE ====================
    
    // সব রিয়েল-টাইম ডেটা একসাথে
    async getAllRealtime() {
        const [news, weather, crypto] = await Promise.all([
            this.getNews(),
            this.getWeather(),
            this.getCrypto()
        ]);
        
        return {
            news: news,
            weather: weather,
            crypto: crypto,
            timestamp: Date.now()
        };
    }
    
    // টাইম সেভ করা
    async quickAnswer(query) {
        const q = query.toLowerCase();
        
        // Weather
        if (q.includes('আবহাওয়া') || q.includes('weather')) {
            const weather = await this.getWeather();
            if (weather) {
                return `🌤️ আজকের আবহাওয়া:
${weather.city} তে তাপমাত্রা: ${weather.temp_C}°C
অনুভূত: ${weather.feelsLike}
আর্দ্রতা: ${weather.humidity}%
ওয়াইন্ড: ${weather.wind}
${weather.condition}`;
            }
        }
        
        // News
        if (q.includes('নিউজ') || q.includes('খবর') || q.includes('news')) {
            const news = await this.getNews();
            if (news.length > 0) {
                let response = '📰 আজকের খবর:\n\n';
                news.slice(0, 5).forEach((item, i) => {
                    response += `${i + 1}. ${item.title}\n`;
                });
                return response;
            }
        }
        
        // Crypto
        if (q.includes('বিটকয়েন') || q.includes('crypto') || q.includes('বিটিসি')) {
            const crypto = await this.getCrypto();
            if (crypto) {
                return `₿ ক্রিপ্টো মার্কেট:
Bitcoin: $${crypto.bitcoin.price} (${crypto.bitcoin.change24h > 0 ? '📈' : '📉'} ${crypto.bitcoin.change24h}%)
Ethereum: $${crypto.ethereum.price} (${crypto.ethereum.change24h > 0 ? '📈' : '📉'} ${crypto.ethereum.change24h}%)`;
            }
        }
        
        // Dictionary
        const words = q.match(/([a-zA-Z]{3,})/g);
        if (words) {
            const def = await this.getDefinition(words[0]);
            if (def) {
                return `📖 ${def.word} (${def.partOfSpeech}):
${def.phonetic}
${def.definition}
${def.example ? 'উদাহরণ: ' + def.example : ''}`;
            }
        }
        
        return null;
    }
    
    // Stats
    getStats() {
        return this.stats;
    }
}

// Export
window.NEXUSLightScraper = NEXUSLightScraper;
window.nexusScraper = new NEXUSLightScraper();

console.log('[NEXUS] 🌐 Light Web Scraper Ready!');
