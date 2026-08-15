import axios from 'axios';
import { toast } from 'react-hot-toast';
import { encryptPayload } from './encryption';
import CryptoJS from 'crypto-js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for payload masking (encryption)
api.interceptors.request.use(
  (config) => {
    // Apply encryption only to auth routes
    if (config.url && config.url.includes('/auth') && config.data && (config.method === 'post' || config.method === 'put')) {
        config.data = encryptPayload(config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling and decryption
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.encryptedData) {
      try {
        const secretKey = import.meta.env.VITE_ENCRYPTION_SECRET;
        const bytes = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedString) {
          response.data = JSON.parse(decryptedString);
        }
      } catch (error) {
        console.error('Decryption failed', error);
      }
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(message);
    
    // Handle unauthorized
    if (error.response?.status === 401 && window.location.pathname !== '/') {
        window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export const createProject = (data) => api.post('/projects', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getProjectStatus = (id) => api.get(`/projects/${id}`);

export const chatWithProject = (id, question) => api.post(`/projects/${id}/chat`, { question });

export default api;
