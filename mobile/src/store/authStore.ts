import { create } from "zustand";
import * as SecureStore from 'expo-secure-store';
import api from "../config/axios";
import { jwtDecode } from "jwt-decode";

type Role = "STUDENT" | "PROFESSOR" | "HOD";
type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AuthState {

    userData: {
        id?: number;
        name: string | null;
        email: string;
        role?: string;
        profilePic?: string;
        verificationStatus?: VerificationStatus;

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
    accessToken: string | null;
    refreshToken: string | null;

    error: string | null;

    register: (data: { name: string; email: string; password: string; role: Role; department: string; enrollmentNo?: string; teacherId?: string }) => Promise<void>;
    login: (data: { role: Role; email: string; password: string }) => Promise<void>;
    logout: () => void;

    saveTokens: (access: string, refresh: string) => Promise<void>;
    clearTokens: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | null>;
    refreshAccessToken: () => Promise<void>;

    checkAccessToken: () => Promise<void>;

    loggedIn: boolean;
    isprofileComplete: boolean;
    loading: boolean;
    isLoggedin: () => boolean;
    isProfileComplete: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    (set, get) => ({


        /* ---------- state ---------- */


        userData: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
        isprofileComplete: false,
        loggedIn: false,


        /* ---------- auth ---------- */


        register: async (data: { name: string; email: string; password: string; role: Role; department: string; enrollmentNo?: string; teacherId?: string }) => {

            const { name, email, password, role, department, enrollmentNo, teacherId } = data;

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

                if (response.data.result === true) {
                    set({ loggedIn: true });
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





        login: async ({ email, password, role }) => {
            set({ loading: true, error: null });
            try {
                const res = await api.post("/auth/login", { email, password, role });
                const { userData, accessToken, refreshToken } = res.data.data;

                set({
                    userData,
                    accessToken,
                    refreshToken,
                    loggedIn: true,
                });

                get().saveTokens(accessToken, refreshToken);

                const isComplete = Boolean(userData?.mobile_no) && Boolean(userData?.profilePic);
                set({ isprofileComplete: isComplete });

            } catch (err: any) {
                set({ error: err?.response?.data?.message || "Login failed" });
                throw err;
            } finally {
                set({ loading: false });
            }
        },



        logout: async () => {
            await get().clearTokens();
            set({
                userData: null,
                accessToken: null,
                refreshToken: null,
                error: null,
            });
        },




        /* ---------- tokens ---------- */



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

        refreshAccessToken: async () => {
            try {
                const refreshToken = await get().getRefreshToken();

                if (!refreshToken) {
                    set({ loggedIn: false });
                    return;
                }

                const response = await api.post('/auth/refresh', { refreshToken });

                if (response.data.result === true) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    set({ accessToken });
                    await get().saveTokens(accessToken, newRefreshToken);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (error: any) {
                console.error('Token refresh error:', error);
                set({ loggedIn: false });
                await get().clearTokens();
                throw error;
            }
        },



        /* ---------- silent re-auth ---------- */



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
                        const isComplete = Boolean(user?.mobile_no) && Boolean(user?.profilePic);
                        set({ isprofileComplete: isComplete });

                        set({
                            accessToken: accessToken,
                            userData: user,
                            loggedIn: true
                        });

                    }

                } else {
                    set({
                        accessToken: null,
                        loggedIn: false
                    });
                }
            } catch (error) {
                console.error("Check access token error:", error);
                set({
                    accessToken: null,
                    loggedIn: false
                });
            } finally {
                set({ loading: false });
            }
        },


        /* ---------- derived ---------- */


        isLoggedin: () => {
            const { userData, accessToken } = get();
            return !!userData && !!accessToken;
        },


        isProfileComplete: () => {
            const user = get().userData;
            if (!user) return false;

            switch (user.role) {
                case "STUDENT":
                    return !!(
                        user.enrollmentNo &&
                        user.department &&
                        user.semester &&
                        user.division
                    );

                case "PROFESSOR":
                    return !!(
                        user.teacherId &&
                        user.department &&
                        user.position
                    );

                case "HOD":
                    return !!user.department;

                default:
                    return false;
            }
        },
    }),
);