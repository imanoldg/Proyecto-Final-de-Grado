import axios from 'axios';
import { useAuthStore } from '../store/auth.store.ts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://100.105.102.123:4000/',
  timeout: 10000,
});

// Inyecta el token en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige al login si el token expira
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;