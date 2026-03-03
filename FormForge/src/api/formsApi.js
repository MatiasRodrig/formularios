import axiosInstance from './axiosInstance';

export const formsApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/forms');
        return response.data;
    },
    getByArea: async (areaId) => {
        const response = await axiosInstance.get(`/api/forms/area/${areaId}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await axiosInstance.get(`/api/forms/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await axiosInstance.post('/api/forms', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await axiosInstance.patch(`/api/forms/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await axiosInstance.delete(`/api/forms/${id}`);
        return response.data;
    }
};
