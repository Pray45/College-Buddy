import { create } from "zustand";
import api from "../config/axios"; // adjust path if needed

export interface Division {
    id: string;
    name: string;
    semester: string;
    department: string;
    students?: any[];
}

interface DivisionStore {
    divisions: Division[] | null;
    students: any[] | null;
    loading: boolean;
    error: string | null;

    getDivisions: () => Promise<void>;
    createDivision: (data: {
        name: string;
        semester: string;
        department: string;
    }) => Promise<void>;

    addStudentsToDivision: (data: {
        divisionId: string;
        studentIds: string[];
    }) => Promise<void>;

    removeStudentFromDivision: (data: {
        divisionId: string;
        studentId: string;
    }) => Promise<void>;

    getStudents: (divisionId: string) => Promise<void>;
}

export const useDivisionStore = create<DivisionStore>((set, get) => ({
    divisions: null,
    students: null,
    loading: false,
    error: null,

    getDivisions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get("/div/get/sem", {});
            set({ divisions: res.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to get divisions" });
        } finally {
            set({ loading: false });
        }
    },

    createDivision: async ({name, department, semester}) => {
        set({ loading: true, error: null });
        try {
            await api.post("/div/create", {name, department, semester});
            await get().getDivisions();
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to create division" });
        } finally {
            set({ loading: false });
        }
    },

    addStudentsToDivision: async (data) => {
        set({ loading: true, error: null });
        try {
            await api.post("/divisions/add-students", data);
            await get().getDivisions();
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to add students" });
        } finally {
            set({ loading: false });
        }
    },

    removeStudentFromDivision: async (data) => {
        set({ loading: true, error: null });
        try {
            await api.post("/divisions/remove-student", data);
            await get().getDivisions();
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to remove student" });
        } finally {
            set({ loading: false });
        }
    },

    getStudents: async (divisionId) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/divisions/${divisionId}/students`);
            set({ students: res.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to load students" });
        } finally {
            set({ loading: false });
        }
    },
}));
