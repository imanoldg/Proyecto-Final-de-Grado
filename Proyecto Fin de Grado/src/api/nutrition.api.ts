import api from './axios';
import type { NutritionLog } from '../types';
export type FoodResult = {
  fdcId: number; name: string;
  calories: number; protein: number; carbs: number; fat: number;
};
// ─── Búsqueda con USDA (via proxy backend) ───────────────────────────────────
export const searchFood = (q: string): Promise<FoodResult[]> =>
  api.get('/nutrition/search', { params: { q } }).then((r) => r.data);

// ─── Registro del día ────────────────────────────────────────────────────────
export const getNutritionLogs = (): Promise<NutritionLog[]> =>
  api.get('/nutrition').then((r) => r.data);

export const getNutritionHistory = (date?: string): Promise<NutritionLog[]> =>
  api.get('/nutrition/history', { params: date ? { date } : {} }).then((r) => r.data);

export const addNutritionLog = (data: {
  food_name: string; grams: number;
  calories: number; protein: number; carbs: number; fat: number;
  date?: string;
}): Promise<NutritionLog> =>
  api.post('/nutrition', data).then((r) => r.data);

export const deleteNutritionLog = (id: number): Promise<void> =>
  api.delete(`/nutrition/${id}`).then((r) => r.data);