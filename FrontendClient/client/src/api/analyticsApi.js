import api from './axios';
import { ENDPOINTS } from './endpoints';

export const analyticsApi = {
  /**
   * Core mortuary analytics dashboard data
   * GET /api/v1/restpoint/analytics/mortuary-analytics
   */
  getMortuaryAnalytics: async () => {
    const response = await api.get(ENDPOINTS.ANALYTICS.MORTUARY);
    return response.data;
  },

  /**
   * Vehicle / hearse analytics by month+year
   * GET /api/v1/restpoint/analytics/vehicle-analytics?month=&year=
   */
  getVehicleAnalytics: async (month, year) => {
    const m = month ?? new Date().getMonth() + 1;
    const y = year ?? new Date().getFullYear();
    const response = await api.get(`${ENDPOINTS.ANALYTICS.VEHICLES}?month=${m}&year=${y}`);
    return response.data;
  },

  /**
   * High-level dashboard summary widget data
   * GET /api/v1/restpoint/analytics/dashboard
   */
  getDashboard: async () => {
    const response = await api.get(ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  /**
   * Financial analytics
   * GET /api/v1/restpoint/analytics/financials?from=&to=
   */
  getFinancials: async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get(`${ENDPOINTS.ANALYTICS.FINANCIALS}?${params.toString()}`);
    return response.data;
  },
};
