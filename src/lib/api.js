import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const createProject = async (formData) => {
    const response = await api.post('/projects', formData, {
        headers: {
            'Content-Type': undefined
        }
    });
    return response.data;
};

export const getProjectStatus = async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const chatWithProject = async (id, question) => {
    const response = await api.post(`/projects/${id}/chat`, { question });
    return response.data;
};

export default api;
