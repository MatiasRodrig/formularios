import axiosInstance from './axiosInstance';

export const usersApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/users');
        return response.data;
    },
    create: async (data) => {
        const response = await axiosInstance.post('/api/users', data);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`/api/users/${id}`);
        return response.data;
    },
    updateRoleArea: async (id, data) => {
        const response = await axiosInstance.patch(`/api/users/${id}/role`, data);
        return response.data;
    },
    updatePassword: async (data) => {
        const response = await axiosInstance.patch(`/api/users/me/password`, data);
        return response.data;
    },
};
