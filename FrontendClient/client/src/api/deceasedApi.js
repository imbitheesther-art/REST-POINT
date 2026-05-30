import api from './axios';
import { ENDPOINTS } from './endpoints';

export const deceasedApi = {
  list: (params = {}) => api.get(ENDPOINTS.DECEASED.LIST, { params }).then(r => r.data),
  create: (data) => api.post(ENDPOINTS.DECEASED.CREATE, data).then(r => r.data),
  getById: (id) => api.get(ENDPOINTS.DECEASED.DETAIL(id)).then(r => r.data),
  update: (id, data) => api.put(ENDPOINTS.DECEASED.UPDATE(id), data).then(r => r.data),
  delete: (id) => api.delete(ENDPOINTS.DECEASED.DELETE(id)).then(r => r.data),
  search: (query) => api.get(ENDPOINTS.DECEASED.SEARCH, { params: { q: query } }).then(r => r.data),
  getQR: (id) => api.get(ENDPOINTS.DECEASED.QR(id)).then(r => r.data),
  checkout: (id, data) => api.post(ENDPOINTS.DECEASED.CHECKOUT(id), data).then(r => r.data),
  getNextOfKin: (id) => api.get(ENDPOINTS.DECEASED.NEXT_OF_KIN(id)).then(r => r.data),
  addNextOfKin: (id, data) => api.post(ENDPOINTS.DECEASED.NEXT_OF_KIN(id), data).then(r => r.data),
  getDocuments: (id) => api.get(ENDPOINTS.DECEASED.DOCUMENTS(id)).then(r => r.data),
};
