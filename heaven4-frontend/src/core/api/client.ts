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
        if (error.response) {
            if (error.response.status === 401) {
                // Clear tokens and force login if unauthorized
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_info');
                // We'll let the AuthProvider handle the redirect by noticing the missing token
                toast.error("Session expired. Please log in again.");
            } else if (error.response.status >= 500) {
                toast.error("An unexpected server error occurred.");
            } else if (error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            }
        } else if (error.request) {
            toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
    }
);

export default client;
