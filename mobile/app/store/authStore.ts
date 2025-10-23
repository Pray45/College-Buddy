import { create } from 'zustand'
import axios from 'axios';

type AuthState = {

    register: (email: string, password: string, confirmPassword: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => ({ 


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

    register: async (email: string, password: string, confirmPassword: string) => {

        try {

            if (password === confirmPassword) {

                set({ loading: true });

                const response = await axios.post(`http://localhost:3000/api/register`, { email, password })

                if (response.data && response.data.token) {
                    set({
                        token: response.data.token,
                        userData: response.data.userData,
                        isLoggedin: true
                    });
                }

            } else {
                throw new Error("Passwords do not match");
            }

        } catch (error) {
            console.log("Registration failed:", error);
        } finally {
            set({ loading: false });
        }

    },


    // isLoggedIn


    login: async (email: string, password: string) => {

        try {

            set({ loading: true });

            const response = await axios.post('http://localhost:3000/api/login', { email, password })

            if (response.data && response.data.token) {

                set({
                    token: response.data.token,
                    userData: response.data.userData,
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