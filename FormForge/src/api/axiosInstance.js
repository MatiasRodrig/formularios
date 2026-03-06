import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://192.168.27.113:5023',
});

console.log(import.meta.env.VITE_API_URL)

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Logic for handling unauthorized, e.g. dispatch logout or clear storage
            // In a real app we might want to trigger a zustand action directly or use a global event
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Optional: Redirect to login immediately
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
