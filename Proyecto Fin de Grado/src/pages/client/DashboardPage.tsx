import { useQuery } from '@tanstack/react-query';
import { getMyAssignments } from '../../api/routines.api.ts';
import { getAppointments } from '../../api/appointments.api.ts';
import { useAuthStore } from '../../store/auth.store';
import { Dumbbell, CalendarDays, Flame } from 'lucide-react';
import type { Routine } from '../../types/index.ts';

type Appointment = {
  id: number; datetime: string; duration_min: number;
  status: string;
};

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function ClientDashboard() {
  const { user } = useAuthStore();

  const { data: routines = [] } = useQuery<Routine[]>({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const upcoming = appointments
    .filter((a) => a.status !== 'cancelled' && new Date(a.datetime) >= new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const stats = [
    {
      label: 'Rutinas activas', value: routines.length,
      icon: Dumbbell, color: 'text-energy', wrap: 'bg-energy/10 border-energy/15',
    },
    {
      label: 'Próximas citas', value: upcoming.length,
      icon: CalendarDays, color: 'text-achievement', wrap: 'bg-achievement/10 border-achievement/15',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-primary">Panel del cliente</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              Hola, {user?.name}
            </h1>
            <p className="text-sm text-muted-foreground">Tu resumen de hoy</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-energy/15 bg-energy/10 px-4 py-3">
            <Flame className="h-4 w-4 text-energy" />
            <p className="font-label text-xs text-energy">
              {routines.length > 0 ? '¡Sigue así, vas genial!' : 'Sin rutinas activas aún'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, color, wrap }) => (
          <article key={label} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary">
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="font-label text-[11px] text-muted-foreground">{label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${wrap}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className={`font-display text-4xl leading-none tracking-[0.03em] tabular-nums ${color}`}>
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        {/* ── Mis rutinas ── */}
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <p className="font-label text-[11px] text-energy">Entrenamiento</p>
            <h2 className="font-display text-3xl leading-none tracking-[0.03em]">Mis rutinas</h2>
          </div>

          {routines.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <Dumbbell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sin rutinas asignadas</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {routines.map((r) => {
                const allRE = r.routine_exercises ?? [];
                const daysWithEx = new Set(
                  allRE
                    .filter((re) => re.day_of_week !== null && re.day_of_week !== undefined)
                    .map((re) => re.day_of_week as number),
                );

                return (
                  <li key={r.id} className="py-3">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                      <span className="shrink-0 rounded-full border border-energy/15 bg-energy/10 px-2.5 py-0.5 font-label text-[10px] text-energy">
                        Activa
                      </span>
                    </div>
                    {/* mini barra días */}
                    <div className="flex gap-1">
                      {[0,1,2,3,4,5,6].map((d) => (
                        <span
                          key={d}
                          className={[
                            'flex h-4 w-6 items-center justify-center rounded font-label text-[9px]',
                            daysWithEx.has(d)
                              ? 'bg-energy/15 text-energy'
                              : 'bg-secondary text-muted-foreground/30',
                          ].join(' ')}
                        >
                          {DAYS[d]}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        {/* ── Próximas citas ── */}
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <p className="font-label text-[11px] text-achievement">Agenda</p>
            <h2 className="font-display text-3xl leading-none tracking-[0.03em]">Próximas citas</h2>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <CalendarDays className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sin citas programadas</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{fmtDate(a.datetime)}</p>
                    <p className="text-xs text-muted-foreground">{fmtTime(a.datetime)} · {a.duration_min} min</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-achievement/15 bg-achievement/10 px-2.5 py-1 font-label text-[10px] text-achievement">
                    {a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
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
