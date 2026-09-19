import { httpClient } from './httpClient.js';

export const settingsService = {
  getSettings: () => httpClient.request('/settings'),

  updateSettings: (settingsData) =>
    httpClient.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),

  changePassword: (passwordData) =>
    httpClient.request('/settings/password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),

  triggerMaintenance: (action) =>
    httpClient.request('/settings/maintenance', {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  seedDatabase: () =>
    httpClient.request('/seed', {
      method: 'POST',
    }),
};

export default settingsService;
