import { httpClient } from './httpClient.js';

export const analyticsService = {
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams();
    if (params.range) query.append('range', params.range);
    if (params.groupId) query.append('groupId', params.groupId);
    const qs = query.toString();
    return httpClient.request(`/analytics${qs ? `?${qs}` : ''}`);
  },

  getAlgorithmBenchmark: () => httpClient.request('/analytics/benchmark'),

  runAlgorithmSandbox: (data) =>
    httpClient.request('/analytics/sandbox', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAnomalies: (params = {}) => {
    const query = new URLSearchParams();
    if (params.threshold) query.append('threshold', params.threshold);
    if (params.severity && params.severity !== 'all') query.append('severity', params.severity);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return httpClient.request(`/analytics/anomalies${qs ? `?${qs}` : ''}`);
  },

  runAnomalyScan: (params = {}) =>
    httpClient.request('/analytics/anomalies/scan', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  updateAnomalyStatus: (id, data = {}) =>
    httpClient.request(`/analytics/anomalies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  dispatchAdvisory: (advisoryData) =>
    httpClient.request('/analytics/advisories', {
      method: 'POST',
      body: JSON.stringify(advisoryData),
    }),

  getAdvisories: (params = {}) => {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    const qs = query.toString();
    return httpClient.request(`/analytics/advisories${qs ? `?${qs}` : ''}`);
  },
};

export default analyticsService;
