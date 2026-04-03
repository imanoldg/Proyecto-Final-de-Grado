import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, createAppointment } from '../../api/appointments.api.ts';
import { getTrainers } from '../../api/users.api.ts';
import { Plus, CalendarDays, Loader2, X } from 'lucide-react';

type Appointment = {
  id: string | number;
  datetime: string;
  duration_min: number;
  notes?: string | null;
  status: 'confirmed' | 'cancelled' | 'pending' | string;
};

type Trainer = {
  id: number;
  name: string;
  email: string;
};

const statusLabel = (s: string) =>
  ({ confirmed: 'Confirmada', cancelled: 'Cancelada', pending: 'Pendiente' }[s] ?? s);

const statusCls = (s: string) =>
  ({
    confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    cancelled: 'bg-destructive/10 text-destructive',
    pending:   'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  }[s] ?? 'bg-muted text-muted-foreground');

const AppointmentItem = ({ a }: { a: Appointment }) => (
  <li className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium">
        {new Date(a.datetime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(a.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        {a.duration_min ? ` · ${a.duration_min}min` : ''}
      </p>
      {a.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{a.notes}</p>}
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-full ${statusCls(a.status)}`}>
      {statusLabel(a.status)}
    </span>
  </li>
);

export default function AppointmentsPage() {
  const qc = useQueryClient();

  const [open, setOpen]           = useState(false);
  const [trainerId, setTrainerId] = useState('');
  const [datetime, setDatetime]   = useState('');
  const [notes, setNotes]         = useState('');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: trainers = [], isLoading: loadingTrainers } = useQuery({
    queryKey: ['trainers'],
    queryFn: getTrainers,
    enabled: open, // solo carga cuando se abre el modal
  });

  const createMut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setOpen(false);
      setTrainerId('');
      setDatetime('');
      setNotes('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datetime || !trainerId) return;
    createMut.mutate({
      trainer_id:   Number(trainerId),
      datetime,
      notes,
      duration_min: 60,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTrainerId('');
    setDatetime('');
    setNotes('');
    createMut.reset();
  };

  // Safe extractor for mutation errors without using `any`
  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const e = err as { response?: { data?: { message?: string } } };
      return e.response?.data?.message ?? 'Error al solicitar la cita.';
    }
    if (err instanceof Error) return err.message;
    return 'Error al solicitar la cita.';
  };

  const upcoming = appointments
    .filter((a: Appointment) => new Date(a.datetime) > new Date())
    .sort((a: Appointment, b: Appointment) => +new Date(a.datetime) - +new Date(b.datetime));

  const past = appointments
    .filter((a: Appointment) => new Date(a.datetime) <= new Date())
    .sort((a: Appointment, b: Appointment) => +new Date(b.datetime) - +new Date(a.datetime));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Citas</h1>
          <p className="text-sm text-muted-foreground">{upcoming.length} próximas</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                     bg-primary text-primary-foreground rounded-md
                     hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Solicitar cita
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                Próximas
              </h2>
              <ul>{upcoming.map((a: Appointment) => <AppointmentItem key={a.id} a={a} />)}</ul>
            </div>
          )}
          {past.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                Anteriores
              </h2>
              <ul>{past.slice(0, 5).map((a: Appointment) => <AppointmentItem key={a.id} a={a} />)}</ul>
            </div>
          )}
          {appointments.length === 0 && (
            <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 gap-3">
              <CalendarDays className="w-9 h-9 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tienes citas. Solicita la primera.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Solicitar cita</h2>
              <button onClick={handleClose} aria-label="Cerrar">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Selector de entrenador */}
              <div className="space-y-1.5">
                <label htmlFor="trainer" className="text-sm font-medium">
                  Entrenador <span className="text-destructive">*</span>
                </label>
                {loadingTrainers ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando entrenadores...
                  </div>
                ) : (
                  <select
                    id="trainer"
                    required
                    value={trainerId}
                    onChange={e => setTrainerId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background
                               text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                               focus:border-primary transition-colors"
                  >
                    <option value="">Selecciona un entrenador</option>
                    {trainers.map((t: Trainer) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fecha y hora */}
              <div className="space-y-1.5">
                <label htmlFor="datetime" className="text-sm font-medium">
                  Fecha y hora <span className="text-destructive">*</span>
                </label>
                <input
                  id="datetime"
                  type="datetime-local"
                  required
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                             transition-colors"
                />
              </div>

              {/* Notas */}
              <div className="space-y-1.5">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notas <span className="text-muted-foreground text-xs">(opcional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                             transition-colors"
                />
                {createMut.isError && (
                  <p className="text-sm text-destructive text-center">
                    {getErrorMessage(createMut.error)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!datetime || !trainerId || createMut.isPending}
                className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground
                           rounded-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors"
              >
                {createMut.isPending ? 'Enviando...' : 'Solicitar cita'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
