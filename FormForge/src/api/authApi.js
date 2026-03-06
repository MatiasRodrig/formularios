import axiosInstance from './axiosInstance';

export const authApi = {
    login: async (username, password) => {
        const response = await axiosInstance.post('/api/auth/login', {
            userName: username,
            password
        });
        return response.data;
    },
    register: async (username, password, email, role, areaId) => {
        const response = await axiosInstance.post('/api/auth/register', { username, password, email, role, areaId });
        return response.data;
    },
};
