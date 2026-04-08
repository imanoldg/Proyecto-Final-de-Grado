import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventory } from '../../api/inventory.api';
import { getOrders, createOrder } from '../../api/orders.api';
import {
  ShoppingBag, Plus, Minus, Trash2, Loader2, ShoppingCart, X, Package,
} from 'lucide-react';
import type { InventoryItem, Order, OrderStatus } from '../../types';

interface CartItem { item: InventoryItem; qty: number; }

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending:    { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  processing: { label: 'En proceso', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  completed:  { label: 'Completado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  cancelled:  { label: 'Cancelado',  cls: 'bg-destructive/10 text-destructive' },
};

export default function ClientOrdersPage() {
  const qc = useQueryClient();
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [showCart, setShowCart]           = useState(false);
  const [notes, setNotes]                 = useState('');
  const [tab, setTab]                     = useState<'shop' | 'history'>('shop');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const createMut = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      setCart([]);
      setNotes('');
      setShowCart(false);
      setTab('history');
    },
  });

  const available = products.filter(p => p.active && p.stock > 0);

  const addToCart = (item: InventoryItem) => {
    setCart(c => {
      const existing = c.find(ci => ci.item.id === item.id);
      if (existing) {
        return c.map(ci =>
          ci.item.id === item.id
            ? { ...ci, qty: Math.min(ci.qty + 1, item.stock) }
            : ci
        );
      }
      return [...c, { item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(c =>
      c
        .map(ci => ci.item.id === id ? { ...ci, qty: ci.qty + delta } : ci)
        .filter(ci => ci.qty > 0)
    );
  };

  const removeFromCart = (id: number) => setCart(c => c.filter(ci => ci.item.id !== id));

  const cartTotal = cart.reduce((s, ci) => s + ci.item.price * ci.qty, 0);
  const cartCount = cart.reduce((s, ci) => s + ci.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createMut.mutate({
      items: cart.map(ci => ({ inventory_item_id: ci.item.id, quantity: ci.qty })),
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tienda</h1>
          <p className="text-sm text-muted-foreground">{available.length} productos disponibles</p>
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Ver carrito
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {([['shop', 'Productos'], ['history', 'Mis pedidos']] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
            {value === 'history' && orders.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-muted rounded-full">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {tab === 'shop' && (
        loadingProducts ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : available.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <ShoppingBag className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((product: InventoryItem) => {
              const inCart = cart.find(ci => ci.item.id === product.id);
              return (
                <div key={product.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      {product.category && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full shrink-0">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.stock} en stock</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-base font-semibold tabular-nums">{product.price.toFixed(2)} €</span>
                    {inCart ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(product.id, -1)} className="p-1 rounded border border-border hover:bg-accent transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-7 text-center text-sm tabular-nums">{inCart.qty}</span>
                        <button onClick={() => updateQty(product.id, 1)} disabled={inCart.qty >= product.stock} className="p-1 rounded border border-border hover:bg-accent disabled:opacity-40 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Plus className="w-3.5 h-3.5" />Añadir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Order history */}
      {tab === 'history' && (
        loadingOrders ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <ShoppingBag className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">AÃºn no has realizado ningÃºn pedido</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">#{order.id}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'â€”'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{order.total.toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[order.status].cls}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs px-2.5 py-1.5 border border-border rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors whitespace-nowrap"
                      >
                        Ver más
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal detalle del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-rgb(18, 18, 23) border border-border rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold">Pedido #{selectedOrder.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedOrder.createdAt &&
                    new Date(selectedOrder.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
              {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                  <Package className="w-7 h-7 opacity-40" />
                  <p className="text-sm">Sin productos</p>
                </div>
              ) : (
                selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {item.product?.name ?? `Producto #${item.inventory_item_id}`}
                      </p>
                      {item.product?.category && (
                        <p className="text-xs text-muted-foreground">{item.product.category}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm tabular-nums font-medium">
                        {(item.unit_price * item.quantity).toFixed(2)} €
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {item.quantity} x {item.unit_price.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-4 border-t border-border space-y-2">
              {selectedOrder.notes && (
                <p className="text-xs text-muted-foreground italic">Nota: {selectedOrder.notes}</p>
              )}
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm">Total</span>
                <span className="tabular-nums">{selectedOrder.total.toFixed(2)} €</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Cart sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0" onClick={() => setShowCart(false)} />
          <div className="relative flex flex-col w-full max-w-sm bg-white dark:bg-zinc-900 h-full shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold">Carrito ({cartCount})</h2>
              <button onClick={() => setShowCart(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carrito vací­o</p>
              ) : (
                cart.map(ci => (
                  <div key={ci.item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ci.item.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{ci.item.price.toFixed(2)} €/ud</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => updateQty(ci.item.id, -1)} className="p-1 rounded border border-border hover:bg-accent"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center text-sm tabular-nums">{ci.qty}</span>
                      <button onClick={() => updateQty(ci.item.id, 1)} disabled={ci.qty >= ci.item.stock} className="p-1 rounded border border-border hover:bg-accent disabled:opacity-40"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeFromCart(ci.item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-border space-y-3">
                <div>
                  <label className="text-sm font-medium">Notas del pedido</label>
                  <input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{cartTotal.toFixed(2)} €</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={createMut.isPending}
                  className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {createMut.isPending ? 'Enviando...' : 'Confirmar pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}