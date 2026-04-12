import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../api/appointments.api.ts';
import { CalendarDays, Loader2, Clock } from 'lucide-react';

type Appointment = {
  id: string | number;
  datetime: string;
  duration_min: number;
  notes?: string | null;
  status: 'confirmed' | 'cancelled' | 'pending' | string;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmada',  cls: 'bg-green-500/12 text-green-400 border-green-500/15'       },
  cancelled: { label: 'Cancelada',   cls: 'bg-primary/12  text-primary  border-primary/15'           },
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
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    refetchInterval: 30_000,
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

      {/* Header */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="space-y-1.5">
          <span className="font-label text-xs text-achievement">Agenda</span>
          <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">Citas</h1>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} próxima{upcoming.length !== 1 && 's'} · {past.length} pasada{past.length !== 1 && 's'}
          </p>
        </div>
      </section>

      {/* Próximas */}
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
            <p className="text-sm text-muted-foreground">No tienes citas próximas.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => <AppointmentCard key={a.id} a={a} />)}
          </ul>
        )}
      </div>

      {/* Historial */}
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
    </div>
  );
}