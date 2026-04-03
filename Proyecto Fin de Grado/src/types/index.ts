export type UserRole = 'trainer' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscle_group?: string;
  video_url?: string;
}

export interface RoutineExercise {
  exercise_id: number;
  exercise?: Exercise;
  sets?: number;
  reps?: string;
  rest_seconds?: number;
  notes?: string;
  order?: number;
}

export interface Routine {
  id: number;
  name: string;
  description?: string;
  trainer_id: number;
  exercises?: RoutineExercise[];
}

export interface Assignment {
  id: number;
  client_id: number;
  routine_id: number;
  routine?: Routine;
  start_date?: string;
  end_date?: string;
  active: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: number;
  client_id: number;
  trainer_id: number;
  client?: User;
  trainer?: User;
  datetime: string;
  duration_min: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface NutritionLog {
  id: number;
  client_id: number;
  date: string;
  meal: string;
  food: string;
  calories?: number;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category?: string;
  price: number;
  stock: number;
  active: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  inventory_item_id: number;
  product?: InventoryItem;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  client_id: number;
  client?: User;
  status: OrderStatus;
  total: number;
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
}
