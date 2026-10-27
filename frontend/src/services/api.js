import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
