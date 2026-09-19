import { httpClient } from './httpClient.js';

export const authService = {
  login: (credentials) =>
    httpClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    httpClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  verifyOtp: (payload) =>
    httpClient.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendOtp: (payload) =>
    httpClient.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload) =>
    httpClient.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyResetOtp: (payload) =>
    httpClient.request('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload) =>
    httpClient.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleAuth: (payload) =>
    httpClient.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getGoogleAuthUrl: (redirectUri) =>
    httpClient.request(
      '/auth/google/url' + (redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : '')
    ),

  googleCallback: (payload) =>
    httpClient.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => httpClient.request('/auth/me'),
};

export default authService;
