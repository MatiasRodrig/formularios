import axiosInstance from './axiosInstance';

export const uploadApi = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosInstance.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        return response.data;
    }
};
