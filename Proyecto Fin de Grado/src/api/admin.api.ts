import api from './axios'; // tu instancia de axios configurada
import type { User, Order } from '../types';


export const getAdminStats = async () => {
  const { data } = await api.get('/users/admin/stats');
  return data as { totalClients: number; totalTrainers: number; activeClients: number };
};

export const getAllUsers = async () => {
  const { data } = await api.get('/users/admin/all');
  return data as User[];
};

export const createTrainer = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await api.post('/users/admin/create-trainer', payload);
  return data;
};

export const toggleUserActive = async (id: number) => {
  const { data } = await api.patch(`/users/admin/${id}/toggle`);
  return data;
};

export const reassignTrainer = async (clientId: number, trainerId: number) => {
  const { data } = await api.patch(`/users/admin/${clientId}/reassign`, { trainer_id: trainerId });
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders/admin/all');
  return data as Order[];
};