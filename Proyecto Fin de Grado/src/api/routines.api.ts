import api from './axios';
import type { Routine, RoutineExercise } from '../types';

export const getRoutines = (): Promise<Routine[]> =>
  api.get('/routines').then((r) => r.data);

export const getRoutineById = (id: number): Promise<Routine> =>
  api.get(`/routines/${id}`).then((r) => r.data);

export const createRoutine = (data: {
  name: string;
  description?: string;
  assigned_client_id?: number | null;
}): Promise<Routine> =>
  api.post('/routines', data).then((r) => r.data);

export const updateRoutine = (
  id: number,
  data: Partial<{ name: string; description: string; assigned_client_id: number | null }>,
): Promise<Routine> =>
  api.patch(`/routines/${id}`, data).then((r) => r.data);

export const deleteRoutine = (id: number): Promise<void> =>
  api.delete(`/routines/${id}`).then((r) => r.data);

// ─── Asignación a cliente ─────────────────────────────────────────────────────
export const assignRoutine = (data: {
  routine_id: number;
  client_id: number;
}): Promise<Routine> =>
  api
    .post(`/routines/${data.routine_id}/assign`, { client_id: data.client_id })
    .then((r) => r.data);

// ─── Ejercicios de la rutina ──────────────────────────────────────────────────
export const addExerciseToRoutine = (data: {
  routine_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  rest_seconds?: number;
  notes?: string;
  order?: number;
  day_of_week?: number | null;          // 0-6, omite si no aplica
}): Promise<RoutineExercise> => {
  const { routine_id, ...body } = data;
  return api.post(`/routines/${routine_id}/exercises`, body).then((r) => r.data);
};

// Elimina por routine_exercise.id (NO por exercise_id)
// Permite borrar el mismo ejercicio de un día sin afectar al resto de días
export const removeExerciseFromRoutine = (data: {
  routine_id: number;
  routine_exercise_id: number;
}): Promise<void> =>
  api
    .delete(`/routines/${data.routine_id}/exercises/${data.routine_exercise_id}`)
    .then((r) => r.data);

// ─── Asignaciones (área de cliente) ──────────────────────────────────────────
export const getMyAssignments = (): Promise<Routine[]> =>
  api.get('/routines').then((r) => r.data);

