import api from './axios';
import type { Routine, Assignment, RoutineExercise } from '../types';

export const getRoutines = async (): Promise<Routine[]> =>
  (await api.get('/routines')).data;

export const createRoutine = async (
  data: Partial<Routine>
): Promise<Routine> => (await api.post('/routines', data)).data;

export const deleteRoutine = async (id: number): Promise<void> => {
  await api.delete(`/routines/${id}`);
};

export const addExerciseToRoutine = async (
  routineId: number,
  data: RoutineExercise
): Promise<Routine> =>
  (await api.post(`/routines/${routineId}/exercises`, data)).data;

export const assignRoutine = async (data: {
  client_id: number;
  routine_id: number;
  start_date?: string;
  end_date?: string;
}): Promise<Assignment> => (await api.post('/assignments', data)).data;

export const getMyAssignments = async (): Promise<Assignment[]> =>
  (await api.get('/assignments/me')).data;

export const getAssignmentsByClient = async (
  clientId: number
): Promise<Assignment[]> =>
  (await api.get(`/assignments?client_id=${clientId}`)).data;
