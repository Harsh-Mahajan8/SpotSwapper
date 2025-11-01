import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { auth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export function useLogin() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/auth/login", data);
            return response.data;
        },
        onSuccess: (data) => {
            auth.setAuth(data);
            navigate("/dashboard", { replace: true });
        },
    });
}

export function useSignup() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/auth/signup", data);
            return response.data;
        },
        onSuccess: (data) => {
            auth.setAuth(data);
            navigate("/dashboard", { replace: true });
        },
    });
}

export function useLogout() {
    return () => {
        auth.clearAuth();
        window.location.href = "/login";
    };
}

