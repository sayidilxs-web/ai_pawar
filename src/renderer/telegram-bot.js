/**
 * NEXUS AI - Telegram Bot Integration
 * ভয়েস কমান্ডে Telegram-এ মেসেজ পাঠায়
 */

class TelegramBot {
    constructor() {
        this.botToken = ''; // User will set this
        this.chatId = '';    // User's chat ID
        this.enabled = false;
        this.apiUrl = 'https://api.telegram.org/bot';
    }

    // Configure bot
    configure(token, chatId) {
        this.botToken = token;
        this.chatId = chatId;
        this.enabled = true;
        console.log('[Telegram] Bot configured successfully');
        return true;
    }

    // Check if configured
    isConfigured() {
        return this.enabled && this.botToken && this.chatId;
    }

    // Send message via Telegram
    async sendMessage(text) {
        if (!this.isConfigured()) {
            return { error: 'Telegram bot সেটআপ হয়নি। সেটিংসে যোগ করুন।' };
        }

        try {
            const response = await fetch(`${this.apiUrl}${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();
            if (data.ok) {
                return { success: true, message: 'Telegram-এ মেসেজ পাঠানো হয়েছে!' };
            } else {
                return { error: 'মেসেজ পাঠাতে সমস্যা হয়েছে' };
            }
        } catch (error) {
            return { error: 'Telegram সংযোগে সমস্যা' };
        }
    }

    // Send photo
    async sendPhoto(photoUrl, caption = '') {
        if (!this.isConfigured()) {
            return { error: 'Telegram bot সেটআপ হয়নি' };
        }

        try {
            const response = await fetch(`${this.apiUrl}${this.botToken}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    photo: photoUrl,
                    caption: caption
                })
            });

            const data = await response.json();
            if (data.ok) {
                return { success: true };
            }
        } catch (error) {
            return { error: 'ছবি পাঠাতে সমস্যা' };
        }
    }

    // Send document
    async sendDocument(fileBlob, filename) {
        if (!this.isConfigured()) {
            return { error: 'Telegram bot সেটআপ হয়নি' };
        }

        try {
            const formData = new FormData();
            formData.append('chat_id', this.chatId);
            formData.append('document', fileBlob, filename);

            const response = await fetch(`${this.apiUrl}${this.botToken}/sendDocument`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.ok) {
                return { success: true };
            }
        } catch (error) {
            return { error: 'ফাইল পাঠাতে সমস্যা' };
        }
    }

    // Get updates (for receiving messages)
    async getUpdates() {
        if (!this.isConfigured()) return null;

        try {
            const response = await fetch(`${this.apiUrl}${this.botToken}/getUpdates`);
            const data = await response.json();
            return data.ok ? data.result : [];
        } catch (error) {
            return [];
        }
    }

    // Process commands - check if message contains telegram commands
    shouldSendToTelegram(query) {
        const telegramKeywords = [
            'টেলিগ্রাম', 'telegram', 'মেসেজ পাঠাও', 'telegram-এ', 'telegramে',
            'whatapp-এ', 'whatsapp-এ', 'হোয়াটসঅ্যাপ', 'whatsapp'
        ];
        return telegramKeywords.some(keyword => query.toLowerCase().includes(keyword));
    }

    // Extract message to send from query
    extractMessage(query) {
        return query
            .replace(/টেলিগ্রাম\s*/gi, '')
            .replace(/telegram\s*/gi, '')
            .replace(/মেসেজ\s*পাঠাও\s*/gi, '')
            .replace(/telegram-এ\s*/gi, '')
            .replace(/telegramে\s*/gi, '')
            .replace(/whatapp-এ\s*/gi, '')
            .replace(/whatsapp-এ\s*/gi, '')
            .replace(/হোয়াটসঅ্যাপ\s*/gi, '')
            .replace(/whatsapp\s*/gi, '')
            .replace(/পাঠাও\s*/gi, '')
            .trim();
    }
}

const telegramBot = new TelegramBot();
