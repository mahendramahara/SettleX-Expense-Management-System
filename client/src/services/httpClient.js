const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class HttpClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('settlex_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('settlex_token', token);
    } else {
      localStorage.removeItem('settlex_token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        err.message = 'Unable to connect to server. Ensure backend is running.';
      }
      throw err;
    }
  }
}

export const httpClient = new HttpClient();
export default httpClient;
