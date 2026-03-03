import axiosInstance from './axiosInstance';

export const dashboardApi = {
    getStats: async () => {
        const response = await axiosInstance.get('/api/dashboard/stats');
        return response.data;
    },
};
