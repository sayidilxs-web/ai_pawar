/**
 * NEXUS Bot Integration Module
 * Slack & Discord bot integration
 */

class BotIntegration {
    constructor() {
        this.slack = new SlackBot();
        this.discord = new DiscordBot();
    }
}

class SlackBot {
    constructor() {
        this.token = null;
        this.botUserId = null;
        this.teamId = null;
        this.channels = new Map();
        this.webhookUrl = null;
    }

    async authenticate(token) {
        this.token = token;
        
        try {
            const response = await fetch('https://slack.com/api/auth.test', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.error || 'Authentication failed');
            }
            
            this.botUserId = data.user_id;
            this.teamId = data.team_id;
            
            return {
                success: true,
                user: {
                    id: data.user_id,
                    name: data.user,
                    team: data.team
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    setWebhook(url) {
        this.webhookUrl = url;
    }

    async postMessage(channel, text, options = {}) {
        try {
            const payload = {
                channel,
                text,
                ...options
            };

            const response = await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.error);
            }

            return {
                success: true,
                message: {
                    ts: data.ts,
                    channel: data.channel
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async postToWebhook(text, options = {}) {
        if (!this.webhookUrl) {
            return { success: false, error: 'Webhook URL not set' };
        }

        try {
            const payload = {
                text,
                ...options
            };

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getChannels() {
        try {
            const response = await fetch(
                'https://slack.com/api/conversations.list?types=public_channel,private_channel',
                { headers: { 'Authorization': `Bearer ${this.token}` } }
            );
            
            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.error);
            }

            for (const channel of data.channels) {
                this.channels.set(channel.id, channel);
            }

            return {
                success: true,
                channels: data.channels.map(c => ({
                    id: c.id,
                    name: c.name,
                    isPrivate: c.is_private,
                    memberCount: c.num_members
                }))
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendDirectMessage(userId, text, options = {}) {
        try {
            // Open a direct message channel first
            const openResponse = await fetch('https://slack.com/api/conversations.open', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users: userId })
            });

            const openData = await openResponse.json();
            
            if (!openData.ok) {
                throw new Error(openData.error);
            }

            // Then send the message
            return this.postMessage(openData.channel.id, text, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    formatBlockKit(blocks) {
        return JSON.stringify({ blocks });
    }

    createButtonAction(actionId, text, value, style = 'default') {
        return {
            type: 'button',
            text: { type: 'plain_text', text },
            action_id: actionId,
            value,
            style
        };
    }

    createSection(text, options = {}) {
        const section = {
            type: 'section',
            text: {
                type: options.type || 'mrkdwn',
                text
            }
        };

        if (options.accessory) {
            section.accessory = options.accessory;
        }

        return section;
    }

    createDivider() {
        return { type: 'divider' };
    }
}

class DiscordBot {
    constructor() {
        this.token = null;
        this.applicationId = null;
        this.webhookUrl = null;
    }

    async authenticate(token) {
        this.token = token;
        
        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { 'Authorization': `Bot ${token}` }
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || 'Authentication failed');
            }
            
            this.applicationId = data.id;
            
            return {
                success: true,
                user: {
                    id: data.id,
                    username: data.username,
                    discriminator: data.discriminator
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    setWebhook(url) {
        this.webhookUrl = url;
    }

    async sendMessage(channelId, content, options = {}) {
        if (!this.token) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const payload = {
                content,
                ...options
            };

            if (options.embeds) {
                payload.embeds = options.embeds;
            }

            const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                message: {
                    id: data.id,
                    channelId: data.channel_id,
                    timestamp: data.timestamp
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendToWebhook(content, options = {}) {
        if (!this.webhookUrl) {
            return { success: false, error: 'Webhook URL not set' };
        }

        try {
            const payload = {
                content,
                ...options
            };

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    createEmbed(options = {}) {
        const embed = {
            title: options.title,
            description: options.description,
            url: options.url,
            color: options.color || 0x2196F3,
            author: options.author ? {
                name: options.author.name,
                icon_url: options.author.icon
            } : undefined,
            fields: options.fields?.map(f => ({
                name: f.name,
                value: f.value,
                inline: f.inline || false
            })),
            thumbnail: options.thumbnail ? {
                url: options.thumbnail
            } : undefined,
            image: options.image ? {
                url: options.image
            } : undefined,
            footer: options.footer ? {
                text: options.footer.text,
                icon_url: options.footer.icon
            } : undefined,
            timestamp: options.timestamp ? new Date(options.timestamp).toISOString() : undefined
        };

        return embed;
    }

    createButton(style = 1, label, customId) {
        return {
            type: 2,
            style,
            label,
            custom_id: customId
        };
    }

    createActionRow(components) {
        return {
            type: 1,
            components
        };
    }

    async getChannel(channelId) {
        if (!this.token) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
                headers: { 'Authorization': `Bot ${this.token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                channel: {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    topic: data.topic
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createDM(userId) {
        if (!this.token) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch('https://discord.com/api/v10/users/@me/channels', {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipient_id: userId })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                channelId: data.id
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export { BotIntegration, SlackBot, DiscordBot };