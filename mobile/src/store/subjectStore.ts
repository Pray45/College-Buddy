import { create } from "zustand";
import api from "../config/axios";

export interface Subject {
    id: string;
    name: string;
    code: string;
    description: string;
    departmentId: string;
    semesterId: string;
}

interface SubjectStore {
    subjects: Subject[] | null;
    loading: boolean;
    error: string | null;

    createSubject: (data: {
        name: string;
        code: string;
        description: string;
        departmentId: string;
        semesterId: number;
    }) => Promise<void>;

    getAllSubjects: () => Promise<void>;

    getSubjectByDepartment: (departmentId: string) => Promise<void>;

    getSubjectBySemester: (semesterId: string) => Promise<void>;

    deleteSubject: (subjectId: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
    subjects: null,
    loading: false,
    error: null,

    createSubject: async ({ name, code, description, departmentId, semesterId }) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/subject/create", {
                name,
                code,
                description,
                departmentId,
                semesterId,
            });
            
            const newSubject = res.data.data.subject;
            const currentSubjects = get().subjects;
            if (currentSubjects) {
                set({ subjects: [...currentSubjects, newSubject] });
            } else {
                set({ subjects: [newSubject] });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to create subject" });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    getAllSubjects: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get("/subject/all");
            set({ subjects: res.data.data.subjects });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to get all subjects" });
        } finally {
            set({ loading: false });
        }
    },

    getSubjectByDepartment: async (departmentId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/subject/department", { departmentId });
            set({ subjects: res.data.data.subject });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to get subjects by department" });
        } finally {
            set({ loading: false });
        }
    },

    getSubjectBySemester: async (semesterId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/subject/get", { semesterId });
            set({ subjects: res.data.data.subject });
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to get subjects by semester" });
        } finally {
            set({ loading: false });
        }
    },

    deleteSubject: async (subjectId: string) => {
        set({ loading: true, error: null });
        try {
            await api.post("/subject/delete", { subjectId });
            
            // Remove the deleted subject from the local state
            const currentSubjects = get().subjects;
            if (currentSubjects) {
                set({ subjects: currentSubjects.filter(sub => sub.id !== subjectId) });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Failed to delete subject" });
            throw err;
        } finally {
            set({ loading: false });
        }
    },
}));
