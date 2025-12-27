import api from "./axios";
import { useAuthStore } from "../store/authStore";
import { jwtDecode } from "jwt-decode";

let initialized = false;

// Helper function to check if token is expired
function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
        const decoded: any = jwtDecode(token);
        const expiresAt = decoded?.exp;
        if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            return now > expiresAt;
        }
        return false;
    } catch {
        return true;
    }
}

export function initAuthInterceptors() {
    if (initialized) return;
    initialized = true;

    api.interceptors.request.use((config) => {
        const store = useAuthStore.getState();
        const token = store.accessToken;

        // Check if token is expired before making request
        if (isTokenExpired(token)) {
            // Token is expired, logout
            store.logout();
            return config;
        }

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

