import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyAssignments } from '../../api/routines.api.ts';
import { Dumbbell, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Routine } from '../../types/index.ts';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function MyRoutinesPage() {
  const { data: routines = [], isLoading } = useQuery<Routine[]>({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments,
  });

  const [expandedRoutine, setExpandedRoutine] = useState<number | null>(null);
  const [activeDay, setActiveDay]             = useState<Record<number, number>>({});

  const toggleRoutine = (id: number) =>
    setExpandedRoutine((prev) => (prev === id ? null : id));

  const getDayForRoutine = (routineId: number) =>
    activeDay[routineId] ?? 0;

  const setDayForRoutine = (routineId: number, day: number) =>
    setActiveDay((prev) => ({ ...prev, [routineId]: day }));

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="space-y-1.5">
          <span className="font-label text-xs text-energy">Entrenamiento</span>
          <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
            Mis rutinas
          </h1>
          <p className="text-sm text-muted-foreground">
            {routines.length} rutina{routines.length !== 1 ? 's' : ''} asignada{routines.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* ── Lista ── */}
      {routines.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <Dumbbell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Tu entrenador aún no te ha asignado ninguna rutina
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((r) => {
            const isOpen  = expandedRoutine === r.id;
            const selDay  = getDayForRoutine(r.id);
            const allRE   = r.routine_exercises ?? [];
            const dayRE   = allRE.filter((re) => re.day_of_week === selDay);

            // días que tienen al menos un ejercicio
            const daysWithEx = new Set(
              allRE
                .filter((re) => re.day_of_week !== null && re.day_of_week !== undefined)
                .map((re) => re.day_of_week as number)
            );

            return (
              <article
                key={r.id}
                className="rounded-lg border border-border bg-card"
              >
                {/* ─ Cabecera de la rutina ─ */}
                <button
                  onClick={() => toggleRoutine(r.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">{r.name}</p>
                      <span className="shrink-0 rounded-full border border-energy/15 bg-energy/10 px-2.5 py-0.5 font-label text-[10px] text-energy">
                        Activa
                      </span>
                    </div>
                    {r.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
                    )}
                    {/* mini barra días */}
                    <div className="flex gap-1 pt-0.5">
                      {[0,1,2,3,4,5,6].map((d) => (
                        <span
                          key={d}
                          className={[
                            'flex h-4 w-5 items-center justify-center rounded font-label text-[9px]',
                            daysWithEx.has(d)
                              ? 'bg-energy/15 text-energy'
                              : 'bg-secondary text-muted-foreground/30',
                          ].join(' ')}
                        >
                          {DAYS[d]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full border border-energy/15 bg-energy/10 px-2.5 py-1 font-label text-[10px] text-energy">
                      {allRE.length} ejercicios · {daysWithEx.size} días
                    </span>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* ─ Detalle expandido ─ */}
                {isOpen && (
                  <div className="border-t border-border px-5 pb-5 pt-4">

                    {/* tabs días */}
                    <div className="mb-4 flex gap-1 overflow-x-auto">
                      {[0,1,2,3,4,5,6].map((d) => {
                        const count   = allRE.filter((re) => re.day_of_week === d).length;
                        const isActive = selDay === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setDayForRoutine(r.id, d)}
                            className={[
                              'flex shrink-0 flex-col items-center gap-0.5 rounded-md px-3 py-2 transition-colors',
                              isActive
                                ? 'bg-energy/10 text-energy'
                                : 'text-muted-foreground hover:bg-secondary',
                            ].join(' ')}
                          >
                            <span className="font-display text-base leading-none">{DAYS[d]}</span>
                            <span className="font-label text-[9px]">
                              {count > 0 ? `${count} ej.` : 'Desc.'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ejercicios del día */}
                    <div>
                      <p className="mb-3 font-label text-[11px] text-energy">
                        {DAYS_FULL[selDay]}
                      </p>
                      {dayRE.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-8 text-center">
                          <p className="text-sm text-muted-foreground">Día de descanso</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {dayRE.map((re, i) => (
                            <li
                              key={re.id}
                              className="flex items-center gap-3 py-2.5"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-energy/10 font-label text-[9px] text-energy">
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {re.exercise?.name ?? `Ejercicio #${re.exercise_id}`}
                                </p>
                                {re.exercise?.muscle_group && (
                                  <p className="font-label text-[10px] text-muted-foreground">
                                    {re.exercise.muscle_group}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 font-label text-[10px] tabular-nums text-foreground">
                                {re.sets} × {re.reps}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
