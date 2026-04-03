import api from './axios';
import type { Order } from '../types';

export const getOrders = async (): Promise<Order[]> =>
  (await api.get('/orders')).data;

export const createOrder = async (data: {
  items: { inventory_item_id: number; quantity: number }[];
  notes?: string;
}): Promise<Order> => (await api.post('/orders', data)).data;

export const updateOrderStatus = async (
  id: number,
  status: string
): Promise<Order> =>
  (await api.patch(`/orders/${id}/status`, { status })).data;
