import { useQuery } from '@tanstack/react-query';
import { getMyAssignments } from '../../api/routines.api.ts';
import { getAppointments } from '../../api/appointments.api.ts';
import { getNutritionLogs } from '../../api/nutrition.api.ts';
import { useAuthStore } from '../../store/auth.store';
import { ClipboardList, CalendarDays, UtensilsCrossed } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];

  interface Assignment {
    id: number | string;
    active?: boolean;
    routine?: { name?: string } | null;
    routine_id?: number | string;
  }

  interface Appointment {
    id: number | string;
    datetime: string;
    duration_min?: number;
    status?: string;
  }

  interface NutritionLog {
    calories?: number;
  }

  const { data: assignments = [] } = useQuery<Assignment[]>({ queryKey: ['my-assignments'], queryFn: getMyAssignments });
  const { data: appointments = [] } = useQuery<Appointment[]>({ queryKey: ['appointments'], queryFn: getAppointments });
  const { data: logs = [] } = useQuery<NutritionLog[]>({ queryKey: ['nutrition', today], queryFn: () => getNutritionLogs(today) });

  const activeRoutines = assignments.filter(a => a.active);
  const upcoming = appointments.filter(a => new Date(a.datetime) > new Date()).sort((a, b) => +new Date(a.datetime) - +new Date(b.datetime));
  const totalCal = logs.reduce((s, l) => s + (l.calories ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hola, {user?.name} 💪</h1>
        <p className="text-sm text-muted-foreground">Tu resumen de hoy</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Rutinas activas', value: activeRoutines.length, icon: ClipboardList, bg: 'bg-primary/10', color: 'text-primary' },
          { label: 'Próximas citas', value: upcoming.length, icon: CalendarDays, bg: 'bg-amber-100 dark:bg-amber-950/40', color: 'text-amber-600' },
          { label: 'Kcal hoy', value: Math.round(totalCal), icon: UtensilsCrossed, bg: 'bg-emerald-100 dark:bg-emerald-950/40', color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-semibold tabular-nums">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-sm mb-3">Mis rutinas activas</h2>
          {activeRoutines.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Sin rutinas asignadas</p> : (
            <ul className="divide-y divide-border">
              {activeRoutines.map(a => (
                <li key={a.id} className="flex justify-between items-center py-2.5">
                  <p className="text-sm font-medium">{a.routine?.name ?? `Rutina #${a.routine_id}`}</p>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Activa</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-sm mb-3">Próximas citas</h2>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Sin citas programadas</p> : (
            <ul className="divide-y divide-border">
              {upcoming.slice(0, 3).map(a => (
                <li key={a.id} className="flex justify-between items-center py-2.5">
                  <div>
                    <p className="text-sm font-medium">{new Date(a.datetime).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {a.duration_min}min</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}