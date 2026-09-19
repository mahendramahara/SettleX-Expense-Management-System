import { httpClient } from './httpClient.js';

export const expenseService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.groupId) query.append('groupId', params.groupId);
    if (params.userId) query.append('userId', params.userId);
    const qs = query.toString();
    return httpClient.request(`/expenses${qs ? `?${qs}` : ''}`);
  },

  getByGroup: (groupId) => httpClient.request(`/expenses/group/${groupId}`),

  create: (data) =>
    httpClient.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id) => httpClient.request(`/expenses/${id}`),

  update: (id, data) =>
    httpClient.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    httpClient.request(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};

export default expenseService;
