import api from "./axios";
import { useAuthStore } from "../store/authStore";

let initialized = false;

export function initAuthInterceptors() {
    if (initialized) return;
    initialized = true;

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
            const original = error.config || {};
            const store = useAuthStore.getState();

            if (
                error.response?.status === 401 &&
                !original._retry &&
                typeof original.url === "string" &&
                !original.url.includes("/auth/refresh")
            ) {
                original._retry = true;
                try {
                    await store.refreshAccessToken();
                    const newToken = store.accessToken;
                    if (newToken) {
                        original.headers = {
                            ...(original.headers || {}),
                            Authorization: `Bearer ${newToken}`,
                        };
                        return api(original);
                    }
                } catch {
                    store.logout();
                }
            }

            return Promise.reject(error);
        }
    );
}
