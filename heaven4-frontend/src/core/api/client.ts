import axiosInstance from 'axios';
import { toast } from 'react-hot-toast';

const client = axiosInstance.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // 5s max — don't hang the UI waiting for offline backend
});

// Add a request interceptor to attach JWT token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor for global error handling
client.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const suppressToast =
            error.config?.headers?.['x-suppress-error-toast'] ||
            error.config?.headers?.['X-Suppress-Error-Toast'];

        if (!suppressToast) {
            if (error.response) {
                if (error.response.status === 401) {
                    // Clear tokens and force login if unauthorized
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_info');
                    window.dispatchEvent(new Event('auth-expired'));
                    toast.error("Session expired. Please log in again.");
                } else if (error.response.status >= 500) {
                    console.info('[Heaven4] Running in seamless offline mode.');
                } else if (error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                }
            } else {
                // Network error (backend offline / ECONNREFUSED) — silent, just log
                console.warn('[Heaven4] Backend unreachable — running in offline/demo mode.');
            }
        }
        return Promise.reject(error);
    }
);

export default client;
