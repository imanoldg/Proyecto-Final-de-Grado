import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoutineById,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
} from '../../api/routines.api';
import { getExercises } from '../../api/exercises.api';
import {
  ArrowLeft, Plus, Trash2, Search, Loader2, Dumbbell, Info,
} from 'lucide-react';

// ─── tipos ────────────────────────────────────────────────────────────────────
type Exercise       = { id: number; name: string; muscle_group: string };
type RoutineExercise = {
  id: number; exercise_id: number; sets: number; reps: number;
  day_of_week: number | null; exercise?: Exercise;
};
type Routine = {
  id: number; name: string; description?: string;
  routine_exercises?: RoutineExercise[];
};

// ─── constantes ───────────────────────────────────────────────────────────────
const DAYS = [
  { index: 0, short: 'Lun', long: 'Lunes'     },
  { index: 1, short: 'Mar', long: 'Martes'    },
  { index: 2, short: 'Mié', long: 'Miércoles' },
  { index: 3, short: 'Jue', long: 'Jueves'    },
  { index: 4, short: 'Vie', long: 'Viernes'   },
  { index: 5, short: 'Sáb', long: 'Sábado'    },
  { index: 6, short: 'Dom', long: 'Domingo'   },
];

const EMPTY_FORM = { sets: '3', reps: '10' };

// ─── componente ───────────────────────────────────────────────────────────────
export default function RoutineDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const [activeDay, setActiveDay] = useState(0);
  const [search,    setSearch]    = useState('');
  const [form,      setForm]      = useState(EMPTY_FORM);

  // queries
  const { data: routine, isLoading: loadingRoutine } = useQuery<Routine>({
    queryKey: ['routine', id],
    queryFn:  () => getRoutineById(Number(id)),
    enabled:  !!id,
  });

  const { data: allExercises = [], isLoading: loadingEx } = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn:  getExercises,
  });

  // mutations
  const addMut = useMutation({
    mutationFn: addExerciseToRoutine,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['routine', id] });
      qc.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  const removeMut = useMutation({
    mutationFn: removeExerciseFromRoutine,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['routine', id] });
      qc.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  // ejercicios del día activo
  const dayExercises: RoutineExercise[] =
    (routine?.routine_exercises ?? []).filter(
      (re) => re.day_of_week === activeDay,
    );

  // ejercicios aún no usados este día (para el panel de añadir)
  const usedIds = new Set(dayExercises.map((re) => re.exercise_id));
  const available = allExercises.filter(
    (e) =>
      !usedIds.has(e.id) &&
      (search === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscle_group.toLowerCase().includes(search.toLowerCase())),
  );

  // resumen por día (cuántos ejercicios tiene cada uno)
  const countByDay = (idx: number) =>
    (routine?.routine_exercises ?? []).filter((re) => re.day_of_week === idx).length;

  if (loadingRoutine) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Rutina no encontrada</p>
        <button onClick={() => navigate(-1)} className="font-label text-xs text-primary hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">

        {/* back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 font-label text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a rutinas
        </button>

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-energy">Gestión de rutina</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              {routine.name}
            </h1>
            {routine.description && (
              <p className="max-w-prose text-sm text-muted-foreground">{routine.description}</p>
            )}
          </div>

          {/* resumen total */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-energy/15 bg-energy/8 px-3 py-2">
            <Dumbbell className="h-3.5 w-3.5 text-energy" />
            <span className="font-label text-[11px] text-energy">
              {routine.routine_exercises?.length ?? 0} ejercicios en total
            </span>
          </div>
        </div>

        {/* aviso day_of_week */}
        <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-secondary px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="font-label text-[10px] text-muted-foreground leading-relaxed">
            Asigna ejercicios a cada día de la semana. Un ejercicio puede aparecer en varios días.
            Los días sin ejercicios son días de descanso.
          </p>
        </div>
      </section>

      {/* ── Tabs días ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1.5 rounded-lg border border-border bg-card p-1.5">
          {DAYS.map((d) => {
            const count   = countByDay(d.index);
            const isActive = activeDay === d.index;
            return (
              <button
                key={d.index}
                onClick={() => { setActiveDay(d.index); setSearch(''); setForm(EMPTY_FORM); }}
                className={[
                  'relative flex flex-col items-center gap-0.5 rounded-md px-4 py-2.5 transition-colors',
                  isActive
                    ? 'bg-energy/10 text-energy'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                ].join(' ')}
              >
                <span className="font-display text-lg leading-none tracking-[0.03em]">{d.short}</span>
                <span className={[
                  'font-label text-[10px]',
                  isActive ? 'text-energy' : 'text-muted-foreground',
                ].join(' ')}>
                  {count > 0 ? `${count} ej.` : 'Descanso'}
                </span>
                {count > 0 && (
                  <span className={[
                    'absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full font-label text-[9px]',
                    isActive
                      ? 'bg-energy text-background'
                      : 'bg-energy/20 text-energy',
                  ].join(' ')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contenido del día ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* ─ Columna izquierda: ejercicios del día ─ */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label text-[11px] text-energy">
                {DAYS[activeDay].long}
              </span>
              <h2 className="font-display text-2xl leading-none tracking-[0.03em]">
                Ejercicios del día
              </h2>
            </div>
            {dayExercises.length > 0 && (
              <span className="rounded-full border border-energy/15 bg-energy/8 px-2.5 py-1 font-label text-[10px] text-energy">
                {dayExercises.length} ejercicios
              </span>
            )}
          </div>

          {dayExercises.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center">
              <Dumbbell className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                Día de descanso
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Añade ejercicios desde el panel de la derecha
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {dayExercises.map((re, i) => (
                <li
                  key={re.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary"
                >
                  {/* número orden */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-energy/10 font-label text-[10px] text-energy">
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {re.exercise?.name ?? `Ejercicio #${re.exercise_id}`}
                    </p>
                    <p className="font-label text-[10px] text-muted-foreground">
                      {re.exercise?.muscle_group}
                    </p>
                  </div>

                  {/* series × reps */}
                  <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 font-label text-[11px] tabular-nums text-foreground">
                    {re.sets} × {re.reps}
                  </span>

                  <button
                    onClick={() =>
                      removeMut.mutate({
                        routine_id: routine.id,
                        routine_exercise_id: re.id,
                      })
                    }
                    disabled={removeMut.isPending}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ─ Columna derecha: añadir ejercicio ─ */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="font-label text-[11px] text-achievement">Biblioteca</span>
            <h2 className="font-display text-2xl leading-none tracking-[0.03em]">
              Añadir ejercicio
            </h2>
          </div>

          {/* Series / Reps */}
          <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex-1">
              <label className="font-label text-[11px] text-muted-foreground">Series</label>
              <input
                type="number" min="1" value={form.sets}
                onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex-1">
              <label className="font-label text-[11px] text-muted-foreground">Repeticiones</label>
              <input
                type="number" min="1" value={form.reps}
                onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ejercicio para ${DAYS[activeDay].long}…`}
              className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Lista ejercicios disponibles */}
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border bg-card">
            {loadingEx ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : available.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {search
                    ? 'Sin resultados'
                    : 'Todos los ejercicios ya están en este día'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {available.map((ex) => (
                  <li key={ex.id}>
                    <button
                      disabled={addMut.isPending}
                      onClick={() =>
                        addMut.mutate({
                          routine_id:  routine.id,
                          exercise_id: ex.id,
                          sets:        Number(form.sets),
                          reps:        Number(form.reps),
                          day_of_week: activeDay,
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-energy/8 disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{ex.name}</p>
                        <p className="font-label text-[10px] text-muted-foreground">{ex.muscle_group}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-label text-[10px] text-muted-foreground tabular-nums">
                          {form.sets}×{form.reps}
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-energy/10 text-energy">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
