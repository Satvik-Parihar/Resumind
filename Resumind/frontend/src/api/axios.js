import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        const skipAuthPaths = ["/token/", "/token/refresh/", "/accounts/register/"];
        const isSkipped = skipAuthPaths.some((path) => config.url.includes(path));

        if (token && !isSkipped) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto-refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem("refresh");

            if (refresh) {
                try {
                    const res = await axios.post("http://localhost:8000/api/token/refresh/", { refresh });

                    localStorage.setItem("access", res.data.access);
                    api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (err) {
                    console.error("Token refresh failed:", err);
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    window.location.href = "/login";
                }
            } else {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
