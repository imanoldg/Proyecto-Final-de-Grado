import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventory,
  createInventoryItem,
  deleteInventoryItem,
} from '../../api/inventory.api';
import { Plus, Trash2, Search, Loader2, X, AlertTriangle, Package } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface FormState {
  name: string;
  category: string;
  price: string;
  stock: string;
}

const emptyForm: FormState = { name: '', category: '', price: '', stock: '' };

export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch]     = useState('');
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState<FormState>(emptyForm);
  const [formErr, setFormErr]   = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory,
  });

  const createMut = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });

  const filtered = items.filter((i: InventoryItem) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!form.name) return setFormErr('El nombre es obligatorio');
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price < 0) return setFormErr('Introduce un precio válido');
    if (isNaN(stock) || stock < 0) return setFormErr('Introduce un stock válido');
    createMut.mutate({
      name: form.name,
      category: form.category || undefined,
      price,
      stock,
      active: true,
    });
  };

  const lowStock = items.filter(i => i.stock <= 5 && i.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Inventario</h1>
          <p className="text-sm text-muted-foreground">{items.length} productos</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir producto
        </button>
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>{lowStock.length} producto(s)</strong> con stock bajo (≤ 5 unidades):{' '}
            {lowStock.map(i => i.name).join(', ')}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Buscar producto o categoría..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <Package className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'Añade el primer producto'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Nombre','Categoría','Precio','Stock','Estado',''].map(h => (
                    <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${h ? 'text-left' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: InventoryItem) => (
                  <tr
                    key={item.id}
                    className={[
                      'border-b border-border last:border-0 transition-colors',
                      item.stock <= 5 ? 'bg-amber-50/50 dark:bg-amber-950/10' : 'hover:bg-muted/30',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.category ? (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {item.category}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{item.price.toFixed(2)} €</td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className={item.stock <= 5 ? 'text-amber-600 font-semibold' : ''}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                        {item.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { if (confirm(`¿Eliminar "${item.name}"?`)) deleteMut.mutate(item.id); }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Añadir producto</h2>
              <button onClick={() => { setOpen(false); setForm(emptyForm); setFormErr(''); }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Proteína whey, Creatina..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Categoría</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Suplemento, Equipamiento..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Precio (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="29.99"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="50"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {formErr && <p className="text-xs text-destructive">{formErr}</p>}

              <button
                type="submit"
                disabled={createMut.isPending}
                className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {createMut.isPending ? 'Añadiendo...' : 'Añadir producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
