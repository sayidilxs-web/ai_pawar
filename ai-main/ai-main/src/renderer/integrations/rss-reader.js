/**
 * NEXUS RSS Reader Module
 * RSS/Atom feed aggregation
 */

class RSSReader {
    constructor() {
        this.feeds = new Map();
        this.items = [];
        this.maxItemsPerFeed = 100;
    }

    async fetchFeed(url) {
        try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=50`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.message || 'Feed parsing failed');
            }
            
            return {
                success: true,
                data: {
                    title: data.feed.title,
                    description: data.feed.description,
                    link: data.feed.link,
                    image: data.feed.image,
                    items: data.items.map(item => ({
                        title: item.title,
                        link: item.link,
                        description: item.description,
                        content: item.content,
                        author: item.author,
                        categories: item.categories,
                        pubDate: new Date(item.pubDate),
                        thumbnail: item.thumbnail,
                        enclosure: item.enclosure
                    }))
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async addFeed(url, name = null) {
        const result = await this.fetchFeed(url);
        
        if (!result.success) {
            return result;
        }

        const feed = {
            url,
            name: name || result.data.title,
            title: result.data.title,
            description: result.data.description,
            link: result.data.link,
            image: result.data.image,
            items: result.data.items,
            addedAt: Date.now(),
            lastFetched: Date.now()
        };

        this.feeds.set(url, feed);
        
        for (const item of feed.items) {
            if (!this.items.find(i => i.link === item.link)) {
                this.items.push({ ...item, feedUrl: url, feedTitle: feed.title });
            }
        }

        this.sortItems();
        
        return { success: true, feed };
    }

    async removeFeed(url) {
        if (!this.feeds.has(url)) {
            return { success: false, error: 'Feed not found' };
        }

        const feed = this.feeds.get(url);
        this.feeds.delete(url);
        
        this.items = this.items.filter(item => item.feedUrl !== url);
        
        return { success: true, removed: feed.name };
    }

    async refreshFeed(url) {
        const feed = this.feeds.get(url);
        if (!feed) {
            return { success: false, error: 'Feed not found' };
        }

        const result = await this.fetchFeed(url);
        
        if (!result.success) {
            return result;
        }

        const newItems = [];
        
        for (const item of result.data.items) {
            if (!feed.items.find(i => i.link === item.link)) {
                newItems.push({ ...item, feedUrl: url, feedTitle: feed.title });
                feed.items.unshift(item);
            }
        }

        if (feed.items.length > this.maxItemsPerFeed) {
            feed.items = feed.items.slice(0, this.maxItemsPerFeed);
        }

        feed.lastFetched = Date.now();

        for (const item of newItems) {
            if (!this.items.find(i => i.link === item.link)) {
                this.items.push(item);
            }
        }

        this.sortItems();

        return { success: true, newItems: newItems.length, feed };
    }

    async refreshAll() {
        const results = [];
        
        for (const url of this.feeds.keys()) {
            const result = await this.refreshFeed(url);
            results.push({ url, ...result });
        }
        
        return results;
    }

    getFeed(url) {
        return this.feeds.get(url);
    }

    getAllFeeds() {
        return Array.from(this.feeds.values()).map(f => ({
            url: f.url,
            name: f.name,
            title: f.title,
            description: f.description,
            link: f.link,
            image: f.image,
            itemCount: f.items.length,
            lastFetched: f.lastFetched,
            addedAt: f.addedAt
        }));
    }

    getItems(options = {}) {
        let filtered = [...this.items];
        
        if (options.feedUrl) {
            filtered = filtered.filter(item => item.feedUrl === options.feedUrl);
        }
        
        if (options.category) {
            filtered = filtered.filter(item => 
                item.categories?.includes(options.category)
            );
        }
        
        if (options.search) {
            const query = options.search.toLowerCase();
            filtered = filtered.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
        }
        
        if (options.fromDate) {
            filtered = filtered.filter(item => item.pubDate >= new Date(options.fromDate));
        }
        
        if (options.toDate) {
            filtered = filtered.filter(item => item.pubDate <= new Date(options.toDate));
        }
        
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
    }

    getCategories() {
        const categories = new Set();
        
        for (const item of this.items) {
            if (item.categories) {
                for (const cat of item.categories) {
                    categories.add(cat);
                }
            }
        }
        
        return Array.from(categories);
    }

    sortItems(by = 'date', order = 'desc') {
        this.items.sort((a, b) => {
            let comparison = 0;
            
            switch (by) {
                case 'date':
                    comparison = a.pubDate - b.pubDate;
                    break;
                case 'title':
                    comparison = (a.title || '').localeCompare(b.title || '');
                    break;
                case 'feed':
                    comparison = a.feedTitle.localeCompare(b.feedTitle);
                    break;
            }
            
            return order === 'desc' ? -comparison : comparison;
        });
    }

    markAsRead(itemLink) {
        const item = this.items.find(i => i.link === itemLink);
        if (item) {
            item.read = true;
            return true;
        }
        return false;
    }

    markAllAsRead(feedUrl = null) {
        for (const item of this.items) {
            if (!feedUrl || item.feedUrl === feedUrl) {
                item.read = true;
            }
        }
    }

    getUnreadCount(feedUrl = null) {
        return this.items.filter(item => {
            if (feedUrl && item.feedUrl !== feedUrl) return false;
            return !item.read;
        }).length;
    }

    save() {
        const data = {
            feeds: Array.from(this.feeds.entries()).map(([url, feed]) => ({
                url,
                name: feed.name,
                items: feed.items
            })),
            items: this.items.map(item => ({
                ...item,
                pubDate: item.pubDate.getTime()
            }))
        };
        
        return JSON.stringify(data);
    }

    load(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            this.feeds.clear();
            this.items = [];
            
            for (const feedData of (data.feeds || [])) {
                this.feeds.set(feedData.url, {
                    ...feedData,
                    addedAt: Date.now(),
                    lastFetched: Date.now()
                });
            }
            
            for (const item of (data.items || [])) {
                this.items.push({
                    ...item,
                    pubDate: new Date(item.pubDate)
                });
            }
            
            this.sortItems();
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    exportOPML() {
        let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
<head>
    <title>NEXUS RSS Feeds</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
</head>
<body>
`;

        for (const feed of this.feeds.values()) {
            const title = feed.name || feed.title || feed.url;
            const xmlUrl = feed.url;
            const htmlUrl = feed.link || '';
            
            opml += `    <outline text="${this.escapeXml(title)}" title="${this.escapeXml(title)}" type="rss" xmlUrl="${this.escapeXml(xmlUrl)}" htmlUrl="${this.escapeXml(htmlUrl)}"/>\n`;
        }

        opml += `</body>
</opml>`;

        return opml;
    }

    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    importOPML(opml) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(opml, 'text/xml');
            const outlines = doc.querySelectorAll('outline[xmlUrl]');
            
            const results = [];
            
            for (const outline of outlines) {
                const xmlUrl = outline.getAttribute('xmlUrl');
                const name = outline.getAttribute('title') || outline.getAttribute('text');
                
                if (xmlUrl) {
                    results.push({ url: xmlUrl, name });
                }
            }
            
            return { success: true, feeds: results };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export { RSSReader };