import { useQuery } from '@tanstack/react-query';
import { getMyAssignments } from '../../api/routines.api.ts';
import { Dumbbell, Loader2 } from 'lucide-react';
import type { Assignment } from '../../types';

export default function MyRoutinesPage() {
  const { data: assignments = [], isLoading } = useQuery({ queryKey: ['my-assignments'], queryFn: getMyAssignments });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Mis rutinas</h1>
        <p className="text-sm text-muted-foreground">{assignments.filter(a => a.active).length} activas</p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 gap-3">
          <Dumbbell className="w-9 h-9 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Tu entrenador aún no te ha asignado ninguna rutina</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a: Assignment) => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold">{a.routine?.name ?? `Rutina #${a.routine_id}`}</h2>
                  {a.routine?.description && <p className="text-sm text-muted-foreground mt-0.5">{a.routine.description}</p>}
                  {a.start_date && <p className="text-xs text-muted-foreground mt-1">Desde {new Date(a.start_date).toLocaleDateString('es-ES')}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{a.active ? 'Activa' : 'Inactiva'}</span>
              </div>

              {a.routine?.exercises && a.routine.exercises.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Ejercicios</p>
                  <div className="space-y-2">
                    {a.routine.exercises.map((re, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{re.exercise?.name ?? `Ejercicio #${re.exercise_id}`}</p>
                            {re.exercise?.muscle_group && <p className="text-xs text-muted-foreground">{re.exercise.muscle_group}</p>}
                          </div>
                        </div>
                        {re.sets && re.reps && <p className="text-sm tabular-nums text-muted-foreground">{re.sets} × {re.reps}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Esta rutina no tiene ejercicios añadidos aún</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}