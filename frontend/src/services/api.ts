import axios from 'axios';

const env = import.meta.env;

const api = axios.create({
  baseURL: env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: Number(env.VITE_API_TIMEOUT || 30000),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
