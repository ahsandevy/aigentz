/**
 * Admin Authentication API Service
 * 
 * Handles admin login, logout, and status checking.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class AdminAuthService {
    constructor() {
        this.tokenKey = 'admin_token';
        this.emailKey = 'admin_email';
    }

    /**
     * Get the stored admin token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get the stored admin email
     */
    getEmail() {
        return localStorage.getItem(this.emailKey);
    }

    /**
     * Store admin token and email
     */
    setAuth(token, email) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.emailKey, email);
    }

    /**
     * Clear admin authentication
     */
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.emailKey);
    }

    /**
     * Login with admin email
     */
    async login(email) {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        this.setAuth(data.token, data.email);
        return data;
    }

    /**
     * Logout
     */
    async logout() {
        const token = this.getToken();

        if (token) {
            try {
                await fetch(`${API_BASE_URL}/api/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch (error) {
                console.error('Logout request failed:', error);
            }
        }

        this.clearAuth();
    }

    /**
     * Check authentication status
     */
    async checkStatus() {
        const token = this.getToken();

        if (!token) {
            return { authenticated: false };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                this.clearAuth();
                return { authenticated: false };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Status check failed:', error);
            this.clearAuth();
            return { authenticated: false };
        }
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const adminAuthService = new AdminAuthService();
