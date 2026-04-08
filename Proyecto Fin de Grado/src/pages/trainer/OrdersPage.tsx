import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../../api/orders.api.ts';
import { ShoppingCart, Eye, X, Loader2, Package } from 'lucide-react';

type OrderItem = {
  id: number; inventory_item_id: number; quantity: number;
  unit_price: number; product?: { name?: string; category?: string };
};
type Order = {
  id: number; status: string; total: number; notes?: string;
  createdAt?: string; client_id?: number;
  client?: { name?: string };
  items?: OrderItem[];
};

type StatusKey = 'pending' | 'processing' | 'completed' | 'cancelled';

const STATUS_MAP: Record<StatusKey, { label: string; cls: string }> = {
  pending:    { label: 'Pendiente',    cls: 'bg-achievement/12 text-achievement border border-achievement/20' },
  processing: { label: 'En proceso',  cls: 'bg-energy/12     text-energy     border border-energy/20'      },
  completed:  { label: 'Completado',  cls: 'bg-green-500/12  text-green-400  border border-green-500/20'   },
  cancelled:  { label: 'Cancelado',   cls: 'bg-primary/12   text-primary    border border-primary/20'     },
};

const statusInfo = (s: string) => STATUS_MAP[s as StatusKey] ?? { label: s, cls: 'bg-muted text-muted-foreground' };

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function OrdersPage() {
  const qc = useQueryClient();
  const [statusFilter,   setStatusFilter]   = useState('');
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const pendingCount    = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-achievement">Ventas</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} pedidos · {pendingCount} pendiente{pendingCount !== 1 && 's'} · {processingCount} en proceso
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3">
            {(['pending', 'processing', 'completed', 'cancelled'] as StatusKey[]).map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              const { label, cls } = statusInfo(s);
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                  className={'rounded-md border px-3 py-1.5 font-label text-[10px] transition-colors ' +
                    (statusFilter === s ? cls : 'border-border bg-secondary text-muted-foreground hover:bg-card')}
                >
                  {count} {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay pedidos todavía</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {['#', 'Cliente', 'Fecha', 'Artículos', 'Total', 'Estado', ''].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-label text-[11px] text-muted-foreground ${h === '' || h === 'Total' ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => {
                const { cls } = statusInfo(order.status);
                return (
                  <tr key={order.id} className="transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 font-label text-[11px] text-muted-foreground">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {order.client?.name ?? `Cliente #${order.client_id}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(order.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.items?.length ?? '—'} art.
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateMut.mutate({ id: order.id, status: e.target.value })}
                        className={`rounded-full px-2.5 py-1 font-label text-[10px] border-0 cursor-pointer focus:outline-none ${cls}`}
                        style={{ background: 'transparent' }}
                      >
                        {Object.entries(STATUS_MAP).map(([val, { label: l }]) => (
                          <option key={val} value={val}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-energy/10 hover:text-energy"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal detalle ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl max-h-[90vh] flex flex-col">

            {/* Header modal */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="font-label text-[11px] text-achievement">Pedido #{selectedOrder.id}</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">
                  {selectedOrder.client?.name ?? `Cliente #${selectedOrder.client_id}`}
                </h2>
                {selectedOrder.createdAt && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmt(selectedOrder.createdAt)}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 font-label text-[10px] ${statusInfo(selectedOrder.status).cls}`}>
                    {statusInfo(selectedOrder.status).label}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {!selectedOrder.items?.length ? (
                <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
                  <Package className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Sin productos</p>
                </div>
              ) : (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border border-border bg-secondary px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.product?.name ?? `Producto #${item.inventory_item_id}`}
                      </p>
                      {item.product?.category && (
                        <span className="font-label text-[10px] text-muted-foreground">{item.product.category}</span>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        {(item.unit_price * item.quantity).toFixed(2)} €
                      </p>
                      <p className="font-label text-[10px] text-muted-foreground">
                        {item.quantity} × {item.unit_price.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4 space-y-2">
              {selectedOrder.notes && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-label text-[11px] text-foreground">Nota: </span>
                  {selectedOrder.notes}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="font-label text-[11px] text-muted-foreground">Total pedido</span>
                <span className="font-display text-3xl leading-none tracking-[0.03em] tabular-nums text-foreground">
                  {selectedOrder.total.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
