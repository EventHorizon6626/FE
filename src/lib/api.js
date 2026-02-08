import axios from 'axios';
import { BE_API_URL } from './env';

const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: BE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 90000, // 90 seconds for AI generation
});

export function getToken() {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Failed to get token:', error);
    return null;
  }
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('[Auth] Failed to set token:', error);
  }
}

export function clearToken() {
  setToken(null);
}

api.interceptors.request.use(
  (config) => {
    // Start timer for this request
    config.metadata = { startTime: Date.now() };

    if (process.env.NODE_ENV !== 'production') {
      const method = config.method?.toUpperCase() || 'REQUEST';
      const url = `${config.baseURL}${config.url}`;
      console.debug(`[API] ${method} ${url}`, config.data || '');
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // Log response timing
    const duration = Date.now() - response.config.metadata.startTime;
    const url = response.config.url;

    if (process.env.NODE_ENV !== 'production') {
      // Warn if request took > 5 seconds
      if (duration > 5000) {
        console.warn(`[API] Slow request (${duration}ms): ${url}`);
      }
      console.debug(`[API] Response (${duration}ms): ${url}`);
    }

    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const dataMsg = error?.response?.data?.message || error?.response?.data?.error;
    const message = dataMsg || error?.message || 'Network error';

    // Calculate request duration
    const duration = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : null;
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'REQUEST';

    if (typeof window !== 'undefined' && status === 401) {
      handleUnauthorized();
    }

    // Enhanced timeout error logging
    if (error.code === 'ECONNABORTED') {
      console.error(`[API] TIMEOUT after ${duration}ms: ${method} ${url}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('[API] Response error:', {
        status,
        message,
        url,
        method,
        duration: duration ? `${duration}ms` : 'unknown',
        code: error?.code,
        isTimeout: error.code === 'ECONNABORTED',
        hasResponse: !!error?.response,
        request: error?.request ? 'exists' : 'missing',
      });
      console.error('[API] Full error object:', error);
    }

    const wrappedError = new Error(message);
    wrappedError.status = status;
    wrappedError.raw = error?.response?.data;
    wrappedError.url = url;
    wrappedError.method = method;
    wrappedError.duration = duration;
    wrappedError.isTimeout = error.code === 'ECONNABORTED';

    return Promise.reject(wrappedError);
  },
);

function handleUnauthorized() {
  try {
    const currentPath = window.location.pathname + window.location.search;
    const isSignInPage = /^\/auth\/sign-in/i.test(window.location.pathname);
    
    if (!isSignInPage) {
      const returnUrl = encodeURIComponent(currentPath);
      window.location.replace(`/auth/sign-in?next=${returnUrl}`);
    }
  } catch (error) {
    console.error('[Auth] Failed to redirect to sign-in:', error);
  }
}

async function get(url, config = {}) {
  const response = await api.get(url, config);
  return response.data;
}

async function post(url, data = {}, config = {}) {
  const response = await api.post(url, data, config);
  return response.data;
}

async function put(url, data = {}, config = {}) {
  const response = await api.put(url, data, config);
  return response.data;
}

async function patch(url, data = {}, config = {}) {
  const response = await api.patch(url, data, config);
  return response.data;
}

async function del(url, config = {}) {
  const response = await api.delete(url, config);
  return response.data;
}

export const request = {
  get,
  post,
  put,
  patch,
  delete: del,

  // Helper for long-running operations with custom timeout
  withTimeout: (timeoutMs) => ({
    get: (url, config = {}) => get(url, { ...config, timeout: timeoutMs }),
    post: (url, data = {}, config = {}) => post(url, data, { ...config, timeout: timeoutMs }),
    put: (url, data = {}, config = {}) => put(url, data, { ...config, timeout: timeoutMs }),
    patch: (url, data = {}, config = {}) => patch(url, data, { ...config, timeout: timeoutMs }),
    delete: (url, config = {}) => del(url, { ...config, timeout: timeoutMs }),
  }),
};

export default api;
