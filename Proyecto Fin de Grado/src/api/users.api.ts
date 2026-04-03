import api from './axios';
import type { User } from '../types';

export const getClients = async (): Promise<User[]> =>
  (await api.get('/users?role=client')).data;

export const createClient = async (
  data: Omit<User, 'id'> & { password: string }
): Promise<User> => (await api.post('/users', data)).data;

export const updateUser = async (
  id: number,
  data: Partial<User>
): Promise<User> => (await api.put(`/users/${id}`, data)).data;

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getTrainers = async () => {
  const res = await api.get('/users/trainers');
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};
