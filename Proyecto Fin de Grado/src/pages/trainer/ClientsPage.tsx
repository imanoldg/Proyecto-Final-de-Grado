import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, deleteUser } from '../../api/users.api.ts';
import { Search, Plus, Trash2, Loader2, X, Users } from 'lucide-react';

type Client = { id: number; name: string; email: string };
type Form   = { name: string; email: string; password: string };
const EMPTY: Form = { name: '', email: '', password: '' };

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(false);
  const [form,   setForm]   = useState<Form>(EMPTY);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const createMut = useMutation({
    mutationFn: createClient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setOpen(false); setForm(EMPTY); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-primary">Gestión</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground">
              {clients.length} cliente{clients.length !== 1 && 's'} registrado{clients.length !== 1 && 's'}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo cliente
          </button>
        </div>
      </section>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* ── Table / states ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? 'Sin resultados para esa búsqueda' : 'Añade el primer cliente'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-label text-[11px] text-muted-foreground">Nombre</th>
                <th className="hidden px-4 py-3 text-left font-label text-[11px] text-muted-foreground sm:table-cell">Email</th>
                <th className="px-4 py-3 text-right font-label text-[11px] text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{c.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm('¿Eliminar cliente?')) deleteMut.mutate(c.id); }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal crear ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-primary">Nuevo registro</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Crear cliente</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ ...form, role: 'client', active: true }); }} className="space-y-4">
              {(['name', 'email', 'password'] as const).map((key) => (
                <div key={key}>
                  <label className="font-label text-[11px] text-muted-foreground">
                    {key === 'name' ? 'Nombre' : key === 'email' ? 'Email' : 'Contraseña'}{' '}
                    <span className="text-primary">*</span>
                  </label>
                  <input
                    type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                    required
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={createMut.isPending}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {createMut.isPending ? 'Creando…' : 'Crear cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
