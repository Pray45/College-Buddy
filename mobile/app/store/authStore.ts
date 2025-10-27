import { create } from 'zustand'
import axios from 'axios';

type AuthState = {

    register: (email: string, enrollment: string, password: string, confirmPassword: string) => Promise<void>;
    login: (email: string, enrollment: string, password: string) => Promise<void>;
    logout: () => void;

    isLoggedin: boolean;
    token: string | null;
    loading: boolean;

    userData: {
        name: string;
        email: string;
        profilePicture: string;
    } | null;

    setisLoggedin: (loggedIn: boolean) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setUserData: (userData:
        {
            name: string;
            email: string;
            profilePicture: string
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
    setUserData: (userData: { name: string; email: string; profilePicture: string } | null) => set({ userData }),
    setLoading: (loading: boolean) => set({ loading }),



    // register function



    register: async (email: string, enrollment: string, password: string) => {
        try {
            set({ loading: true });

            const response = await axios.post(`http://10.50.160.138:3000/api/auth/register`, {
                email,
                password,
                enrollment_no: enrollment
            });

            if (response.data.result === true && response.data.token) {
                set({
                    token: response.data.token,
                    userData: response.data.user,
                    isLoggedin: true
                });
            } else {
                console.error("Registration failed:", response.data.message);
                throw new Error(response.data.message || "Registration failed");
            }
        } catch (error: any) {
            console.error("Registration failed:", error.response?.data || error.message || error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },




    // isLoggedIn




    login: async (email: string, enrollment: string, password: string) => {
        try {
            set({ loading: true });
            const response = await axios.post(`http://10.50.160.138:3000/api/auth/login`, { email, enrollment_no: enrollment, password })
            if (response.data.result === true && response.data.token) {
                set({
                    token: response.data.token,
                    userData: response.data.user,
                    isLoggedin: true
                });
            }
        } catch (error) {
            console.error("Login failed:", error);
            set({ isLoggedin: false });
        } finally {
            set({ loading: false });
        }
    },




    // logout function




    logout: () => {
        try {
            set({
                token: null,
                userData: null,
                isLoggedin: false,
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            set({ loading: false });
        }
    }

}))

export default useAuthStore;