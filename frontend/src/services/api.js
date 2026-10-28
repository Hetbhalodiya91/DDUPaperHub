import axios from 'axios';

export const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = import.meta.env.VITE_API_BASE_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://ddu-paperhub-backend.onrender.com/api';
  }
  return '/api';
};

export const getApiUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getBaseURL();
  if (base.startsWith('http')) {
    const origin = base.replace(/\/api\/?$/, '');
    return `${origin}${cleanPath}`;
  }
  return cleanPath;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ddu_paperhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('ddu_paperhub_token');
        localStorage.removeItem('ddu_paperhub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
