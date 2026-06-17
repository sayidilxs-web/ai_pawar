/**
 * NEXUS AI - Validator Utility
 * ভ্যালিডেশন ইউটিলিটি
 */

const Validator = {
    // Required validation
    required(value, fieldName = 'Field') {
        if (value === null || value === undefined || value === '') {
            return `${fieldName} আবশ্যক`;
        }
        return null;
    },
    
    // Email validation
    email(value) {
        if (!value) return null;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'সঠিক ইমেইল ঠিকানা দিন';
        }
        return null;
    },
    
    // URL validation
    url(value) {
        if (!value) return null;
        
        try {
            new URL(value);
            return null;
        } catch {
            return 'সঠিক URL দিন';
        }
    },
    
    // Length validation
    minLength(value, min, fieldName = 'Field') {
        if (!value) return null;
        if (value.length < min) {
            return `${fieldName} কমপক্ষে ${min} অক্ষরের হতে হবে`;
        }
        return null;
    },
    
    maxLength(value, max, fieldName = 'Field') {
        if (!value) return null;
        if (value.length > max) {
            return `${fieldName} সর্বোচ্চ ${max} অক্ষরের হতে পারে`;
        }
        return null;
    },
    
    // Number validation
    min(value, min, fieldName = 'Value') {
        if (value === null || value === undefined) return null;
        if (Number(value) < min) {
            return `${fieldName} কমপক্ষে ${min} হতে হবে`;
        }
        return null;
    },
    
    max(value, max, fieldName = 'Value') {
        if (value === null || value === undefined) return null;
        if (Number(value) > max) {
            return `${fieldName} সর্বোচ্চ ${max} হতে পারে`;
        }
        return null;
    },
    
    // Pattern validation
    pattern(value, regex, message = 'ফরম্যাট সঠিক নয়') {
        if (!value) return null;
        if (!regex.test(value)) {
            return message;
        }
        return null;
    },
    
    // API Key validation
    apiKey(value) {
        if (!value) return 'API কী আবশ্যক';
        if (!value.startsWith('AIza')) {
            return 'সঠিক Google AI API কী দিন';
        }
        return null;
    },
    
    // Phone validation (Bangladeshi)
    phone(value) {
        if (!value) return null;
        
        const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return 'সঠিক মোবাইল নম্বর দিন';
        }
        return null;
    },
    
    // Date validation
    date(value) {
        if (!value) return null;
        
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'সঠিক তারিখ দিন';
        }
        return null;
    },
    
    // Custom validation
    custom(value, validatorFn, message) {
        if (!value) return null;
        if (!validatorFn(value)) {
            return message || 'Validation failed';
        }
        return null;
    },
    
    // Validate object
    validate(data, rules) {
        const errors = {};
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            
            for (const rule of fieldRules) {
                let error = null;
                
                if (typeof rule === 'string') {
                    // Simple validation type
                    switch (rule) {
                        case 'required':
                            error = this.required(value, field);
                            break;
                        case 'email':
                            error = this.email(value);
                            break;
                        case 'url':
                            error = this.url(value);
                            break;
                    }
                } else if (typeof rule === 'function') {
                    error = rule(value);
                } else if (typeof rule === 'object') {
                    // Validation with options
                    if (rule.type) {
                        switch (rule.type) {
                            case 'minLength':
                                error = this.minLength(value, rule.value, rule.field || field);
                                break;
                            case 'maxLength':
                                error = this.maxLength(value, rule.value, rule.field || field);
                                break;
                            case 'min':
                                error = this.min(value, rule.value, rule.field || field);
                                break;
                            case 'max':
                                error = this.max(value, rule.value, rule.field || field);
                                break;
                            case 'pattern':
                                error = this.pattern(value, rule.value, rule.message);
                                break;
                            case 'apiKey':
                                error = this.apiKey(value);
                                break;
                            case 'phone':
                                error = this.phone(value);
                                break;
                        }
                    }
                }
                
                if (error) {
                    if (!errors[field]) errors[field] = [];
                    errors[field].push(error);
                }
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Export
window.Validator = Validator;