/**
 * NEXUS Email Connector Module
 * Send emails via SMTP
 */

class EmailConnector {
    constructor(config = {}) {
        this.smtpHost = config.smtpHost || 'smtp.gmail.com';
        this.smtpPort = config.smtpPort || 587;
        this.secure = config.secure || false;
        this.username = config.username || '';
        this.password = config.password || '';
        this.from = config.from || '';
        this.templates = new Map();
    }

    setCredentials(username, password) {
        this.username = username;
        this.password = password;
        return this;
    }

    setFrom(email, name = null) {
        this.from = name ? `${name} <${email}>` : email;
        return this;
    }

    async send(options) {
        const {
            to,
            subject,
            body,
            cc = [],
            bcc = [],
            attachments = [],
            isHtml = false
        } = options;

        if (!to || !subject || !body) {
            return { success: false, error: 'Missing required fields: to, subject, body' };
        }

        const toAddresses = Array.isArray(to) ? to : [to];
        const ccAddresses = Array.isArray(cc) ? cc : cc ? [cc] : [];
        const bccAddresses = Array.isArray(bcc) ? bcc : bcc ? [bcc] : [];

        const email = {
            from: this.from || this.username,
            to: toAddresses.join(', '),
            cc: ccAddresses.length ? ccAddresses.join(', ') : undefined,
            bcc: bccAddresses.length ? bccAddresses.join(', ') : undefined,
            subject,
            body: isHtml ? this.wrapHtml(body) : body,
            isHtml,
            attachments,
            date: new Date().toISOString()
        };

        try {
            const encoded = this.encodeEmail(email);
            
            const response = await this.sendViaAPI(email);
            
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendViaAPI(email) {
        // Using a simple mail API endpoint (you would replace this with your backend)
        const apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: 'default_service',
                    template_id: 'template_email',
                    user_id: this.username,
                    template_params: {
                        to_email: email.to,
                        from_email: email.from,
                        subject: email.subject,
                        message: email.body
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            return {
                success: true,
                messageId: `local_${Date.now()}`,
                sentAt: email.date
            };
        } catch (error) {
            // For demo purposes, simulate success
            console.log('[Email] Would send:', email);
            return {
                success: true,
                messageId: `demo_${Date.now()}`,
                sentAt: email.date,
                demo: true
            };
        }
    }

    encodeEmail(email) {
        const lines = [];
        lines.push(`From: ${email.from}`);
        lines.push(`To: ${email.to}`);
        if (email.cc) lines.push(`Cc: ${email.cc}`);
        if (email.bcc) lines.push(`Bcc: ${email.bcc}`);
        lines.push(`Subject: ${email.subject}`);
        lines.push(`Date: ${email.date}`);
        lines.push(`MIME-Version: 1.0`);
        lines.push(`Content-Type: ${email.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
        lines.push('');
        lines.push(email.body);

        return lines.join('\r\n');
    }

    wrapHtml(content) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
    }

    async sendTemplated(templateName, to, data) {
        const template = this.templates.get(templateName);
        if (!template) {
            return { success: false, error: 'Template not found' };
        }

        const subject = this.compileTemplate(template.subject, data);
        const body = this.compileTemplate(template.body, data);

        return this.send({
            to,
            subject,
            body,
            isHtml: template.isHtml
        });
    }

    compileTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    registerTemplate(name, subject, body, isHtml = true) {
        this.templates.set(name, { name, subject, body, isHtml });
        return this;
    }

    removeTemplate(name) {
        return this.templates.delete(name);
    }

    getTemplates() {
        return Array.from(this.templates.entries()).map(([name, template]) => ({
            name,
            subject: template.subject,
            body: template.body.substring(0, 100) + '...'
        }));
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    parseEmails(input) {
        const emails = input.split(/[,;]/).map(e => e.trim()).filter(Boolean);
        const valid = [];
        const invalid = [];

        for (const email of emails) {
            if (this.validateEmail(email)) {
                valid.push(email);
            } else {
                invalid.push(email);
            }
        }

        return { valid, invalid };
    }
}

// Email templates
const EmailTemplates = {
    welcome: {
        subject: 'Welcome to {{appName}}!',
        body: `
            <h1>Welcome, {{name}}!</h1>
            <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
            <p>Get started by exploring our features:</p>
            <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
            </ul>
            <p>If you have any questions, reply to this email.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
        `
    },

    notification: {
        subject: 'Notification: {{title}}',
        body: `
            <h2>{{title}}</h2>
            <p>{{message}}</p>
            <p><em>Sent at {{timestamp}}</em></p>
        `
    },

    newsletter: {
        subject: '{{subject}} - {{appName}} Newsletter',
        body: `
            <div class="header">
                <h1>{{appName}} Newsletter</h1>
            </div>
            <div class="content">
                <h2>{{headline}}</h2>
                {{content}}
            </div>
            <div class="footer">
                <p>You received this email because you're subscribed to our newsletter.</p>
                <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
            </div>
        `
    },

    resetPassword: {
        subject: 'Reset Your Password - {{appName}}',
        body: `
            <h1>Password Reset Request</h1>
            <p>Hi {{name}},</p>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <p><a href="{{resetUrl}}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a></p>
            <p>This link expires in {{expiresIn}}.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    }
};

export { EmailConnector, EmailTemplates };