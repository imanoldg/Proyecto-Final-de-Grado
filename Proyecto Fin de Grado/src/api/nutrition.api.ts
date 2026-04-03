import api from './axios';
import type { NutritionLog } from '../types';

export const getNutritionLogs = async (
  date?: string
): Promise<NutritionLog[]> =>
  (await api.get('/nutrition', { params: date ? { date } : {} })).data;

export const createNutritionLog = async (
  data: Partial<NutritionLog>
): Promise<NutritionLog> => (await api.post('/nutrition', data)).data;

export const deleteNutritionLog = async (id: number): Promise<void> => {
  await api.delete(`/nutrition/${id}`);
};
