import { httpClient } from './httpClient.js';

export const userService = {
  // Self-Service Operations
  getMe: () => httpClient.request('/users/me'),
  getDashboard: () => httpClient.request('/users/dashboard'),
  search: (q) => httpClient.request(`/users/search?q=${encodeURIComponent(q)}`),
  updateProfile: (profile) =>
    httpClient.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  changePassword: (passwords) =>
    httpClient.request('/users/password', {
      method: 'PATCH',
      body: JSON.stringify(passwords),
    }),
  updatePreferences: (preferences) =>
    httpClient.request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    }),
  deleteAccount: () =>
    httpClient.request('/users/account', {
      method: 'DELETE',
    }),

  // Administrative User Operations
  getAll: (params = '') =>
    httpClient.request(typeof params === 'string' ? `/users${params ? `?${params}` : ''}` : '/users'),

  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.role) query.append('role', params.role);
    const qs = query.toString();
    return httpClient.request(`/users${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => httpClient.request(`/users/${id}`),

  createUser: (userData) =>
    httpClient.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (id, userData) =>
    httpClient.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  suspendUser: (id, reason) =>
    httpClient.request(`/users/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  reactivateUser: (id) =>
    httpClient.request(`/users/${id}/reactivate`, {
      method: 'PATCH',
    }),

  deleteUser: (id) =>
    httpClient.request(`/users/${id}`, {
      method: 'DELETE',
    }),

  getUserConnectedGroups: (userId) => httpClient.request(`/users/${userId}/groups`),
};

export default userService;
