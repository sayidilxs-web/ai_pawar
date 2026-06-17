/**
 * NEXUS Authentication Module
 * User authentication and session management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessions = new Map();
        this.tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.listeners = new Map();
    }

    async signup(email, password, userData = {}) {
        if (!this.validateEmail(email)) {
            return { success: false, error: 'Invalid email format' };
        }

        if (password.length < 8) {
            return { success: false, error: 'Password must be at least 8 characters' };
        }

        const existingKey = `user_${email}`;
        if (localStorage.getItem(existingKey)) {
            return { success: false, error: 'Email already registered' };
        }

        const user = {
            id: this.generateId(),
            email,
            passwordHash: this.hashPassword(password),
            ...userData,
            createdAt: Date.now(),
            lastLogin: null
        };

        localStorage.setItem(existingKey, JSON.stringify(user));

        return this.login(email, password);
    }

    async login(email, password) {
        const userKey = `user_${email}`;
        const userData = localStorage.getItem(userKey);

        if (!userData) {
            return { success: false, error: 'Invalid email or password' };
        }

        const user = JSON.parse(userData);
        const passwordHash = this.hashPassword(password);

        if (passwordHash !== user.passwordHash) {
            return { success: false, error: 'Invalid email or password' };
        }

        user.lastLogin = Date.now();
        localStorage.setItem(userKey, JSON.stringify(user));

        const token = this.generateToken();
        const session = {
            token,
            userId: user.id,
            email: user.email,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.tokenExpiry
        };

        this.sessions.set(token, session);
        this.currentUser = { id: user.id, email: user.email, ...userData };

        this.persistSession(token, session);
        this.emit('login', this.currentUser);

        return {
            success: true,
            user: this.currentUser,
            token
        };
    }

    logout(token = null) {
        if (token) {
            this.sessions.delete(token);
            localStorage.removeItem(`session_${token}`);
        } else {
            for (const [t] of this.sessions) {
                localStorage.removeItem(`session_${t}`);
            }
            this.sessions.clear();
        }

        const user = this.currentUser;
        this.currentUser = null;
        
        if (user) {
            this.emit('logout', user);
        }
    }

    async restoreSession() {
        const sessionKey = 'current_session';
        const token = localStorage.getItem(sessionKey);

        if (!token) {
            return { success: false, error: 'No session found' };
        }

        const session = this.loadSession(token);

        if (!session || session.expiresAt < Date.now()) {
            localStorage.removeItem(sessionKey);
            return { success: false, error: 'Session expired' };
        }

        this.sessions.set(token, session);

        const userKey = `user_${session.email}`;
        const userData = localStorage.getItem(userKey);

        if (userData) {
            const user = JSON.parse(userData);
            this.currentUser = { id: user.id, email: user.email };
            return { success: true, user: this.currentUser, token };
        }

        return { success: false, error: 'User not found' };
    }

    verify(token) {
        if (!token) {
            return { valid: false, error: 'No token provided' };
        }

        const session = this.sessions.get(token) || this.loadSession(token);

        if (!session) {
            return { valid: false, error: 'Invalid token' };
        }

        if (session.expiresAt < Date.now()) {
            this.sessions.delete(token);
            localStorage.removeItem(`session_${token}`);
            return { valid: false, error: 'Token expired' };
        }

        return {
            valid: true,
            session: {
                userId: session.userId,
                email: session.email
            }
        };
    }

    refreshToken(token) {
        const session = this.sessions.get(token);
        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        session.expiresAt = Date.now() + this.tokenExpiry;
        this.sessions.set(token, session);
        this.persistSession(token, session);

        return { success: true, token };
    }

    changePassword(email, oldPassword, newPassword) {
        const userKey = `user_${email}`;
        const userData = localStorage.getItem(userKey);

        if (!userData) {
            return { success: false, error: 'User not found' };
        }

        const user = JSON.parse(userData);
        const oldHash = this.hashPassword(oldPassword);

        if (oldHash !== user.passwordHash) {
            return { success: false, error: 'Current password is incorrect' };
        }

        if (newPassword.length < 8) {
            return { success: false, error: 'New password must be at least 8 characters' };
        }

        user.passwordHash = this.hashPassword(newPassword);
        user.passwordChangedAt = Date.now();
        localStorage.setItem(userKey, JSON.stringify(user));

        return { success: true };
    }

    updateProfile(email, data) {
        const userKey = `user_${email}`;
        const userData = localStorage.getItem(userKey);

        if (!userData) {
            return { success: false, error: 'User not found' };
        }

        const user = JSON.parse(userData);
        const allowedFields = ['name', 'avatar', 'bio', 'preferences'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                user[field] = data[field];
            }
        }

        user.updatedAt = Date.now();
        localStorage.setItem(userKey, JSON.stringify(user));

        return { success: true, user };
    }

    deleteAccount(email, password) {
        const userKey = `user_${email}`;
        const userData = localStorage.getItem(userKey);

        if (!userData) {
            return { success: false, error: 'User not found' };
        }

        const user = JSON.parse(userData);
        const passwordHash = this.hashPassword(password);

        if (passwordHash !== user.passwordHash) {
            return { success: false, error: 'Invalid password' };
        }

        localStorage.removeItem(userKey);

        for (const [token, session] of this.sessions) {
            if (session.email === email) {
                this.sessions.delete(token);
                localStorage.removeItem(`session_${token}`);
            }
        }

        if (this.currentUser?.email === email) {
            this.currentUser = null;
        }

        return { success: true };
    }

    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }

    hashPassword(password) {
        let hash = 0;
        const salt = 'nexus_auth_v1';
        const salted = password + salt;
        
        for (let i = 0; i < salted.length; i++) {
            const char = salted.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return hash.toString(16);
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    persistSession(token, session) {
        localStorage.setItem('current_session', token);
        localStorage.setItem(`session_${token}`, JSON.stringify(session));
    }

    loadSession(token) {
        const data = localStorage.getItem(`session_${token}`);
        return data ? JSON.parse(data) : null;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(data);
            }
        }
    }
}

export { AuthManager };