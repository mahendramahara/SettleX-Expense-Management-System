import { httpClient } from './httpClient.js';

export const groupService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.userId) query.append('userId', params.userId);
    const qs = query.toString();
    return httpClient.request(`/groups${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => httpClient.request(`/groups/${id}`),

  create: (data) =>
    httpClient.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    httpClient.request(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    httpClient.request(`/groups/${id}`, {
      method: 'DELETE',
    }),

  addMember: (groupId, memberData) =>
    httpClient.request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  removeMember: (groupId, memberId) =>
    httpClient.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

export default groupService;
