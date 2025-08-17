// Cookie management utility
class CookieManager {
    static setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }

    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    static deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    static setUserSession(token, user) {
        if (this.getCookie('cookieConsent') === 'true') {
            this.setCookie('token', token, 7);
            this.setCookie('user', JSON.stringify(user), 7);
        }
        // Always set in localStorage as fallback
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUserSession() {
        // Try cookies first, then localStorage
        const token = this.getCookie('token') || localStorage.getItem('token');
        const userStr = this.getCookie('user') || localStorage.getItem('user');
        return {
            token,
            user: userStr ? JSON.parse(userStr) : null
        };
    }

    static clearUserSession() {
        this.deleteCookie('token');
        this.deleteCookie('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export default CookieManager;