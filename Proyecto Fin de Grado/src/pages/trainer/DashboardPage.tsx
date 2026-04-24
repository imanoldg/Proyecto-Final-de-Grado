import { useQuery } from '@tanstack/react-query';
import { getClients } from '../../api/users.api.ts';
import { getAppointments } from '../../api/appointments.api.ts';
import { getOrders } from '../../api/orders.api.ts';
import { useAuthStore } from '../../store/auth.store';
import {
  Users,
  CalendarDays,
  ShoppingCart,
} from 'lucide-react';

type Appointment = {
  id: number;
  datetime: string;
  duration_min: number;
  status: string;
  client_id?: number;
  client?: { name?: string };
};

type Order = {
  id: number;
  total: number;
  status: string;
  client_id?: number;
  client?: { name?: string };
};

export default function TrainerDashboard() {
  const { user } = useAuthStore();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });


  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    refetchInterval: 30_000,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval: 30_000,
  });

  const todayAppts = appointments.filter((a) => {
    const apptDate = new Date(a.datetime);
    const today = new Date();
    return (
      apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate()
    );
  });

  const pendingOrds = orders.filter((o) => o.status === 'pending');

  const stats = [
    {
      label: 'Clientes activos',
      value: clients.length,
      icon: Users,
      iconWrapClass: 'bg-primary/12 text-primary border border-primary/15',
    },
    {
      label: 'Citas hoy',
      value: todayAppts.length,
      icon: CalendarDays,
      iconWrapClass:
        'bg-achievement/12 text-achievement border border-achievement/15',
    },
    {
      label: 'Pedidos pendientes',
      value: pendingOrds.length,
      icon: ShoppingCart,
      iconWrapClass: 'bg-primary/12 text-primary border border-primary/15',
    },
  ];

  const statusLabel = (s: string) =>
    (
      {
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        pending: 'Pendiente',
      } as const
    )[s as 'confirmed' | 'cancelled' | 'pending'] ?? s;

  const statusClass = (s: string) =>
    ({
      confirmed: 'bg-green-500/12 text-green-400 border border-green-500/15',
      cancelled: 'bg-primary/12 text-primary border border-primary/15',
      pending:
        'bg-achievement/12 text-achievement border border-achievement/15',
    }[s] ?? 'bg-muted text-muted-foreground border border-border');

  return (
    <div className="space-y-6 bg-background text-foreground">
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-primary">
              Dashboard del entrenador
            </span>

            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              Hola, {user?.name}
            </h1>

            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Vista general de clientes, rutinas, citas y pedidos del día.
            </p>
          </div>

        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, iconWrapClass }) => (
          <article
            key={label}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-label text-[11px] text-muted-foreground">
                  {label}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${iconWrapClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="font-display text-4xl leading-none tracking-[0.03em] tabular-nums text-foreground">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-label text-[11px] text-energy">Agenda</p>
              <h2 className="font-display text-3xl leading-none tracking-[0.03em]">
                Citas de hoy
              </h2>
            </div>
          </div>

          {todayAppts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Sin citas hoy</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todayAppts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.client?.name ?? `Cliente #${a.client_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.datetime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {a.duration_min} min
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 font-label text-[10px] ${statusClass(a.status)}`}
                  >
                    {statusLabel(a.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-label text-[11px] text-achievement">Ventas</p>
              <h2 className="font-display text-3xl leading-none tracking-[0.03em]">
                Pedidos pendientes
              </h2>
            </div>
          </div>

          {pendingOrds.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No hay pedidos pendientes
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pendingOrds.slice(0, 5).map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {o.client?.name ?? `Cliente #${o.client_id}`}
                    </p>
                    <p className="font-label text-[10px] text-muted-foreground">
                      Pedido #{o.id}
                    </p>
                  </div>

                  <p className="font-display text-2xl leading-none tracking-[0.03em] tabular-nums text-foreground">
                    {o.total.toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}