import { create } from "zustand";
import api from "../config/axios"; // adjust path if needed

export interface Division {
    id: string;
    name: string;
    semesterId: string | number;
    departmentId: string;
    Student?: any[];
}

interface DivisionStore {
    divisions: Division[] | null;
    students: any[] | null;
    loading: boolean;
    error: string | null;

    Student: {
        id: string;
        name: string;
        semesterId: string | number;
        departmentId: string;
        Student?: any[];
    } | null;

    getDivisions: () => Promise<void>;
    createDivision: (data: {
        name: string;
        semester: string;
        department: string;
    }) => Promise<void>;

    fetchStudents: (params: {
        departmentId: string;
        semester: number;
    }) => Promise<void>;

    assignStudents: (data: {
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
    Student: null,

    getDivisions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get("/div/get", {});
            set({ divisions: res.data.data.divisions });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to get divisions" });
        } finally {
            set({ loading: false });
        }
    },

    createDivision: async ({ name, department, semester }) => {
        set({ loading: true, error: null });
        try {
            await api.post("/div/create", { name, department, semester });
            await get().getDivisions();
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to create division" });
        } finally {
            set({ loading: false });
        }
    },

    fetchStudents: async ({ departmentId, semester }) => {
        try {
            set({ loading: true, error: null });

            const res = await api.get("/div/sem/students", {
                params: { departmentId, semester },
            });

            set({ students: res.data.data.students });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Failed to fetch students",
            });
        } finally {
            set({ loading: false });
        }
    },

    assignStudents: async ({ divisionId, studentIds }) => {
        try {
            set({ loading: true, error: null });

            await api.post("/div/assign", {
                divisionId,
                studentIds,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Failed to assign students",
            });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    removeStudentFromDivision: async (data) => {
        set({ loading: true, error: null });
        try {
            await api.delete("/div/remove", { data });
            await get().getDivisions();
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to remove student" });
        } finally {
            set({ loading: false });
        }
    },

    getStudents: async (divisionId: string) => {
        set({ loading: true, error: null });

        try {
            const res = await api.get(`/div/students/${divisionId}`);

            set({
                Student: res.data.data.students,
                students: res.data.data.students.Student
            });
        } catch (err: any) {
            set({
                error:
                    err.response?.data?.message ||
                    "Failed to load students",
            });
        } finally {
            set({ loading: false });
        }
    },
}));
