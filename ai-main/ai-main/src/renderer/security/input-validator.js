/**
 * NEXUS Input Validator Module
 * XSS/SQL injection protection and input validation
 */

class InputValidator {
    constructor() {
        this.rules = new Map();
        this.errors = [];
        this.setupDefaultRules();
    }

    setupDefaultRules() {
        this.rules.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format'
        });

        this.rules.set('url', {
            pattern: /^https?:\/\/.+/,
            message: 'Invalid URL format'
        });

        this.rules.set('phone', {
            pattern: /^[\d\s\-\+\(\)]{10,}$/,
            message: 'Invalid phone number'
        });

        this.rules.set('username', {
            pattern: /^[a-zA-Z0-9_]{3,20}$/,
            message: 'Username must be 3-20 characters, alphanumeric and underscore only'
        });

        this.rules.set('password', {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
            requireSpecial: false
        });

        this.rules.set('alpha', {
            pattern: /^[a-zA-Z]+$/,
            message: 'Only alphabetic characters allowed'
        });

        this.rules.set('alphanumeric', {
            pattern: /^[a-zA-Z0-9]+$/,
            message: 'Only alphanumeric characters allowed'
        });

        this.rules.set('numeric', {
            pattern: /^\d+$/,
            message: 'Only numeric characters allowed'
        });
    }

    validate(value, rules) {
        this.errors = [];
        const results = [];

        for (const [rule, config] of Object.entries(rules)) {
            const result = this.validateRule(value, rule, config);
            results.push(result);

            if (!result.valid) {
                this.errors.push({
                    rule,
                    message: result.message || config.message
                });
            }
        }

        return {
            valid: results.every(r => r.valid),
            errors: this.errors,
            results
        };
    }

    validateRule(value, rule, config) {
        switch (rule) {
            case 'required':
                return this.validateRequired(value);
            case 'minLength':
                return this.validateMinLength(value, config);
            case 'maxLength':
                return this.validateMaxLength(value, config);
            case 'pattern':
                return this.validatePattern(value, config);
            case 'email':
            case 'url':
            case 'phone':
            case 'username':
            case 'alpha':
            case 'alphanumeric':
            case 'numeric':
                return this.validateByRule(value, rule);
            case 'password':
                return this.validatePassword(value, config);
            case 'range':
                return this.validateRange(value, config.min, config.max);
            case 'in':
                return this.validateIn(value, Array.isArray(config) ? config : [config]);
            case 'notIn':
                return this.validateNotIn(value, Array.isArray(config) ? config : [config]);
            case 'equals':
                return this.validateEquals(value, config);
            case 'type':
                return this.validateType(value, config);
            case 'custom':
                return this.validateCustom(value, config);
            default:
                return { valid: true };
        }
    }

    validateRequired(value) {
        const valid = value !== null && value !== undefined && value !== '';
        return {
            valid,
            message: valid ? null : 'This field is required'
        };
    }

    validateMinLength(value, min) {
        const str = String(value || '');
        const valid = str.length >= min;
        return {
            valid,
            message: valid ? null : `Minimum ${min} characters required`
        };
    }

    validateMaxLength(value, max) {
        const str = String(value || '');
        const valid = str.length <= max;
        return {
            valid,
            message: valid ? null : `Maximum ${max} characters allowed`
        };
    }

    validatePattern(value, pattern) {
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        const valid = regex.test(String(value || ''));
        return {
            valid,
            message: valid ? null : 'Invalid format'
        };
    }

    validateByRule(value, rule) {
        const ruleConfig = this.rules.get(rule);
        if (!ruleConfig) {
            return { valid: true };
        }

        const valid = ruleConfig.pattern.test(String(value || ''));
        return {
            valid,
            message: valid ? null : ruleConfig.message
        };
    }

    validatePassword(value, config) {
        const errors = [];
        const str = String(value || '');

        if (config.minLength && str.length < config.minLength) {
            errors.push(`at least ${config.minLength} characters`);
        }
        if (config.requireUppercase && !/[A-Z]/.test(str)) {
            errors.push('an uppercase letter');
        }
        if (config.requireLowercase && !/[a-z]/.test(str)) {
            errors.push('a lowercase letter');
        }
        if (config.requireNumber && !/\d/.test(str)) {
            errors.push('a number');
        }
        if (config.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(str)) {
            errors.push('a special character');
        }

        return {
            valid: errors.length === 0,
            message: errors.length === 0 ? null : `Password must contain ${errors.join(', ')}`
        };
    }

    validateRange(value, min, max) {
        const num = Number(value);
        const valid = !isNaN(num) && num >= min && num <= max;
        return {
            valid,
            message: valid ? null : `Value must be between ${min} and ${max}`
        };
    }

    validateIn(value, allowed) {
        const valid = allowed.includes(value);
        return {
            valid,
            message: valid ? null : `Value must be one of: ${allowed.join(', ')}`
        };
    }

    validateNotIn(value, disallowed) {
        const valid = !disallowed.includes(value);
        return {
            valid,
            message: valid ? null : `Value is not allowed`
        };
    }

    validateEquals(value, compare) {
        const valid = value === compare;
        return {
            valid,
            message: valid ? null : 'Values do not match'
        };
    }

    validateType(value, type) {
        let valid = false;

        switch (type) {
            case 'string':
                valid = typeof value === 'string';
                break;
            case 'number':
                valid = typeof value === 'number' && !isNaN(value);
                break;
            case 'boolean':
                valid = typeof value === 'boolean';
                break;
            case 'array':
                valid = Array.isArray(value);
                break;
            case 'object':
                valid = typeof value === 'object' && value !== null && !Array.isArray(value);
                break;
            case 'date':
                valid = !isNaN(Date.parse(value));
                break;
        }

        return {
            valid,
            message: valid ? null : `Expected type: ${type}`
        };
    }

    validateCustom(value, fn) {
        try {
            const result = fn(value);
            return {
                valid: result === true,
                message: typeof result === 'string' ? result : null
            };
        } catch (error) {
            return { valid: false, message: 'Custom validation failed' };
        }
    }

    sanitize(value, type = 'text') {
        switch (type) {
            case 'text':
                return this.sanitizeText(value);
            case 'html':
                return this.sanitizeHtml(value);
            case 'url':
                return this.sanitizeUrl(value);
            case 'number':
                return this.sanitizeNumber(value);
            case 'email':
                return this.sanitizeEmail(value);
            default:
                return String(value);
        }
    }

    sanitizeText(value) {
        if (value === null || value === undefined) return '';
        
        return String(value)
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    sanitizeHtml(value) {
        if (value === null || value === undefined) return '';
        
        const temp = document.createElement('div');
        temp.textContent = value;
        return temp.innerHTML
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }

    sanitizeUrl(value) {
        if (value === null || value === undefined) return '';
        
        const str = String(value).toLowerCase().trim();
        
        if (str.startsWith('javascript:') || str.startsWith('data:')) {
            return '';
        }
        
        return str;
    }

    sanitizeNumber(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    sanitizeEmail(value) {
        if (value === null || value === undefined) return '';
        
        return String(value)
            .toLowerCase()
            .replace(/[^a-z0-9@._-]/g, '')
            .trim();
    }

    preventXSS(value) {
        const dangerous = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi,
            /expression\s*\(/gi,
            /url\s*\(/gi
        ];

        let sanitized = value;
        
        for (const pattern of dangerous) {
            sanitized = sanitized.replace(pattern, '');
        }

        return sanitized;
    }

    preventSQLInjection(value) {
        if (typeof value !== 'string') return value;

        const dangerous = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(--|;|\/\*|\*\/|@@|@)/g,
            /('|"|`)/g,
            /\b(OR|AND)\b\s+\d+\s*=\s*\d+/gi
        ];

        let sanitized = value;

        for (const pattern of dangerous) {
            sanitized = sanitized.replace(pattern, match => {
                if (/['"`]/.test(match)) return '';
                return match.split('').map(c => '\\x' + c.charCodeAt(0).toString(16)).join('');
            });
        }

        return sanitized;
    }

    validateForm(formData, schema) {
        const results = {};
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = formData[field];
            const validation = this.validate(value, rules);
            
            results[field] = validation;

            if (!validation.valid) {
                errors[field] = validation.errors.map(e => e.message);
            }
        }

        return {
            valid: Object.values(results).every(r => r.valid),
            results,
            errors
        };
    }

    addRule(name, config) {
        this.rules.set(name, config);
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

export { InputValidator };