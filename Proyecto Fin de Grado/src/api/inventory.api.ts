import api from './axios';
import type { InventoryItem } from '../types';

export const getInventory = async (): Promise<InventoryItem[]> =>
  (await api.get('/inventory')).data;

export const createInventoryItem = async (
  data: Partial<InventoryItem>
): Promise<InventoryItem> => (await api.post('/inventory', data)).data;

export const updateInventoryItem = async (
  id: number,
  data: Partial<InventoryItem>
): Promise<InventoryItem> => (await api.put(`/inventory/${id}`, data)).data;

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};
