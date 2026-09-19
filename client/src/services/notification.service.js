import { httpClient } from './httpClient.js';

export const notificationService = {
  getNotifications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.severity && params.severity !== 'all') query.append('severity', params.severity);
    if (params.read !== undefined && params.read !== 'all') query.append('read', params.read);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return httpClient.request(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markNotificationRead: (id) =>
    httpClient.request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: (category = 'all') =>
    httpClient.request('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ category }),
    }),

  dismissNotification: (id) => httpClient.request(`/notifications/${id}`, { method: 'DELETE' }),

  clearReadNotifications: () =>
    httpClient.request('/notifications/clear-read', { method: 'DELETE' }),

  broadcastNotification: (data) =>
    httpClient.request('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default notificationService;
