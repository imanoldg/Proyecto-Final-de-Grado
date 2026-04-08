import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, createAppointment } from '../../api/appointments.api.ts';
import { getTrainers } from '../../api/users.api.ts';
import { Plus, CalendarDays, Loader2, X, Clock } from 'lucide-react';

type Appointment = {
  id: string | number; datetime: string; duration_min: number;
  notes?: string | null; status: 'confirmed' | 'cancelled' | 'pending' | string;
};
type Trainer = { id: number; name: string; email: string };

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmada',  cls: 'bg-green-500/12 text-green-400 border-green-500/15'   },
  cancelled: { label: 'Cancelada',   cls: 'bg-primary/12  text-primary  border-primary/15'       },
  pending:   { label: 'Pendiente',   cls: 'bg-achievement/12 text-achievement border-achievement/15' },
};
const statusInfo = (s: string) =>
  STATUS_MAP[s] ?? { label: s, cls: 'bg-muted text-muted-foreground border-border' };

const fmtDay  = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const AppointmentCard = ({ a }: { a: Appointment }) => {
  const { label, cls } = statusInfo(a.status);
  return (
    <li className="rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium capitalize text-foreground">{fmtDay(a.datetime)}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {fmtTime(a.datetime)}
            {a.duration_min ? ` · ${a.duration_min} min` : ''}
          </p>
          {a.notes && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.notes}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 font-label text-[10px] ${cls}`}>
          {label}
        </span>
      </div>
    </li>
  );
};

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [open, setOpen]   = useState(false);
  const [trainerId,  setTrainerId]  = useState('');
  const [datetime,   setDatetime]   = useState('');
  const [duration,   setDuration]   = useState('60');
  const [notes,      setNotes]      = useState('');

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'], queryFn: getAppointments,
  });
  const { data: trainers = [] } = useQuery<Trainer[]>({
    queryKey: ['trainers'], queryFn: getTrainers,
  });

  const createMut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setOpen(false); setTrainerId(''); setDatetime(''); setDuration('60'); setNotes('');
    },
  });

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.status !== 'cancelled' && new Date(a.datetime) >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  const past = appointments
    .filter((a) => a.status === 'cancelled' || new Date(a.datetime) < now)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-achievement">Agenda</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">Citas</h1>
            <p className="text-sm text-muted-foreground">
              {upcoming.length} próxima{upcoming.length !== 1 && 's'} · {past.length} pasada{past.length !== 1 && 's'}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Solicitar cita
          </button>
        </div>
      </section>

      {/* ── Upcoming ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Próximas</h2>
          <span className="rounded-full border border-achievement/15 bg-achievement/10 px-2.5 py-1 font-label text-[10px] text-achievement">
            {upcoming.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card px-4 py-10 text-center">
            <CalendarDays className="mx-auto mb-3 h-7 w-7 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No tienes citas. Solicita la primera.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => <AppointmentCard key={a.id} a={a} />)}
          </ul>
        )}
      </div>

      {/* ── Past ── */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl leading-none tracking-[0.03em] text-muted-foreground">
            Historial
          </h2>
          <ul className="space-y-2">
            {past.slice(0, 6).map((a) => <AppointmentCard key={a.id} a={a} />)}
          </ul>
        </div>
      )}

      {/* ── Modal solicitar ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-achievement">Nueva solicitud</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Solicitar cita</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMut.mutate({
                  trainer_id: Number(trainerId), datetime,
                  duration_min: Number(duration), notes: notes || undefined,
                });
              }}
              className="space-y-4"
            >
              {/* Entrenador */}
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Entrenador <span className="text-primary">*</span>
                </label>
                <select
                  required value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Selecciona un entrenador…</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* Fecha y hora */}
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Fecha y hora <span className="text-primary">*</span>
                </label>
                <input
                  type="datetime-local" required value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Duración */}
              <div>
                <label className="font-label text-[11px] text-muted-foreground">Duración (min)</label>
                <input
                  type="number" min="15" step="15" value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="font-label text-[11px] text-muted-foreground">Notas</label>
                <textarea
                  value={notes} rows={2}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Algo que deba saber tu entrenador?"
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit" disabled={createMut.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {createMut.isPending ? 'Enviando…' : 'Solicitar cita'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
