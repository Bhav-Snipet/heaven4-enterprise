import axiosInstance from 'axios';
import { toast } from 'react-hot-toast';

const client = axiosInstance.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
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
    (response) => response,
    (error) => {
        const suppressToast = error.config?.headers?.['x-suppress-error-toast'] || error.config?.headers?.['X-Suppress-Error-Toast'];
        
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
                    toast.error("An unexpected server error occurred.");
                } else if (error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                }
            } else if (error.request) {
                // Ignore network errors when suppressed or during background fallback
                console.warn("Network request failed, falling back to local state.");
            }
        }
        return Promise.reject(error);
    }
);

export default client;
