import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  //test
  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // ponytail: also send stored Bearer token as fallback for browsers that block cookies
      const headers = { 'Content-Type': 'application/json' };
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
      const res = await fetch(`${API_BASE}/api/auth/status`, {
        credentials: 'include',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setAccessToken(null);
        }
      }
    } catch (e) {
      // Network error — stay logged out
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
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
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
