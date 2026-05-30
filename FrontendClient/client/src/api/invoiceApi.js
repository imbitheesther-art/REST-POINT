import api from './axios';
import { ENDPOINTS } from './endpoints';

export const invoiceApi = {
  list:   (params = {}) => api.get(ENDPOINTS.INVOICE.LIST, { params }).then(r => r.data),
  create: (data)        => api.post(ENDPOINTS.INVOICE.CREATE, data).then(r => r.data),
  getById:(id)          => api.get(ENDPOINTS.INVOICE.DETAIL(id)).then(r => r.data),
  update: (id, data)    => api.put(ENDPOINTS.INVOICE.UPDATE(id), data).then(r => r.data),
  delete: (id)          => api.delete(ENDPOINTS.INVOICE.DELETE(id)).then(r => r.data),
  pay:    (id, payload) => api.post(ENDPOINTS.INVOICE.PAY(id), payload).then(r => r.data),
  getPDF: (id)          => api.get(ENDPOINTS.INVOICE.PDF(id), { responseType: 'blob' }).then(r => r.data),
  mpesa:  (id, phone)   => api.post(ENDPOINTS.INVOICE.MPESA(id), { phone }).then(r => r.data),
};
