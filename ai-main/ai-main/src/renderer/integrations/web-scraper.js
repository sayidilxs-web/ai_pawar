/**
 * NEXUS Web Scraper Module
 * Extract data from websites
 */

class WebScraper {
    constructor() {
        this.rateLimiter = new ScraperRateLimiter(10, 1000);
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ];
    }

    async fetch(url, options = {}) {
        if (!this.rateLimiter.try()) {
            return { success: false, error: 'Rate limit exceeded' };
        }

        try {
            const headers = {
                'User-Agent': options.userAgent || this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            };

            if (options.headers) {
                Object.assign(headers, options.headers);
            }

            const response = await fetch(url, {
                headers,
                signal: AbortSignal.timeout(options.timeout || 30000)
            });

            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}`, status: response.status };
            }

            const html = await response.text();
            
            return {
                success: true,
                data: {
                    url: response.url,
                    html,
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries())
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    parseHTML(html, selectors) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const result = {};
        
        for (const [key, selector] of Object.entries(selectors)) {
            const elements = doc.querySelectorAll(selector);
            result[key] = Array.from(elements).map(el => ({
                text: el.textContent?.trim(),
                html: el.innerHTML?.trim(),
                href: el.href,
                src: el.src,
                alt: el.alt
            }));
        }
        
        return result;
    }

    async scrape(url, selectors, options = {}) {
        const fetchResult = await this.fetch(url, options);
        
        if (!fetchResult.success) {
            return fetchResult;
        }

        return {
            ...fetchResult,
            data: {
                ...fetchResult.data,
                extracted: this.parseHTML(fetchResult.data.html, selectors)
            }
        };
    }

    extractLinks(html, baseUrl = '') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = [];
        
        for (const a of doc.querySelectorAll('a[href]')) {
            let href = a.href;
            
            if (href.startsWith('/') && baseUrl) {
                href = new URL(href, baseUrl).href;
            }
            
            links.push({
                text: a.textContent?.trim(),
                href,
                title: a.title
            });
        }
        
        return links;
    }

    extractImages(html, baseUrl = '') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const images = [];
        
        for (const img of doc.querySelectorAll('img[src]')) {
            let src = img.src;
            
            if (src.startsWith('/') && baseUrl) {
                src = new URL(src, baseUrl).href;
            }
            
            images.push({
                src,
                alt: img.alt,
                title: img.title,
                width: img.width,
                height: img.height
            });
        }
        
        return images;
    }

    extractMetadata(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const getMeta = (name) => {
            const el = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            return el?.content;
        };

        return {
            title: doc.querySelector('title')?.textContent?.trim() || getMeta('og:title'),
            description: getMeta('description') || getMeta('og:description'),
            author: getMeta('author'),
            keywords: getMeta('keywords'),
            ogImage: getMeta('og:image'),
            ogType: getMeta('og:type'),
            publishedTime: getMeta('article:published_time'),
            modifiedTime: getMeta('article:modified_time')
        };
    }

    extractText(html, options = {}) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const { selectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'], minLength = 0 } = options;
        
        const elements = doc.querySelectorAll(selectors.join(','));
        const text = [];
        
        for (const el of elements) {
            const content = el.textContent?.trim();
            if (content && content.length >= minLength) {
                text.push({
                    tag: el.tagName.toLowerCase(),
                    text: content
                });
            }
        }
        
        return text;
    }

    extractTable(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tables = [];
        
        for (const table of doc.querySelectorAll('table')) {
            const rows = [];
            
            for (const tr of table.querySelectorAll('tr')) {
                const cells = Array.from(tr.querySelectorAll('th, td')).map(cell => ({
                    header: cell.tagName === 'TH',
                    text: cell.textContent?.trim(),
                    colspan: cell.colSpan,
                    rowspan: cell.rowSpan
                }));
                rows.push(cells);
            }
            
            if (rows.length > 0) {
                tables.push({ rows });
            }
        }
        
        return tables;
    }

    async scrapeMultiple(urls, selectors, options = {}) {
        const results = [];
        
        for (const url of urls) {
            const result = await this.scrape(url, selectors, options);
            results.push({
                url,
                ...result
            });
            
            if (options.delay) {
                await new Promise(r => setTimeout(r, options.delay));
            }
        }
        
        return results;
    }

    async scrapeWithPagination(url, selectors, options = {}) {
        const {
            maxPages = 5,
            pageParam = 'page',
            selector = 'a[href]'
        } = options;
        
        const results = [];
        let currentPage = 1;
        let hasNextPage = true;
        
        while (currentPage <= maxPages && hasNextPage) {
            const pageUrl = currentPage === 1 ? url : `${url}${url.includes('?') ? '&' : '?'}${pageParam}=${currentPage}`;
            
            const result = await this.scrape(pageUrl, selectors);
            
            if (result.success) {
                results.push({
                    page: currentPage,
                    url: pageUrl,
                    ...result
                });
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(result.data.html, 'text/html');
                const nextLink = doc.querySelector(selector);
                
                hasNextPage = !!nextLink && nextLink.href;
                currentPage++;
            } else {
                hasNextPage = false;
            }
        }
        
        return results;
    }
}

class ScraperRateLimiter {
    constructor(maxRequests = 10, windowMs = 1000) {
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
}

export { WebScraper };