import api from './axios';
import type { User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'trainer' | 'client';
}

export const login = async (
  data: LoginPayload
): Promise<{ token: string; user: User }> => (await api.post('/auth/login', data)).data;

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  trainer_id?: number;
}) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const getMe = async (): Promise<User> => (await api.get('/auth/me')).data;

