import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoutines, createRoutine, deleteRoutine, assignRoutine } from '../../api/routines.api.ts';
import { getClients } from '../../api/users.api.ts';
import { Plus, Trash2, UserPlus, Loader2, X, Dumbbell, Pencil } from 'lucide-react';
import type { Routine, User } from '../../types';

export default function RoutinesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [assignId,   setAssignId]   = useState<number | null>(null);
  const [newName,    setNewName]    = useState('');
  const [newDesc,    setNewDesc]    = useState('');
  const [clientId,   setClientId]   = useState('');

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines'], queryFn: getRoutines,
  });
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'], queryFn: getClients,
  });

  const createMut = useMutation({
    mutationFn: createRoutine,
    onSuccess: (created: Routine) => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      setOpenCreate(false); setNewName(''); setNewDesc('');
      // navega directamente al detalle de la rutina recién creada
      navigate(`/trainer/routines/${created.id}`);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  });

  const assignMut = useMutation({
    mutationFn: assignRoutine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setAssignId(null); setClientId('');
    },
  });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-energy">Entrenamiento</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">Rutinas</h1>
            <p className="text-sm text-muted-foreground">{routines.length} rutinas creadas</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva rutina
          </button>
        </div>
      </section>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : routines.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <Dumbbell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="mb-2 text-sm text-muted-foreground">Crea tu primera rutina</p>
          <button onClick={() => setOpenCreate(true)} className="font-label text-xs text-primary hover:underline">
            Crear rutina →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(routines as Routine[]).map((r) => {
            const rt = r as Routine & { routine_exercises?: { day_of_week?: number }[]; exercises?: unknown[] };
            const exCount = (rt.routine_exercises ?? rt.exercises ?? []).length;
            // ejercicios con día asignado
            const daysUsed = new Set(
              (rt.routine_exercises ?? [])
                .filter((re) => re.day_of_week !== null && re.day_of_week !== undefined)
                .map((re) => re.day_of_week as number)
            );

            return (
              <article
                key={r.id}
                className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{r.name}</p>
                    {r.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { if (confirm('¿Eliminar rutina?')) deleteMut.mutate(r.id); }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* mini vista días */}
                {daysUsed.size > 0 && (
                  <div className="mb-3 flex gap-1">
                    {[0,1,2,3,4,5,6].map((d) => (
                      <div
                        key={d}
                        className={[
                          'flex h-5 w-7 items-center justify-center rounded font-label text-[9px]',
                          daysUsed.has(d)
                            ? 'bg-energy/15 text-energy'
                            : 'bg-secondary text-muted-foreground/40',
                        ].join(' ')}
                      >
                        {['L','M','X','J','V','S','D'][d]}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto space-y-2 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-energy/15 bg-energy/10 px-2.5 py-1 font-label text-[10px] text-energy">
                    <Dumbbell className="h-3 w-3" />
                    {exCount} ejercicios · {daysUsed.size} días
                  </span>

                  {/* NAVEGA a la página de detalle */}
                  <button
                    onClick={() => navigate(`/trainer/routines/${r.id}`)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-energy/20 bg-energy/8 py-1.5 font-label text-[11px] text-energy transition-colors hover:bg-energy/15"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Gestionar ejercicios
                  </button>

                  <button
                    onClick={() => setAssignId(r.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 font-label text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Asignar a cliente
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ══ MODAL: Crear rutina ══════════════════════════════════════════════ */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-energy">Nueva rutina</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Crear rutina</h2>
              </div>
              <button onClick={() => setOpenCreate(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newName) createMut.mutate({ name: newName, description: newDesc });
              }}
              className="space-y-4"
            >
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Nombre <span className="text-primary">*</span>
                </label>
                <input
                  value={newName} required
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Fuerza tren superior"
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="font-label text-[11px] text-muted-foreground">Descripción</label>
                <textarea
                  value={newDesc} rows={3}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Objetivos, nivel, notas…"
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <p className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 font-label text-[10px] text-muted-foreground">
                <Pencil className="h-3 w-3 shrink-0" />
                Tras crear la rutina irás directamente a gestionar sus ejercicios por día.
              </p>
              <button
                type="submit"
                disabled={createMut.isPending || !newName}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {createMut.isPending ? 'Creando…' : 'Crear y añadir ejercicios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: Asignar a cliente ═════════════════════════════════════════ */}
      {assignId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-energy">Asignación</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Asignar rutina</h2>
              </div>
              <button onClick={() => { setAssignId(null); setClientId(''); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Cliente <span className="text-primary">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Selecciona un cliente…</option>
                  {(clients as User[]).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {assignMut.isError && (
                <p className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 font-label text-[11px] text-primary">
                  Error al asignar. Comprueba la consola.
                </p>
              )}
              {assignMut.isSuccess && (
                <p className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 font-label text-[11px] text-green-400">
                  Rutina asignada correctamente.
                </p>
              )}

              <button
                onClick={() => assignMut.mutate({ routine_id: assignId!, client_id: Number(clientId) })}
                disabled={!clientId || assignMut.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {assignMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {assignMut.isPending ? 'Asignando…' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}