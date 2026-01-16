export const BE_API_URL = process.env.REACT_APP_BE_API_URL || 'http://localhost:4000'
export const SESSION_COOKIE_NAME = process.env.REACT_APP_SESSION_COOKIE_NAME || 'session'
export const SESSION_COOKIE_SECURE = (process.env.REACT_APP_SESSION_COOKIE_SECURE || 'false') === 'true'
export const SESSION_COOKIE_SAMESITE = process.env.REACT_APP_SESSION_COOKIE_SAMESITE || 'lax'
export const SESSION_COOKIE_MAX_AGE = parseInt(process.env.REACT_APP_SESSION_COOKIE_MAX_AGE || '2592000', 10)
export const AUTH_LOGIN_PATH = process.env.REACT_APP_AUTH_LOGIN_PATH || '/auth/login'
export const AUTH_ME_PATH = process.env.AUTH_ME_PATH || '/auth/me'
