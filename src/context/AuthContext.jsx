import { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/api.js';
import { DEMO_MODE, getDemoUser, loginDemo, logoutDemo } from '../services/demoMode.js';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function checkSession() {
      if (DEMO_MODE) {
        setUser(getDemoUser());
        setIsLoading(false);
        return;
      }
      try {
        // ponytail: also send stored Bearer token as fallback for browsers that block cookies
        const headers = { 'Content-Type': 'application/json' };
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        if (storedToken) headers.Authorization = `Bearer ${storedToken}`;
        const res = await fetch(`${API_BASE}/api/auth/status`, { credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) setUser(data.user);
          else setAccessToken(null);
        }
      } catch {
        // Network error — stay logged out
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  async function login(email, password) {
    if (DEMO_MODE) {
      if (!email.trim() || !password) throw new Error('Enter an email and password to continue.');
      const demoUser = loginDemo(email.trim());
      setUser(demoUser);
      return demoUser;
    }
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    setUser(data.user);
    if (data.access_token) {
      setAccessToken(data.access_token);
    }
    return data.user;
  }

  async function logout() {
    setAccessToken(null);
    if (DEMO_MODE) {
      logoutDemo();
      setUser(null);
      return;
    }
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Best effort
    }
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook intentionally shares this module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
