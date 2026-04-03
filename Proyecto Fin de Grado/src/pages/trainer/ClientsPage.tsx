import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, deleteUser } from '../../api/users.api.ts';
import { Search, Plus, Trash2, Loader2, X } from 'lucide-react';

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  type Form = { name: string; email: string; password: string };
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  const { data: clients = [], isLoading } = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const createMut = useMutation({ mutationFn: createClient, onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setOpen(false); setForm({ name: '', email: '', password: '' }); } });
  const deleteMut = useMutation({ mutationFn: deleteUser, onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }) });

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (!form.name || !form.email || !form.password) return setErr('Completa todos los campos');
    createMut.mutate({ ...form, role: 'client', active: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} registrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />Nuevo cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No se encontraron clientes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Nombre','Email','Estado',''].map(h => <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${h ? 'text-left' : ''}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar cliente?')) deleteMut.mutate(c.id); }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <form onSubmit={submit}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Nuevo cliente</h2>
                <button type="button" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
              </div>
              {(['name','email','password'] as const).map(field => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize">{field === 'password' ? 'Contraseña' : field === 'name' ? 'Nombre' : 'Email'}</label>
                  <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              ))}
              {err && <p className="text-xs text-destructive">{err}</p>}
              <button type="submit" disabled={createMut.isPending} className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {createMut.isPending ? 'Creando...' : 'Crear cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}