/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, createTrainer, toggleUserActive, reassignTrainer } from '../../api/admin.api';
import { createClient } from '../../api/users.api';
import type { CreateClientPayload } from '../../types';
import { Search, Plus, UserCheck, UserX, Loader2, X, Users, Dumbbell, RefreshCw } from 'lucide-react';

type Tab  = 'all' | 'trainer' | 'client';
type Form = { name: string; email: string; password: string; role: 'trainer' | 'client'; trainerId?: string };

interface User { id: number; name: string; email: string; role: string; active: boolean; }

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [tab, setTab]     = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState<Form>({ name: '', email: '', password: '', role: 'client' });
  const [err, setErr]     = useState('');

  // Modal reasignación
  const [reassignModal, setReassignModal] = useState<{ open: boolean; client: User | null }>({ open: false, client: null });
  const [selectedTrainer, setSelectedTrainer] = useState('');

  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: getAllUsers });
  const trainers = users.filter((u: User) => u.role === 'trainer');

  const createMut = useMutation({
    mutationFn: (f: Form) => {
      if (f.role === 'trainer') return createTrainer({ name: f.name, email: f.email, password: f.password });
      const payload: CreateClientPayload = { name: f.name, email: f.email, password: f.password, role: 'client' };
      if (f.trainerId) payload.trainer_id = Number(f.trainerId);
      return createClient(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'client' });
      setErr('');
    },
    onError: (e: any) => setErr(e?.response?.data?.message ?? 'Error al crear usuario'),
  });

  const toggleMut = useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const reassignMut = useMutation({
    mutationFn: ({ clientId, trainerId }: { clientId: number; trainerId: number }) =>
      reassignTrainer(clientId, trainerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setReassignModal({ open: false, client: null });
      setSelectedTrainer('');
    },
  });

  const filtered = users
    .filter((u: User) => tab === 'all' ? u.role !== 'admin' : u.role === tab)
    .filter((u: User) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.name || !form.email || !form.password) return setErr('Completa todos los campos');
    if (form.role === 'client' && !form.trainerId)   return setErr('Selecciona un entrenador');
    createMut.mutate(form);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'all',     label: 'Todos',        icon: <Users   className="w-3.5 h-3.5" /> },
    { key: 'trainer', label: 'Entrenadores', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { key: 'client',  label: 'Clientes',     icon: <Users   className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            {users.filter((u: User) => u.role !== 'admin').length} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              tab === t.key ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No se encontraron usuarios</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Nombre', 'Email', 'Rol', 'Estado', ''].map(h => (
                  <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${h ? 'text-left' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: User) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'trainer'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                    }`}>
                      {u.role === 'trainer' ? 'Entrenador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Reasignar entrenador — solo para clientes */}
                      {u.role === 'client' && (
                        <button
                          onClick={() => { setReassignModal({ open: true, client: u }); setSelectedTrainer(''); }}
                          title="Reasignar entrenador"
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {/* Activar / desactivar */}
                      <button
                        onClick={() => toggleMut.mutate(u.id)}
                        disabled={toggleMut.isPending}
                        title={u.active ? 'Desactivar' : 'Activar'}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal: crear usuario ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Nuevo usuario</h2>
              <button onClick={() => { setOpen(false); setErr(''); }}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {/* Selector de rol */}
              <div className="flex gap-2">
                {(['client', 'trainer'] as const).map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                      form.role === r
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {r === 'client' ? 'Cliente' : 'Entrenador'}
                  </button>
                ))}
              </div>

              {(['name', 'email', 'password'] as const).map(field => (
                <div key={field} className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {field === 'password' ? 'Contraseña' : field === 'name' ? 'Nombre' : 'Email'}
                  </label>
                  <input
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}

              {/* Selector de entrenador (solo si es cliente) */}
              {form.role === 'client' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Entrenador asignado</label>
                  <select
                    value={form.trainerId ?? ''}
                    onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecciona un entrenador</option>
                    {trainers.filter((t: User) => t.active).map((t: User) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {err && <p className="text-xs text-destructive">{err}</p>}

              <button
                type="submit"
                disabled={createMut.isPending}
                className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {createMut.isPending ? 'Creando...' : `Crear ${form.role === 'trainer' ? 'entrenador' : 'cliente'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: reasignar entrenador ── */}
      {reassignModal.open && reassignModal.client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Reasignar entrenador</h2>
              <button onClick={() => setReassignModal({ open: false, client: null })}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Cliente: <span className="font-medium text-foreground">{reassignModal.client.name}</span>
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-sm font-medium">Nuevo entrenador</label>
              <select
                value={selectedTrainer}
                onChange={e => setSelectedTrainer(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecciona un entrenador</option>
                {trainers.filter((t: User) => t.active).map((t: User) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button
              disabled={!selectedTrainer || reassignMut.isPending}
              onClick={() => reassignMut.mutate({
                clientId: reassignModal.client!.id,
                trainerId: Number(selectedTrainer),
              })}
              className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {reassignMut.isPending ? 'Guardando...' : 'Confirmar reasignación'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}