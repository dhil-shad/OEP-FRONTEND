import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: BASE_URL,
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: Interceptor to handle token refresh logic on 401
export default api;
