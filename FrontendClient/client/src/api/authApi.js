import api from './axios';
import { ENDPOINTS } from './endpoints';

export const authApi = {
  /**
   * Login — POST /api/v1/restpoint/login
   * Backend returns: { success, accessToken, refreshToken, user }
   */
  login: async ({ identifier, password }) => {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { identifier, password });
    const data = response.data;

    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(data.user || {}));
    }
    return data;
  },

  /**
   * Logout — POST /api/v1/restpoint/logout
   */
  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (_) {
      // swallow network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_slug');
    }
    return { success: true };
  },

  /**
   * Get current authenticated user — GET /api/v1/restpoint/me
   */
  getMe: async () => {
    const response = await api.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Refresh access token — POST /api/v1/restpoint/refresh
   */
  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const data = response.data;
    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    return data;
  },

  /**
   * Check auth status (passive — no error on 401) — GET /api/v1/restpoint/status
   */
  checkStatus: async () => {
    try {
      const response = await api.get(ENDPOINTS.AUTH.STATUS);
      return response.data;
    } catch {
      return { authenticated: false };
    }
  },

  /**
   * Register new tenant admin user — POST /api/v1/restpoint/register
   */
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },
};
