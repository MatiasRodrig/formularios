import axiosInstance from './axiosInstance';

export const areasApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/areas');
        return response.data;
    },
    create: async (data) => {
        const response = await axiosInstance.post('/api/areas', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await axiosInstance.delete(`/api/areas/${id}`);
        return response.data;
    }
};
