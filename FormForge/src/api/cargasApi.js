import axiosInstance from './axiosInstance';

export const cargasApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/cargas');
        return response.data;
    },
    getByArea: async (areaId) => {
        const response = await axiosInstance.get(`/api/cargas/area/${areaId}`);
        return response.data;
    },
    getByForm: async (formId) => {
        const response = await axiosInstance.get(`/api/cargas/form/${formId}`);
        return response.data;
    },
    create: async (data) => {
        // data example: { formId, data: JSON.stringify(formValues) }
        const response = await axiosInstance.post('/api/cargas', data);
        return response.data;
    }
};
