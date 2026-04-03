import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../../api/orders.api';
import { Loader2, ShoppingCart } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending:    { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  processing: { label: 'En proceso', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  completed:  { label: 'Completado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  cancelled:  { label: 'Cancelado',  cls: 'bg-destructive/10 text-destructive' },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];

export default function TrainerOrdersPage() {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Gestión de pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedidos · {pendingCount} pendiente(s) · {processingCount} en proceso
        </p>
      </div>

      {/* Summary chips */}
      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(s => {
            const count = orders.filter(o => o.status === s).length;
            if (!count) return null;
            return (
              <span key={s} className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_CONFIG[s].cls}`}>
                {STATUS_CONFIG[s].label}: {count}
              </span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <ShoppingCart className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay pedidos todavía</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Productos</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {order.client?.name ?? `Cliente #${order.client_id}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell tabular-nums">
                      {order.items?.length ?? '—'} artículo(s)
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e =>
                          updateMut.mutate({ id: order.id, status: e.target.value })
                        }
                        className="text-xs px-2 py-1 border border-border rounded-md bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {STATUS_FLOW.map(s => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
