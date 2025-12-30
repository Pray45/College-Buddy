import { create } from "zustand";
import api from "../config/axios";
import { extractErrorMessage } from "../utils/extractErrorMessage";

type Action = "APPROVE" | "REJECT";

interface RequestStoreState {
    requests: any[] | null;
    getRequests: () => Promise<void>;
    actionRequests: (data: { approverId:string, requestId:string, reason:string, action:Action }) => Promise<void>;
    error?: string | null;
    loading: boolean;
}

export const useRequestStore = create<RequestStoreState>((set) => ({
    requests: [],
    loading: false,
    error: null,

    getRequests: async () => {
        try {
            set({ loading: true, error: null });

            const res = await api.get("/requests/pending");
            const list =
                res.data?.data?.PendingRequests ??
                res.data?.PendingRequests ??
                [];

            set({ requests: Array.isArray(list) ? list : [] });
        } catch (err: any) {
            set({ error: extractErrorMessage(err), requests: [] });
        } finally {
            set({ loading: false });
        }
    },

    actionRequests: async ({ approverId, requestId, reason, action }) => {
        if (!approverId || !requestId || !action) {
            throw new Error("Missing required parameters");
        }

        try {
            set({ loading: true, error: null });

            const res = await api.post("/requests/createreq", {
                approverId,
                requestId,
                reason,
                action,
            });

            return res.data;

        } catch (err:any) {
            console.error(err);
            set({
                error: err.response?.data?.message || "Something went wrong",
            });
            throw err;

        } finally {
            set({ loading: false });
        }
    },


}));
