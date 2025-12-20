import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://10.158.147.138:5000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const store = useAuthStore.getState();

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await store.refreshAccessToken();
        original.headers.Authorization = `Bearer ${store.accessToken}`;
        return api(original);
      } catch (err) {
        store.logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
