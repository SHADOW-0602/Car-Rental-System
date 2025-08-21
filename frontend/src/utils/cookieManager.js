// Cookie management utility
class CookieManager {
    static setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        const isDev = window.location.hostname === 'localhost';
        const sameSite = isDev ? 'Lax' : 'Strict';
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=${sameSite}`;
    }

    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    static deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    static setUserSession(token, user) {
        try {
            // Always save to localStorage first
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ Session saved to localStorage');
            
            // Also save to cookies if consent given or in development
            const consent = this.getCookie('cookieConsent');
            const isDev = window.location.hostname === 'localhost';
            
            if (consent === 'true' || isDev) {
                this.setCookie('token', token, 7);
                this.setCookie('user', JSON.stringify(user), 7);
                console.log('✅ Session saved to cookies');
            }
        } catch (error) {
            console.error('Error setting user session:', error);
        }
    }

    static getUserSession() {
        try {
            // Try cookies first, then localStorage
            const cookieToken = this.getCookie('token');
            const localToken = localStorage.getItem('token');
            const cookieUser = this.getCookie('user');
            const localUser = localStorage.getItem('user');
            
            const token = cookieToken || localToken;
            const userStr = cookieUser || localUser;
            
            console.log('🔍 Session retrieval:', {
                cookieToken: !!cookieToken,
                localToken: !!localToken,
                cookieUser: !!cookieUser,
                localUser: !!localUser,
                finalToken: !!token,
                finalUser: !!userStr
            });
            
            let user = null;
            if (userStr) {
                try {
                    user = JSON.parse(userStr);
                } catch (parseError) {
                    console.warn('Failed to parse user data, clearing corrupted session:', parseError);
                    // Clear corrupted data
                    this.clearUserSession();
                    return { token: null, user: null };
                }
            }
            
            return { token, user };
        } catch (error) {
            console.error('Error getting user session:', error);
            // Clear corrupted data and return empty session
            this.clearUserSession();
            return { token: null, user: null };
        }
    }

    static clearUserSession() {
        try {
            this.deleteCookie('token');
            this.deleteCookie('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log('🗑️ Session cleared from cookies and localStorage');
        } catch (error) {
            console.error('Error clearing user session:', error);
        }
    }

    static isValidSession() {
        try {
            const { token, user } = this.getUserSession();
            return !!(token && user);
        } catch (error) {
            console.error('Error validating session:', error);
            return false;
        }
    }
}

export default CookieManager;