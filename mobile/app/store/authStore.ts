import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store';
import api from '../config/axios';


type AuthState = {

    register: (email: string, enrollment: string, password: string, name?: string) => Promise<void>;
    login: (email: string, enrollment: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAccessToken: () => Promise<void>;
    saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
    getAccessToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | null>;
    clearTokens: () => Promise<void>;

    isLoggedin: boolean;
    token: string | null;
    loading: boolean;

    userData: {
        id?: number;
        name: string | null;
        email: string;
        enrollment_no?: string;
    } | null;

    setisLoggedin: (loggedIn: boolean) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setUserData: (userData: {
        id?: number;
        name: string | null;
        email: string;
        enrollment_no?: string;
    } | null) => void;

}

const useAuthStore = create<AuthState>((set, get) => ({


    // initial values of the store


    isLoggedin: false,
    token: null,
    userData: null,
    loading: false,

    setisLoggedin: (isLoggedin: boolean) => set({ isLoggedin }),
    setToken: (token: string | null) => set({ token }),
    setUserData: (userData: { id?: number; name: string | null; email: string; enrollment_no?: string; } | null) => set({ userData }),
    setLoading: (loading: boolean) => set({ loading }),


    // token helpers


    saveTokens: async (accessToken, refreshToken) => {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    },

    getAccessToken: async () => {
        return await SecureStore.getItemAsync('accessToken');
    },

    getRefreshToken: async () => {
        return await SecureStore.getItemAsync('refreshToken');
    },

    clearTokens: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
    },


    // token check



    checkAccessToken: async () => {
        try {
            const accessToken = await get().getAccessToken();

            if (accessToken) {
                set({
                    token: accessToken,
                    isLoggedin: true
                });
            } else {
                set({
                    token: null,
                    isLoggedin: false
                });
            }
        } catch (error) {
            console.error("Check access token error:", error);
            set({
                token: null,
                isLoggedin: false
            });
        }
    },



    // register function



    register: async (email: string, enrollment: string, password: string, name?: string) => {
        try {
            set({ loading: true });

            const response = await api.post('/auth/register', {
                email,
                enrollment_no: enrollment,
                password,
                name
            });

            if (response.data.result === true && response.data.accessToken) {
                const { accessToken, refreshToken, user } = response.data;

                await get().saveTokens(accessToken, refreshToken);

                set({
                    token: accessToken,
                    userData: user,
                    isLoggedin: true
                });
            } else {
                const errorMessage = response.data.message || "Registration failed";
                console.error("Registration failed:", errorMessage);
                return Promise.reject(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Registration failed";
            console.error("Registration error:", errorMessage);
            return Promise.reject(errorMessage);
        } finally {
            set({ loading: false });
        }
    },




    // isLoggedIn




    login: async (email: string, enrollment: string, password: string) => {
        try {
            set({ loading: true });

            const payload: any = { password };
            if (email) payload.email = email;
            if (enrollment) payload.enrollment_no = enrollment;

            const response = await api.post('/auth/login', payload);

            if (response.data.result === true && response.data.accessToken) {
                const { accessToken, refreshToken, user } = response.data;

                await get().saveTokens(accessToken, refreshToken);

                set({
                    token: accessToken,
                    userData: user,
                    isLoggedin: true
                });
            } else {
                const errorMessage = response.data.message || "Login failed";
                return Promise.reject(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            console.error("Login error:", errorMessage);
            set({ isLoggedin: false, token: null, userData: null });
            return Promise.reject(errorMessage);
        } finally {
            set({ loading: false });
        }
    },




    // logout function




    logout: async () => {
        try {
            set({
                token: null,
                userData: null,
                isLoggedin: false,
            });

            await get().clearTokens();

        } catch (error) {
            console.error("Logout failed:", error);
        }
    },


}))

export default useAuthStore;