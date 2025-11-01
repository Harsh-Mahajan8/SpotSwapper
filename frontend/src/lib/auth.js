export const auth = {
    getToken() {
        return localStorage.getItem("token");
    },

    getUser() {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    setAuth(data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    },

    clearAuth() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    isAuthenticated() {
        return !!auth.getToken();
    },
};

