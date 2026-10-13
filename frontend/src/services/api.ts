import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = rawBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request and dynamically route /v2 and /v3 requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url && (config.url.startsWith('/v2') || config.url.startsWith('/v3'))) {
    config.baseURL = `${API_BASE}/api`;
  } else {
    config.baseURL = `${API_BASE}/api/v1`;
  }

  return config;
});

// Handle 401 — clear auth store fully then redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Import lazily to avoid circular dependency
      // Clear Zustand persisted state + localStorage in one call
      import('../store').then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth();
      });
      // Small delay so the store update propagates before navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 50);
    }
    return Promise.reject(error);
  }
);

export default api;
