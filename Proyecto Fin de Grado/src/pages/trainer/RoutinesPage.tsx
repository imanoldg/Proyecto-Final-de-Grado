import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoutines, createRoutine, deleteRoutine, assignRoutine } from '../../api/routines.api.ts';
import { getClients } from '../../api/users.api.ts';
import { Plus, Trash2, UserPlus, Loader2, X, Dumbbell } from 'lucide-react';
import type { Routine } from '../../types';

export default function RoutinesPage() {
  const qc = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [assignId, setAssignId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [clientId, setClientId] = useState('');

  const { data: routines = [], isLoading } = useQuery({ queryKey: ['routines'], queryFn: getRoutines });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: getClients });
  const createMut = useMutation({ mutationFn: createRoutine, onSuccess: () => { qc.invalidateQueries({ queryKey: ['routines'] }); setOpenCreate(false); setNewName(''); setNewDesc(''); } });
  const deleteMut = useMutation({ mutationFn: deleteRoutine, onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }) });
  const assignMut = useMutation({ mutationFn: assignRoutine, onSuccess: () => { setAssignId(null); setClientId(''); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rutinas</h1>
          <p className="text-sm text-muted-foreground">{routines.length} rutinas creadas</p>
        </div>
        <button onClick={() => setOpenCreate(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />Nueva rutina
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : routines.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 gap-3">
          <Dumbbell className="w-9 h-9 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Crea tu primera rutina</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((r: Routine) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sm">{r.name}</h3>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                </div>
                <button onClick={() => { if (confirm('¿Eliminar rutina?')) deleteMut.mutate(r.id); }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full w-fit">{r.exercises?.length ?? 0} ejercicios</span>
              <button onClick={() => setAssignId(r.id)} className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors mt-auto">
                <UserPlus className="w-3.5 h-3.5" />Asignar a cliente
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Crear rutina</h2><button onClick={() => setOpenCreate(false)}><X className="w-4 h-4" /></button></div>
            <form onSubmit={e => { e.preventDefault(); if (newName) createMut.mutate({ name: newName, description: newDesc }); }} className="space-y-3">
              <div><label className="text-sm font-medium">Nombre *</label><input value={newName} onChange={e => setNewName(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-sm font-medium">Descripción</label><input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <button type="submit" disabled={!newName || createMut.isPending} className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">Crear</button>
            </form>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Asignar rutina</h2><button onClick={() => setAssignId(null)}><X className="w-4 h-4" /></button></div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
                  <option value="">Selecciona un cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={() => assignMut.mutate({ routine_id: assignId!, client_id: Number(clientId) })} disabled={!clientId || assignMut.isPending} className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {assignMut.isPending ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}