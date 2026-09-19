import { httpClient } from './httpClient.js';

export const auditService = {
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return httpClient.request(`/audit-logs${qs ? `?${qs}` : ''}`);
  },
};

export const systemLogService = auditService;
export default auditService;
