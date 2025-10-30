import axios, { CreateAxiosDefaults } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from './env';

const api = axios.create({
  baseURL: env.API_BASE_URL,
} as CreateAxiosDefaults);

// Attach access token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired access token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 (unauthorized) and ensure we haven't retried already
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (!refreshToken) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${env.API_BASE_URL}/auth/refresh`, { 
          refreshToken 
        });

        if (res.data.result && res.data.accessToken && res.data.refreshToken) {
          const { accessToken, refreshToken: newRefreshToken } = res.data;

          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', newRefreshToken);

          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          return Promise.reject('Invalid refresh response');
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
