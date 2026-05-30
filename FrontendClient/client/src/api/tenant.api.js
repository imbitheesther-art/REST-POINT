import api from './axios';
import { ENDPOINTS } from './endpoints';

export const tenantApi = {
  getBranding: async (slug) => {
    // const response = await api.get(ENDPOINTS.TENANT.BRANDING(slug));
    // return response.data;
    
    // Mock response for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: slug === 'lee-funeral' ? 'Lee Funeral Home' : 'RESTPOINT Default Tenant',
          logo: '/mock-logo.png',
          primaryColor: '#2b5a82', // e.g. blue
          features: {
            hearseTracking: slug === 'lee-funeral', // Only lee-funeral has hearse tracking
            analytics: true,
            invoicing: true
          }
        });
      }, 500);
    });
  },
  
  registerTenant: async (tenantData) => {
    const response = await api.post(ENDPOINTS.TENANT.REGISTER, tenantData);
    return response.data;
  }
};
