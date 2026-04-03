import { useQuery } from '@tanstack/react-query';
import { getClients } from '../../api/users.api.ts';
import { getRoutines } from '../../api/routines.api.ts';
import { getAppointments } from '../../api/appointments.api.ts';
import { getOrders } from '../../api/orders.api.ts';
import { useAuthStore } from '../../store/auth.store';
import { Users, ClipboardList, CalendarDays, ShoppingCart } from 'lucide-react';

export default function TrainerDashboard() {
  type Appointment = {
    id: number;
    datetime: string;
    duration_min: number;
    status: string;
    client_id?: number;
    client?: { name?: string };
  };

  const { user } = useAuthStore();
  const { data: clients = [] }      = useQuery({ queryKey: ['clients'],      queryFn: getClients });
  const { data: routines = [] }     = useQuery({ queryKey: ['routines'],     queryFn: getRoutines });
  const { data: appointments = [] } = useQuery<Appointment[]>({ queryKey: ['appointments'], queryFn: getAppointments });
  const { data: orders = [] }       = useQuery({ queryKey: ['orders'],       queryFn: getOrders });

  const todayAppts  = appointments.filter(a => new Date(a.datetime).toDateString() === new Date().toDateString());
  const pendingOrds = orders.filter(o => o.status === 'pending');

  const stats = [
    { label: 'Clientes activos',    value: clients.length,       icon: Users,         color: 'text-blue-600' },
    { label: 'Rutinas creadas',     value: routines.length,      icon: ClipboardList, color: 'text-emerald-600' },
    { label: 'Citas hoy',           value: todayAppts.length,    icon: CalendarDays,  color: 'text-amber-600' },
    { label: 'Pedidos pendientes',  value: pendingOrds.length,   icon: ShoppingCart,  color: 'text-red-500' },
  ];

  const statusLabel = (s: string) => ({ confirmed: 'Confirmada', cancelled: 'Cancelada', pending: 'Pendiente' }[s] ?? s);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hola, {user?.name} 👋</h1>
        <p className="text-sm text-muted-foreground">Resumen de hoy</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-base font-semibold mb-3">Citas de hoy</h2>
          {todayAppts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin citas hoy</p>
          ) : (
            <ul className="divide-y divide-border">
              {todayAppts.map(a => (
                <li key={a.id} className="flex justify-between items-center py-2.5">
                  <div>
                    <p className="text-sm font-medium">{a.client?.name ?? `Cliente #${a.client_id}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {a.duration_min}min
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{statusLabel(a.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-base font-semibold mb-3">Pedidos pendientes</h2>
          {pendingOrds.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay pedidos pendientes</p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingOrds.slice(0, 5).map(o => (
                <li key={o.id} className="flex justify-between items-center py-2.5">
                  <div>
                    <p className="text-sm font-medium">{o.client?.name ?? `Cliente #${o.client_id}`}</p>
                    <p className="text-xs text-muted-foreground">Pedido #{o.id}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">{o.total.toFixed(2)} €</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}