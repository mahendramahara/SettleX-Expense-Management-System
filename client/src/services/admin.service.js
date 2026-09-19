import { httpClient } from './httpClient.js';

export const adminService = {
  login: (credentials) =>
    httpClient.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => httpClient.request('/admin/me'),

  getProfile: () => httpClient.request('/admin/me'),

  updateProfile: (profileData) =>
    httpClient.request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  getOverview: () => httpClient.request('/admin/overview'),

  getStaff: () => httpClient.request('/admin/staff'),

  createStaff: (staffData) =>
    httpClient.request('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    }),

  updateStaffPermissions: (id, permissions) =>
    httpClient.request(`/admin/staff/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    }),

  updateStaffRole: (id, role) =>
    httpClient.request(`/admin/staff/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  toggleStaffStatus: (id, isActive) =>
    httpClient.request(`/admin/staff/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};

export default adminService;
