import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, updateAppointmentStatus } from '../../api/appointments.api.ts';
import { CalendarDays, Check, X, Clock, User } from 'lucide-react';

type Appointment = {
  id: number;
  datetime: string;
  duration_min: number;
  status: 'confirmed' | 'cancelled' | 'pending' | string;
  notes?: string | null;
  client_id?: number;
  client?: { id?: number; name?: string; email?: string };
};

const statusLabel = (s: string) =>
  ({ confirmed: 'Confirmada', cancelled: 'Cancelada', pending: 'Pendiente' }[s] ?? s);

const statusClass = (s: string) =>
  ({
    confirmed: 'bg-green-500/12 text-green-400 border border-green-500/15',
    cancelled:  'bg-primary/12 text-primary border border-primary/15',
    pending:    'bg-achievement/12 text-achievement border border-achievement/15',
  }[s] ?? 'bg-muted text-muted-foreground border border-border');

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

export default function TrainerAppointmentsPage() {
  const queryClient = useQueryClient();
  const now = new Date();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    refetchInterval: 30_000,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const todayAppts = appointments.filter((a) =>
    isSameDay(new Date(a.datetime), now)
  );

  const upcomingAppts = appointments
    .filter((a) => {
      const d = new Date(a.datetime);
      return d > now && !isSameDay(d, now) && a.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .slice(0, 10);

  const pendingAppts = appointments.filter((a) => a.status === 'pending');

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Cargando citas...
      </div>
    );

  return (
    <div className="space-y-6 bg-background text-foreground">

      {/* Cabecera */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-primary">Agenda</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              Citas
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las citas de hoy y las próximas sesiones.
            </p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-primary/10 px-4 py-3">
            <p className="font-label text-[11px] text-primary">Resumen</p>
            <p className="text-sm text-foreground">
              {todayAppts.length} hoy · {pendingAppts.length} pendientes de confirmar
            </p>
          </div>
        </div>
      </section>

      {/* Pendientes de confirmar */}
      {pendingAppts.length > 0 && (
        <section className="rounded-lg border border-achievement/30 bg-achievement/5 p-5">
          <div className="mb-4">
            <p className="font-label text-[11px] text-achievement">Requieren acción</p>
            <h2 className="font-display text-3xl leading-none tracking-[0.03em]">
              Pendientes de confirmar
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {pendingAppts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <User size={13} className="shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.client?.name ?? `Cliente #${a.client_id}`}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays size={12} />
                    <span>
                      {new Date(a.datetime).toLocaleDateString('es-ES', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                    </span>
                    <Clock size={12} />
                    <span>
                      {new Date(a.datetime).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })} · {a.duration_min} min
                    </span>
                  </div>
                  {a.notes && (
                    <p className="mt-0.5 text-xs text-muted-foreground italic">{a.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => changeStatus({ id: Number(a.id), status: 'confirmed' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-green-400 transition-colors hover:bg-green-500/30"
                    title="Confirmar"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => changeStatus({ id: Number(a.id), status: 'cancelled' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary transition-colors hover:bg-primary/25"
                    title="Cancelar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* Citas de hoy */}
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <p className="font-label text-[11px] text-energy">Agenda del día</p>
            <h2 className="font-display text-3xl leading-none tracking-[0.03em]">
              Citas de hoy
            </h2>
          </div>

          {todayAppts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Sin citas para hoy</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todayAppts
                .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                .map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.client?.name ?? `Cliente #${a.client_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.datetime).toLocaleTimeString('es-ES', {
                          hour: '2-digit', minute: '2-digit',
                        })} · {a.duration_min} min
                      </p>
                      {a.notes && (
                        <p className="text-xs text-muted-foreground italic">{a.notes}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 font-label text-[10px] ${statusClass(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </article>

        {/* Próximas citas */}
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <p className="font-label text-[11px] text-primary">Próximas sesiones</p>
            <h2 className="font-display text-3xl leading-none tracking-[0.03em]">
              Próximas citas
            </h2>
          </div>

          {upcomingAppts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No hay citas próximas</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingAppts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.client?.name ?? `Cliente #${a.client_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.datetime).toLocaleDateString('es-ES', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })} · {new Date(a.datetime).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })} · {a.duration_min} min
                    </p>
                    {a.notes && (
                      <p className="text-xs text-muted-foreground italic">{a.notes}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 font-label text-[10px] ${statusClass(a.status)}`}>
                    {statusLabel(a.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}