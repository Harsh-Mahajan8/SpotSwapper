import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSwappableSlots() {
    return useQuery({
        queryKey: ["swappable-slots"],
        queryFn: async () => {
            try {
                const response = await api.get("/swappable-slots");
                console.log("Swappable slots response:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error fetching swappable slots:", error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: true,
    });
}

export function useIncomingRequests() {
    return useQuery({
        queryKey: ["incoming-requests"],
        queryFn: async () => {
            try {
                const response = await api.get("/requests/incoming");
                console.log("Incoming requests response:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error fetching incoming requests:", error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: true,
    });
}

export function useOutgoingRequests() {
    return useQuery({
        queryKey: ["outgoing-requests"],
        queryFn: async () => {
            try {
                const response = await api.get("/requests/outgoing");
                console.log("Outgoing requests response:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error fetching outgoing requests:", error);
                throw error;
            }
        },
        retry: 1,
        refetchOnWindowFocus: true,
    });
}

export function useCreateSwapRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            console.log("Creating swap request with data:", data);
            try {
                const response = await api.post("/swap-request", data);
                console.log("Swap request created successfully:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error creating swap request:", error.response?.data || error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Invalidating queries after swap request creation");
            queryClient.invalidateQueries({ queryKey: ["swappable-slots"] });
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
        },
    });
}

export function useRespondToSwapRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, action }) => {
            console.log(`Responding to swap request ${id} with action: ${action}`);
            try {
                const response = await api.post(`/swap-response/${id}`, {
                    action,
                });
                console.log("Swap response successful:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error responding to swap request:", error.response?.data || error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Invalidating queries after swap response");
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
            queryClient.invalidateQueries({ queryKey: ["swappable-slots"] });
        },
    });
}

