/**
 * NEXUS API Bridge Module
 * Connect to external APIs: Weather, News, Translation, etc.
 */

class APIBridge {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.rateLimiter = new RateLimiter(100, 60000);
        this.defaultTimeout = 10000;
    }

    async request(url, options = {}) {
        if (!this.rateLimiter.try()) {
            return { success: false, error: 'Rate limit exceeded', retryAfter: this.rateLimiter.getWaitTime() };
        }

        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}`, status: response.status };
            }

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            const result = { success: true, data, status: response.status };

            if (options.cache !== false) {
                this.setCache(cacheKey, result, options.cacheDuration || 300000);
            }

            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, error: 'Request timeout' };
            }
            return { success: false, error: error.message };
        }
    }

    getCached(key) {
        if (this.cache.has(key)) {
            const expiry = this.cacheExpiry.get(key);
            if (Date.now() < expiry) {
                return this.cache.get(key);
            }
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
        }
        return null;
    }

    setCache(key, value, duration) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + duration);
    }

    clearCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    // Weather API
    async getWeather(city, apiKey = '') {
        if (!apiKey) {
            // Use free Open-Meteo API
            const geoResult = await this.request(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            );
            
            if (!geoResult.success || !geoResult.data.results?.length) {
                return { success: false, error: 'City not found' };
            }
            
            const { latitude, longitude, name, country } = geoResult.data.results[0];
            
            const weatherResult = await this.request(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability`
            );
            
            if (!weatherResult.success) {
                return weatherResult;
            }
            
            const { current_weather, hourly } = weatherResult.data;
            
            return {
                success: true,
                data: {
                    city: name,
                    country,
                    temperature: current_weather.temperature,
                    windSpeed: current_weather.windspeed,
                    weathercode: current_weather.weathercode,
                    description: this.getWeatherDescription(current_weather.weathercode),
                    humidity: hourly.relativehumidity_2m?.[0] || 0,
                    precipitation: hourly.precipitation_probability?.[0] || 0
                }
            };
        }
        
        // Use OpenWeatherMap API
        const geoResult = await this.request(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
        );
        
        if (!geoResult.success || !geoResult.data.length) {
            return { success: false, error: 'City not found' };
        }
        
        const { lat, lon, name, country } = geoResult.data[0];
        
        const weatherResult = await this.request(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        
        if (!weatherResult.success) {
            return weatherResult;
        }
        
        const { main, wind, weather, humidity } = weatherResult.data;
        
        return {
            success: true,
            data: {
                city: name,
                country,
                temperature: main.temp,
                feelsLike: main.feels_like,
                humidity: main.humidity,
                windSpeed: wind.speed,
                description: weather[0].description,
                icon: weather[0].icon
            }
        };
    }

    getWeatherDescription(code) {
        const codes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return codes[code] || 'Unknown';
    }

    // News API
    async getNews(options = {}) {
        const {
            query = '',
            category = 'general',
            country = 'us',
            pageSize = 10,
            apiKey = ''
        } = options;

        if (apiKey) {
            const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&q=${encodeURIComponent(query)}&pageSize=${pageSize}&apiKey=${apiKey}`;
            return this.request(url);
        }

        // Use free RSS/Alternative
        try {
            const response = await this.request(
                `https://newsdata.io/api/1/news?apikey=${apiKey || 'pub_demo'}&country=${country}&category=${category}&language=en`
            );
            
            if (response.success && response.data.results) {
                return {
                    success: true,
                    data: response.data.results.map(article => ({
                        title: article.title,
                        description: article.description,
                        content: article.content,
                        url: article.link,
                        image: article.image_url,
                        publishedAt: article.pubDate,
                        source: article.source_id
                    }))
                };
            }
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Translation API (using LibreTranslate free instance)
    async translate(text, targetLang = 'en', sourceLang = 'auto', apiUrl = 'https://libretranslate.com') {
        try {
            const response = await this.request(`${apiUrl}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                }),
                timeout: 15000
            });

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        translatedText: response.data.translatedText,
                        detectedLanguage: response.data.detectedLanguage?.language || sourceLang
                    }
                };
            }
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Currency Exchange API
    async getExchangeRate(from = 'USD', to = 'EUR') {
        try {
            const response = await this.request(
                `https://api.exchangerate-api.com/v4/latest/${from}`
            );

            if (response.success && response.data.rates) {
                const rate = response.data.rates[to];
                if (rate !== undefined) {
                    return {
                        success: true,
                        data: {
                            from,
                            to,
                            rate,
                            date: response.data.date
                        }
                    };
                }
            }
            return { success: false, error: 'Currency not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Dictionary API
    async getDefinition(word) {
        try {
            const response = await this.request(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
            );

            if (response.success && response.data) {
                const entry = response.data[0];
                const meanings = entry.meanings.map(m => ({
                    partOfSpeech: m.partOfSpeech,
                    definitions: m.definitions.slice(0, 3).map(d => ({
                        definition: d.definition,
                        example: d.example
                    })),
                    synonyms: m.synonyms?.slice(0, 5) || []
                }));

                return {
                    success: true,
                    data: {
                        word: entry.word,
                        phonetic: entry.phonetic,
                        meanings
                    }
                };
            }
            return { success: false, error: 'Word not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Web Search
    async search(query, limit = 10) {
        try {
            // Using DuckDuckGo Instant Answer API (free, no key required)
            const response = await this.request(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
            );

            if (response.success && response.data) {
                const results = [];
                
                if (response.data.RelatedTopics) {
                    for (const topic of response.data.RelatedTopics.slice(0, limit)) {
                        if (topic.Text && topic.FirstURL) {
                            results.push({
                                title: topic.Text.split(' - ')[0] || topic.Text,
                                snippet: topic.Text,
                                url: topic.FirstURL
                            });
                        }
                    }
                }

                return {
                    success: true,
                    data: {
                        query,
                        results,
                        abstract: response.data.AbstractText,
                        image: response.data.Image
                    }
                };
            }
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Time Zone API
    async getTimeZone(city) {
        try {
            const geoResult = await this.request(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            );

            if (!geoResult.success || !geoResult.data.results?.length) {
                return { success: false, error: 'City not found' };
            }

            const { latitude, longitude, name, country, timezone } = geoResult.data.results[0];

            return {
                success: true,
                data: {
                    city: name,
                    country,
                    timezone,
                    coordinates: { latitude, longitude },
                    localTime: new Date().toLocaleString('en-US', { timeZone: timezone }),
                    utcOffset: this.getUtcOffset(timezone)
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getUtcOffset(timezone) {
        try {
            const date = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'shortOffset'
            });
            return formatter.format(date).split(' ').pop();
        } catch {
            return 'UTC';
        }
    }

    // QR Code Generation
    generateQRCode(text, size = 200) {
        const qr = this.createQRMatrix(text);
        return this.renderQRMatrix(qr, size);
    }

    createQRMatrix(text) {
        const matrix = [];
        const size = Math.max(21, Math.ceil(text.length / 2) + 17);
        
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = 0;
            }
        }

        this.addFinderPatterns(matrix, 0, 0);
        this.addFinderPatterns(matrix, size - 7, 0);
        this.addFinderPatterns(matrix, 0, size - 7);

        const data = this.encodeData(text);
        let idx = 0;
        
        for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            for (let row = 0; row < size; row++) {
                for (let c = 0; c < 2; c++) {
                    const x = col - c;
                    if (matrix[row][x] === 0 && idx < data.length) {
                        matrix[row][x] = data[idx++] ? 1 : 0;
                    }
                }
            }
        }

        return matrix;
    }

    addFinderPatterns(matrix, row, col) {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (r === 0 || r === 6 || c === 0 || c === 6 || 
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                    matrix[row + r][col + c] = 1;
                } else {
                    matrix[row + r][col + c] = 0;
                }
            }
        }
    }

    encodeData(text) {
        const bits = [];
        bits.push(1, 0, 1, 0);
        
        for (let i = 0; i < text.length; i++) {
            bits.push(...this.toBinary(text.charCodeAt(i), 8));
        }
        
        while (bits.length % 8 !== 0) {
            bits.push(0);
        }
        
        return bits;
    }

    toBinary(num, bits) {
        const result = [];
        for (let i = bits - 1; i >= 0; i--) {
            result.push((num >> i) & 1);
        }
        return result;
    }

    renderQRMatrix(matrix, size) {
        const cellSize = size / matrix.length;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${matrix.length} ${matrix.length}">`;
        svg += `<rect width="100%" height="100%" fill="white"/>`;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix.length; col++) {
                if (matrix[row][col]) {
                    svg += `<rect x="${col}" y="${row}" width="1" height="1" fill="black"/>`;
                }
            }
        }
        
        svg += '</svg>';
        return svg;
    }
}

class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    try() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }

    getWaitTime() {
        if (this.requests.length === 0) return 0;
        const oldest = Math.min(...this.requests);
        return Math.max(0, this.windowMs - (Date.now() - oldest));
    }
}

export { APIBridge, RateLimiter };