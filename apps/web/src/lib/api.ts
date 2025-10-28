import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@cpo/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('cpo-auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Token added to ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn(`⚠️ No token found in localStorage for ${config.url}`);
      }
    } catch (error) {
      console.error('Failed to parse auth data:', error);
    }
  } else {
    console.warn(`⚠️ No auth data in localStorage for ${config.url}`);
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on the auth page and not trying to login
      const isAuthPage = window.location.pathname === '/auth';
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isAuthPage && !isLoginRequest) {
        // Clear auth and redirect to login
        localStorage.removeItem('cpo-auth');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
