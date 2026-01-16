import axios from 'axios';
import { BE_API_URL } from './env';

const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: BE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
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
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const dataMsg = error?.response?.data?.message || error?.response?.data?.error;
    const message = dataMsg || error?.message || 'Network error';

    if (typeof window !== 'undefined' && status === 401) {
      handleUnauthorized();
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('[API] Response error:', {
        status,
        message,
        url: error?.config?.url,
      });
    }

    const wrappedError = new Error(message);
    wrappedError.status = status;
    wrappedError.raw = error?.response?.data;
    
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
};

export default api;
