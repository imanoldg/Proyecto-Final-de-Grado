import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../../api/admin.api';
import { Users, Dumbbell, UserCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  const cards = [
    { label: 'Total usuarios',    value: stats?.totalClients   ?? '—', icon: Users,     color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950/40' },
    { label: 'Total entrenadores', value: stats?.totalTrainers ?? '—', icon: Dumbbell,  color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-950/40' },
    { label: 'Clientes activos',  value: stats?.activeClients  ?? '—', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tabular-nums">
                {isLoading ? <span className="animate-pulse">...</span> : value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}