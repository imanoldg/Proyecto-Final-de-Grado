import api from './axios';

export const getAppointments = async () => {
  const res = await api.get('/appointments');
  return res.data;
};

export const createAppointment = async (data: {
  trainer_id: number;
  datetime: string;
  notes?: string;
  duration_min?: number;
}) => {
  const res = await api.post('/appointments', data);
  return res.data;
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  const res = await api.patch(`/appointments/${id}`, { status });
  return res.data;
};

export const deleteAppointment = async (id: number) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};
