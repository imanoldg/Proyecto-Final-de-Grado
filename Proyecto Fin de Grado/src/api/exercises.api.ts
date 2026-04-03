import api from './axios';
import type { Exercise } from '../types';

export const getExercises = async (): Promise<Exercise[]> =>
  (await api.get('/exercises')).data;

export const createExercise = async (
  data: Partial<Exercise>
): Promise<Exercise> => (await api.post('/exercises', data)).data;

export const updateExercise = async (
  id: number,
  data: Partial<Exercise>
): Promise<Exercise> => (await api.put(`/exercises/${id}`, data)).data;

export const deleteExercise = async (id: number): Promise<void> => {
  await api.delete(`/exercises/${id}`);
};
