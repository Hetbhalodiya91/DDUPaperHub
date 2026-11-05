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

/**
 * Extract a human-readable error message from an axios error.
 *
 * The backend's GlobalExceptionHandler returns two shapes:
 *   - Validation failures:  { "error": "Validation Failed", "errors": { field: "msg" } }
 *   - Other errors:         { "message": "..." }
 * The frontend used to only read `message`, so validation failures always
 * surfaced as the generic "Registration failed." instead of the real reason.
 */
export function getErrorMessage(error, fallback = 'An error occurred.') {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data === 'string') return data || fallback;

  // Validation errors: join all field messages into one readable string.
  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  return data.message || fallback;
}
