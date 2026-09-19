import { httpClient } from './httpClient.js';

export const settlementService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.groupId) query.append('groupId', params.groupId);
    if (params.userId) query.append('userId', params.userId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return httpClient.request(`/settlements${qs ? `?${qs}` : ''}`);
  },

  getGroupBalances: (groupId) => httpClient.request(`/settlements/group/${groupId}/balances`),

  optimize: (groupId) => httpClient.request(`/settlements/group/${groupId}/optimize`),

  cancelCycles: (groupId) => httpClient.request(`/settlements/group/${groupId}/simplify`),

  getGraph: (groupId) => httpClient.request(`/settlements/group/${groupId}/graph`),

  simulate: (groupId, data) =>
    httpClient.request(`/settlements/group/${groupId}/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordPayment: (groupId, data) =>
    httpClient.request(`/settlements/group/${groupId}/record`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordSettlement: (data) =>
    httpClient.request('/settlements/record', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default settlementService;
