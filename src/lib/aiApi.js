import axios from 'axios';

// AI API runs on port 5000
const AI_API_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5000';

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000, // 60 seconds for AI processing
});

// Request interceptor for logging
aiApi.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== 'production') {
      const method = config.method?.toUpperCase() || 'REQUEST';
      const url = `${config.baseURL}${config.url}`;
      console.debug(`[AI API] ${method} ${url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    console.error('[AI API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
aiApi.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AI API] Response:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[AI API] Response error:', error.response?.data || error.message);

    // Wrap error for consistent handling
    const wrappedError = {
      message: error.response?.data?.detail || error.message || 'AI API request failed',
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(wrappedError);
  }
);

export default aiApi;
