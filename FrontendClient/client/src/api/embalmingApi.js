import api from './axios';
import { ENDPOINTS } from './endpoints';

export const embalmingApi = {
  list:   (params = {}) => api.get(ENDPOINTS.EMBALMING.LIST, { params }).then(r => r.data),
  create: (data)        => api.post(ENDPOINTS.EMBALMING.CREATE, data).then(r => r.data),
  getById:(id)          => api.get(ENDPOINTS.EMBALMING.DETAIL(id)).then(r => r.data),
  update: (id, data)    => api.put(ENDPOINTS.EMBALMING.UPDATE(id), data).then(r => r.data),
  delete: (id)          => api.delete(ENDPOINTS.EMBALMING.DELETE(id)).then(r => r.data),
};
