import { describe, it, expect, beforeEach } from 'vitest';
import { api, httpClient } from '../services/index.js';

describe('ApiService Client Token Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve authorization token in localStorage', () => {
    expect(api.getToken()).toBeNull();

    api.setToken('sample_settlex_jwt_token_123');
    expect(api.getToken()).toBe('sample_settlex_jwt_token_123');
    expect(localStorage.getItem('settlex_token')).toBe('sample_settlex_jwt_token_123');

    api.setToken(null);
    expect(api.getToken()).toBeNull();
    expect(localStorage.getItem('settlex_token')).toBeNull();
  });

  it('should support httpClient direct token storage', () => {
    expect(httpClient.getToken()).toBeNull();
    httpClient.setToken('sample_token_direct');
    expect(httpClient.getToken()).toBe('sample_token_direct');
    httpClient.setToken(null);
    expect(httpClient.getToken()).toBeNull();
  });
});
