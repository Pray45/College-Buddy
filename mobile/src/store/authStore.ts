import { create } from "zustand";
import * as SecureStore from 'expo-secure-store';
import api from "../config/axios";
import { jwtDecode } from "jwt-decode";
import { extractErrorMessage } from "../utils/extractErrorMessage";

const DEPARTMENT_MAP: Record<number, string> = {
    1: "CSE",
    2: "ECE",
    3: "ME",
    4: "EE",
    5: "CIVIL",
};

const mapDepartment = (department: unknown, departmentId?: unknown): string | undefined => {
    const fromId = departmentId ?? department;
    const numericId = typeof fromId === "string" ? Number(fromId) : typeof fromId === "number" ? fromId : undefined;
    if (numericId && DEPARTMENT_MAP[numericId]) return DEPARTMENT_MAP[numericId];
    if (typeof department === "string" && department.trim() !== "") return department;
    return undefined;
};

const normalizeUserData = (raw: any) => {
    if (!raw) return null;

    const normalized: any = {
        id: raw.id ?? raw.userId ?? raw.payload?.id ?? raw.payload?.userId ?? null,
        name: raw.name ?? null,
        email: raw.email ?? "",
        role: raw.role,
        profilePic: raw.profilePic ?? raw.profilepic,
        verificationStatus: raw.verificationStatus,
        department: mapDepartment(raw.department, raw.departmentId),
        mobile_no: raw.mobile_no ?? raw.mobileNo ?? raw.phone ?? raw.contactNo,
    };

    const student = raw.studentProfile || raw.student || raw;
    if (raw.role === "STUDENT" || raw.studentProfile) {
        normalized.enrollmentNo = student?.enrollmentNo ?? raw.enrollmentNo;
        normalized.semester = student?.semester ?? raw.semester;
        normalized.division = student?.division ?? raw.division;
        normalized.subjects = student?.subjects ?? raw.subjects;
        normalized.savednotes = student?.savednotes ?? raw.savednotes;
        normalized.projects = student?.projects ?? raw.projects;
        normalized.department = mapDepartment(normalized.department, student?.departmentId ?? student?.department ?? raw.departmentId);
    }

    const professor = raw.professorProfile || raw.professor || raw;
    if (raw.role === "PROFESSOR" || raw.professorProfile) {
        normalized.teacherId = professor?.teacherId ?? raw.teacherId;
        normalized.position = professor?.position ?? raw.position;
        normalized.department = mapDepartment(normalized.department, professor?.departmentId ?? professor?.department ?? raw.departmentId);
    }

    const hod = raw.hodProfile || raw.hod || raw;
    if (raw.role === "HOD" || raw.hodProfile) {
        normalized.department = mapDepartment(normalized.department, hod?.departmentId ?? hod?.department ?? raw.departmentId);
    }

    return normalized;
};

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
        mobile_no?: string;

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
    startTokenRefreshCycle: () => void;
    stopTokenRefreshCycle: () => void;
    fetchUser: (userId?: number | string) => Promise<void>;

    loggedIn: boolean;
    isprofileComplete: boolean;
    loading: boolean;
    isLoggedin: () => boolean;
    isProfileComplete: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    (set, get) => {
        let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;

        return {


        /* ---------- state ---------- */


        userData: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
        isprofileComplete: false,
        loggedIn: false,
        requests: null,


        /* ---------- auth ---------- */


        register: async (data: { name: string; email: string; password: string; role: Role; department: string; enrollmentNo?: string; teacherId?: string }) => {

            const { name, email, password, role, department, enrollmentNo, teacherId } = data;

            try {
                set({ loading: true, error: null });

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
                    const rawUser = response.data?.data?.userData;
                    const normalized = normalizeUserData(rawUser);
                    set({ loggedIn: true, userData: normalized });

                    // Fetch full user data from backend after registration
                    if (normalized?.id) {
                        try {
                            await get().fetchUser(normalized.id);
                        } catch (fetchErr) {
                            console.error('Error fetching user data after registration:', fetchErr);
                        }
                    }
                    
                    return response.data;
                }

                const fallback = response.data.message || "Registration failed";
                throw new Error(fallback);

            } catch (error: any) {
                const message = extractErrorMessage(error);
                set({ error: message });
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

                const normalized = normalizeUserData(userData);

                set({
                    userData: normalized,
                    accessToken,
                    refreshToken,
                    loggedIn: true,
                });

                // Save tokens BEFORE fetching user data
                await get().saveTokens(accessToken, refreshToken);

                const isComplete = Boolean(normalized?.mobile_no) && Boolean(normalized?.profilePic);
                set({ isprofileComplete: isComplete });

                if (normalized?.id) {
                    try {
                        await get().fetchUser(normalized.id);
                    } catch (fetchErr) {
                        console.error('Error fetching full user data after login:', fetchErr);
                    }
                }

            } catch (err: any) {
                const message = extractErrorMessage(err);
                set({ error: message });
                throw new Error(message);
            } finally {
                set({ loading: false });
            }
        },



        logout: async () => {
            // Stop token refresh cycle
            if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
                tokenRefreshInterval = null;
            }
            
            await get().clearTokens();
            set({
                userData: null,
                accessToken: null,
                refreshToken: null,
                error: null,
                loggedIn: false,
                isprofileComplete: false,
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
                    console.log("✅ Token refreshed successfully");
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (error: any) {
                console.error('❌ Token refresh error:', error.message);
                set({ loggedIn: false });
                await get().clearTokens();
                throw error;
            }
        },



        /* ---------- silent re-auth ---------- */



        fetchUser: async (userId?: number | string) => {
            try {
                if (!userId) return;
                set({ loading: true, error: null });

                const id = String(userId);
                if (!id || id === 'NaN') {
                    throw new Error('Invalid user id for GET request');
                }

                const response = await api.get('/auth/get', { params: { id } });

                if (response.data?.result === true) {
                    const payload = response.data?.data;

                    const merged = payload?.user
                        ? { ...payload.user, ...(payload.addData ?? {}) }
                        : payload;

                    const normalized = normalizeUserData(merged);
                    const isComplete = Boolean((normalized as any)?.mobile_no) && Boolean((normalized as any)?.profilePic);
                    set({ isprofileComplete: isComplete, userData: normalized as any });
                } else {
                    throw new Error(response.data?.message || 'Failed to fetch user');
                }

            } catch (err: any) {
                const message = extractErrorMessage(err);
                set({ error: message });
                throw err;
            } finally {
                set({ loading: false });
            }
        },

        checkAccessToken: async () => {
            try {
                set({ loading: true });
                const accessToken = await get().getAccessToken();

                if (accessToken) {
                    let decodedToken: any = {};
                    try {
                        decodedToken = jwtDecode(accessToken) as any;
                    } catch (e) {
                        console.error("Token decode error:", e);
                        set({ accessToken: null, loggedIn: false });
                        await get().clearTokens();
                        return;
                    }

                    // Check token expiration
                    const expiresAt = decodedToken?.exp;
                    if (expiresAt) {
                        const now = Math.floor(Date.now() / 1000);
                        if (now > expiresAt) {
                            // Token is expired
                            console.warn("Token has expired");
                            set({ accessToken: null, loggedIn: false });
                            await get().clearTokens();
                            return;
                        }
                    }

                    const userId = decodedToken?.payload?.id || decodedToken?.id || decodedToken?.userId;

                    if (!userId) {
                        set({ accessToken: null, loggedIn: false });
                        await get().clearTokens();
                        return;
                    }

                    await get().fetchUser(userId);

                    set({ accessToken: accessToken, loggedIn: true });

                } else {
                    set({ accessToken: null, loggedIn: false });
                }
            } catch (error) {
                console.error("Check access token error:", error);
                set({ accessToken: null, loggedIn: false });
                await get().clearTokens();
            } finally {
                set({ loading: false });
            }
        },

        // Periodic token refresh - check and refresh every 5 minutes (300,000ms)
        // Refresh proactively if token expires in less than 5 minutes
        startTokenRefreshCycle: () => {
            if (tokenRefreshInterval) return; // Already running

            const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
            const REFRESH_BUFFER = 5 * 60; // 5 minutes before expiration

            tokenRefreshInterval = setInterval(async () => {
                try {
                    const accessToken = await get().getAccessToken();
                    if (!accessToken) return;

                    const decoded: any = jwtDecode(accessToken);
                    const expiresAt = decoded?.exp;

                    if (!expiresAt) return;

                    const now = Math.floor(Date.now() / 1000);
                    const timeUntilExpiry = expiresAt - now;

                    console.log(`⏱️ Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes`);

                    // Refresh if token expires in less than buffer time
                    if (timeUntilExpiry < REFRESH_BUFFER) {
                        console.log("🔄 Proactively refreshing token...");
                        await get().refreshAccessToken();
                    }
                } catch (error) {
                    console.error("Error in token refresh cycle:", error);
                }
            }, TOKEN_CHECK_INTERVAL);

            console.log("✅ Token refresh cycle started (checks every 5 minutes)");
        },

        stopTokenRefreshCycle: () => {
            if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
                tokenRefreshInterval = null;
                console.log("⏹️ Token refresh cycle stopped");
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
        };
    }
);