// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { request, setToken, clearToken, getToken } from 'lib/api';

const AuthContext = createContext(null);

// Get BE origin (strip trailing "/api")
function getBackendOrigin() {
  const base = (process.env.REACT_APP_BE_API_URL || '').trim();
  if (!base) return '';
  try {
    const u = new URL(base, window.location.origin);
    // remove trailing /api if present
    u.pathname = u.pathname.replace(/\/api\/?$/, '');
    return u.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    try {
      // Only fetch user if token exists
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }
      
      const res = await request.get('/auth/me');
      setUser(res?.user ?? null);
    } catch {
      // Token expired or invalid, clear it
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      // Check for OAuth callback token in URL hash
      // Backend redirects to: http://localhost:3001/path#token=eyJ...
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove #
        const params = new URLSearchParams(hash);
        const token = params.get('token');
        
        if (token) {
          // Store token and clear from URL
          setToken(token);
          window.location.hash = ''; // Clear token from URL for security
        }
      }
      
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const res = await request.post('/auth/login', { email, password });
      // Store JWT token from response
      if (res?.token) {
        setToken(res.token);
        setUser(res?.user ?? null);
      }
      return res?.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await request.post('/auth/logout', {});
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      clearToken();
      setUser(null);
      
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    }
  }, []);

  const loginWithGoogle = useCallback((next = '/') => {
    const be = getBackendOrigin(); // e.g. http://localhost:4000
    const url = `${be}/api/auth/google/start?next=${encodeURIComponent(next)}`;
    window.location.href = url;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    refresh,
    login,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
