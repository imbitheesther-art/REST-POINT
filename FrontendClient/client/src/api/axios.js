import axios from 'axios';
import { ENDPOINTS } from './endpoints';

// Base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Crucial for HTTP-only cookies & CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  // Try to load token from localStorage if cookie is not used/configured
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Attach tenant slug from active tenant store if available
  const tenantSlug = localStorage.getItem('tenant_slug') || 'system_shared';
  config.headers['x-tenant-slug'] = tenantSlug;
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + ENDPOINTS.AUTH.REFRESH;
        const response = await axios.post(refreshUrl, {}, { withCredentials: true });
        
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth details on failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

