import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNutritionLogs,
  createNutritionLog,
  deleteNutritionLog,
} from '../../api/nutrition.api';
import {
  Plus, Trash2, Loader2, UtensilsCrossed, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { NutritionLog } from '../../types';

const MEALS = [
  { value: 'desayuno',  label: 'Desayuno'  },
  { value: 'almuerzo',  label: 'Almuerzo'  },
  { value: 'comida',    label: 'Comida'    },
  { value: 'merienda',  label: 'Merienda'  },
  { value: 'cena',      label: 'Cena'      },
  { value: 'snack',     label: 'Snack'     },
];

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

interface FormState {
  meal: string;
  food: string;
  calories: string;
  notes: string;
}
const emptyForm: FormState = { meal: '', food: '', calories: '', notes: '' };

export default function NutritionPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date());
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState<FormState>(emptyForm);
  const [formErr, setFormErr] = useState('');

  const dateStr = formatDate(date);
  const isToday = dateStr === formatDate(new Date());

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['nutrition', dateStr],
    queryFn: () => getNutritionLogs(dateStr),
  });

  const createMut = useMutation({
    mutationFn: createNutritionLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrition', dateStr] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNutritionLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition', dateStr] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!form.meal) return setFormErr('Selecciona la comida del día');
    if (!form.food.trim()) return setFormErr('El alimento es obligatorio');
    const calories = form.calories ? parseInt(form.calories, 10) : undefined;
    createMut.mutate({
      date: dateStr,
      meal: form.meal,
      food: form.food.trim(),
      calories,
      notes: form.notes || undefined,
    });
  };

  const totalCal = logs.reduce((s, l) => s + (l.calories ?? 0), 0);

  // Group by meal order
  const grouped = MEALS.map(m => ({
    ...m,
    items: logs.filter(l => l.meal === m.value),
  })).filter(m => m.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Alimentación</h1>
          <p className="text-sm text-muted-foreground">
            {Math.round(totalCal)} kcal registradas
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir alimento
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDate(d => addDays(d, -1))}
          className="p-1.5 rounded-md border border-border hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <input
          type="date"
          value={dateStr}
          onChange={e => setDate(new Date(e.target.value + 'T12:00:00'))}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={() => setDate(d => addDays(d, 1))}
          disabled={isToday}
          className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {!isToday && (
          <button
            onClick={() => setDate(new Date())}
            className="px-2 py-1.5 text-xs text-primary hover:underline"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Calorie summary bar */}
      {totalCal > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total del día</span>
            <span className="font-semibold tabular-nums">{Math.round(totalCal)} kcal</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {grouped.map(g => {
              const cal = g.items.reduce((s, i) => s + (i.calories ?? 0), 0);
              return cal > 0 ? (
                <div key={g.value} className="text-center">
                  <p className="text-xs text-muted-foreground">{g.label}</p>
                  <p className="text-sm font-medium tabular-nums">{Math.round(cal)} kcal</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Logs */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 gap-3">
          <UtensilsCrossed className="w-9 h-9 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Sin registros para este día</p>
          <button
            onClick={() => setOpen(true)}
            className="text-sm text-primary hover:underline"
          >
            Añadir primer alimento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.value} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-medium text-sm">{group.label}</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(group.items.reduce((s, i) => s + (i.calories ?? 0), 0))} kcal
                </span>
              </div>
              <ul>
                {group.items.map((log: NutritionLog) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{log.food}</p>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground truncate">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {log.calories != null && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {log.calories} kcal
                        </span>
                      )}
                      <button
                        onClick={() => deleteMut.mutate(log.id)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Registrar alimento</h2>
              <button onClick={() => { setOpen(false); setForm(emptyForm); setFormErr(''); }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Comida del día *</label>
                <select
                  value={form.meal}
                  onChange={e => setForm(f => ({ ...f, meal: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecciona...</option>
                  {MEALS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Alimento *</label>
                <input
                  value={form.food}
                  onChange={e => setForm(f => ({ ...f, food: e.target.value }))}
                  placeholder="Avena con leche, Pechuga a la plancha..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Calorías (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.calories}
                    onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                    placeholder="350"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Notas</label>
                  <input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="200g, con aceite..."
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
                {createMut.isPending ? 'Registrando...' : 'Registrar alimento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
