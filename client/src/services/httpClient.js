const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!isLocal && envUrl && envUrl.includes('localhost')) {
      return '/api';
    }
  }
  return envUrl || 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

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
