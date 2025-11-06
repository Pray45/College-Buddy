import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store';
import api from '../config/axios';
import { jwtDecode } from 'jwt-decode';

type AuthState = {

    register: (name: string, email: string, password: string, enrollmentNo: string | undefined, teacherId: string | undefined, department: string , role: string) => Promise<void>;
    login: (email: string, enrollment: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAccessToken: () => Promise<void>;
    saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
    getAccessToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | null>;
    clearTokens: () => Promise<void>;

    isLoggedin: boolean;
    isProfileComplete?: boolean;
    token: string | null;
    loading: boolean;

    userData: {
        id?: number;
        name: string | null;
        email: string;
        role?: string;

        enrollmentNo?: string;
        semester?: number;
        division?: string;
        subjects?: string[];
        savednotes?: number[];
        projects?: number;

        department?: string;

        teacherId?: string;
        position?: string;

    } | null;

    setisLoggedin: (loggedIn: boolean) => void;
    setisProfileComplete: (isProfileComplete: boolean) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setUserData: (userData: {
        id?: number;
        name: string | null;
        email: string;
        enrollment_no?: string;
        mobile_no?: string;
        department?: string;
        role?: string;
    } | null) => void;

}

const useAuthStore = create<AuthState>((set, get) => ({


    // initial values of the store


    isLoggedin: false,
    isProfileComplete: false,
    token: null,
    userData: null,
    loading: false,

    setisLoggedin: (isLoggedin: boolean) => set({ isLoggedin }),
    setisProfileComplete: (isProfileComplete: boolean) => set({ isProfileComplete }),
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

            set({ loading: true });
            const accessToken = await get().getAccessToken();

            if (accessToken) {

                const decodedToken = jwtDecode(accessToken);
                const userId = (decodedToken as any).userId;

                const response = await api.get(`/auth/user/${userId}`);

                if (response.data.result === true) {

                    const user = response.data.user;
                    const isComplete = Boolean(user?.mobile_no) && Boolean(user?.department);
                    set({ isProfileComplete: isComplete });

                    set({
                        token: accessToken,
                        userData: user,
                        isLoggedin: true
                    });

                }

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
        } finally {
            set({ loading: false });
        }
    },



    // register function



    register: async ( name: string, email: string, password: string, enrollmentNo: string | undefined, teacherId: string | undefined, department: string, role: string ) => {

        try {
            set({ loading: true });

            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                enrollmentNo: enrollmentNo ?? undefined,
                teacherId: teacherId ?? undefined,
                department,
                role
            });

            if (response.data.result) {
                set({ isLoggedin: true });
                return response.data;
            } else {
                throw new Error(response.data.message || "Registration failed");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Registration failed";
            console.error("Registration error:", message);
            throw new Error(message);
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

                const isComplete = Boolean(user?.mobile_no) && Boolean(user?.department);
                set({ isProfileComplete: isComplete });

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