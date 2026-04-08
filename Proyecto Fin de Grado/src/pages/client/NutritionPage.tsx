import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFood, getNutritionLogs, addNutritionLog, deleteNutritionLog,
} from '../../api/nutrition.api.ts';
import { Plus, Trash2, Search, Loader2, X, Flame, Beef, Wheat, Droplets } from 'lucide-react';

type FoodResult = {
  fdcId: number; name: string;
  calories: number; protein: number; carbs: number; fat: number;
};
type NutritionLog = {
  id: number; food_name: string; grams: number;
  calories: number; protein: number; carbs: number; fat: number; date: string;
};
type LogForm = {
  food_name: string; grams: string;
  calories_100g: number; protein_100g: number; carbs_100g: number; fat_100g: number;
  manually_entered: boolean;
};

const EMPTY_FORM: LogForm = {
  food_name: '', grams: '100',
  calories_100g: 0, protein_100g: 0, carbs_100g: 0, fat_100g: 0,
  manually_entered: false,
};

// Calcula macros según gramos
const calc = (per100: number, grams: number) =>
  Math.round((per100 * grams) / 100 * 10) / 10;

// Hook de debounce
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function NutritionPage() {
  const qc = useQueryClient();
  const [open,        setOpen]        = useState(false);
  const [form,        setForm]        = useState<LogForm>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Cierra resultados al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: logs = [], isLoading } = useQuery<NutritionLog[]>({
    queryKey: ['nutrition-today'],
    queryFn: getNutritionLogs,
  });

  const { data: searchResults = [], isFetching: searching } = useQuery<FoodResult[]>({
    queryKey: ['food-search', debouncedSearch],
    queryFn: () => searchFood(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 60_000,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const addMut = useMutation({
    mutationFn: addNutritionLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrition-today'] });
      setOpen(false);
      setForm(EMPTY_FORM);
      setSearchQuery('');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNutritionLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition-today'] }),
  });

  // ── Seleccionar alimento desde resultados USDA ────────────────────────────────
  const selectFood = (food: FoodResult) => {
    setForm({
      food_name:     food.name,
      grams:         '100',
      calories_100g: food.calories,
      protein_100g:  food.protein,
      carbs_100g:    food.carbs,
      fat_100g:      food.fat,
      manually_entered: false,
    });
    setSearchQuery(food.name);
    setShowResults(false);
  };

  const grams = Number(form.grams) || 0;
  const macros = {
    calories: calc(form.calories_100g, grams),
    protein:  calc(form.protein_100g,  grams),
    carbs:    calc(form.carbs_100g,    grams),
    fat:      calc(form.fat_100g,      grams),
  };

  // ── Totales del día ───────────────────────────────────────────────────────────
  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein:  acc.protein  + l.protein,
      carbs:    acc.carbs    + l.carbs,
      fat:      acc.fat      + l.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const MACRO_STATS = [
    { key: 'calories', label: 'Calorías', unit: 'kcal', icon: Flame,    color: 'text-energy',       bg: 'bg-energy/10 border-energy/15'           },
    { key: 'protein',  label: 'Proteína', unit: 'g',    icon: Beef,     color: 'text-achievement',  bg: 'bg-achievement/10 border-achievement/15'  },
    { key: 'carbs',    label: 'Carbohidratos', unit: 'g', icon: Wheat,  color: 'text-primary',      bg: 'bg-primary/10 border-primary/15'          },
    { key: 'fat',      label: 'Grasa',    unit: 'g',    icon: Droplets, color: 'text-muted-foreground', bg: 'bg-secondary border-border'           },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.food_name || !grams) return;
    addMut.mutate({
      food_name: form.food_name,
      grams,
      ...macros,
    });
  };

  const openModal = () => { setForm(EMPTY_FORM); setSearchQuery(''); setOpen(true); };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-energy">Nutrición</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">
              Registro de hoy
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir alimento
          </button>
        </div>
      </section>

      {/* ── Totales del día ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {MACRO_STATS.map(({ key, label, unit, icon: Icon, color, bg }) => (
          <article key={key} className={`rounded-lg border ${bg} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-label text-[11px] text-muted-foreground">{label}</p>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`font-display text-3xl leading-none tabular-nums ${color}`}>
              {Math.round(totals[key as keyof typeof totals])}
              <span className="ml-1 font-label text-xs text-muted-foreground">{unit}</span>
            </p>
          </article>
        ))}
      </div>

      {/* ── Lista de alimentos ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <Flame className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="mb-2 text-sm text-muted-foreground">No has registrado ningún alimento hoy</p>
          <button onClick={openModal} className="font-label text-xs text-primary hover:underline">
            Añadir el primer alimento →
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="font-label text-[11px] text-muted-foreground">
              {logs.length} alimento{logs.length !== 1 ? 's' : ''} registrado{logs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {logs.map((log) => (
              <li key={log.id} className="group flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground capitalize-first">
                    {log.food_name}
                  </p>
                  <p className="font-label text-[10px] text-muted-foreground">
                    {log.grams}g
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 font-label text-[11px] tabular-nums">
                  <span className="text-energy">{log.calories} kcal</span>
                  <span className="hidden text-achievement sm:inline">P {log.protein}g</span>
                  <span className="hidden text-primary sm:inline">C {log.carbs}g</span>
                  <span className="hidden text-muted-foreground sm:inline">G {log.fat}g</span>
                </div>
                <button
                  onClick={() => deleteMut.mutate(log.id)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ══ MODAL: añadir alimento ══════════════════════════════════════════════ */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">

            {/* Cabecera */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-energy">Nutrición</p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">Añadir alimento</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Búsqueda con autocompletar ── */}
              <div ref={searchRef} className="relative">
                <label className="font-label text-[11px] text-muted-foreground">
                  Buscar alimento <span className="text-primary">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setForm((f) => ({ ...f, food_name: e.target.value, manually_entered: true }));
                      setShowResults(true);
                    }}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    placeholder="Ej: pechuga de pollo, arroz, huevo…"
                    className="w-full rounded-md border border-border bg-secondary py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Resultados */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
                    <p className="border-b border-border px-3 py-1.5 font-label text-[10px] text-muted-foreground">
                      Datos de USDA FoodData Central
                    </p>
                    <ul className="max-h-52 overflow-y-auto divide-y divide-border">
                      {searchResults.map((food) => (
                        <li key={food.fdcId}>
                          <button
                            type="button"
                            onClick={() => selectFood(food)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-energy/8"
                          >
                            <p className="min-w-0 truncate text-sm font-medium text-foreground capitalize">
                              {food.name.toLowerCase()}
                            </p>
                            <span className="shrink-0 font-label text-[10px] text-energy tabular-nums">
                              {food.calories} kcal/100g
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── Gramos ── */}
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Cantidad (gramos) <span className="text-primary">*</span>
                </label>
                <input
                  type="number" min="1" required
                  value={form.grams}
                  onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* ── Preview macros calculados ── */}
              {form.food_name && grams > 0 && !form.manually_entered && (
                <div className="grid grid-cols-4 gap-2 rounded-md border border-border bg-secondary p-3">
                  {[
                    { label: 'Kcal',    value: macros.calories, color: 'text-energy'           },
                    { label: 'Proteína', value: macros.protein,  color: 'text-achievement'       },
                    { label: 'Carbs',   value: macros.carbs,    color: 'text-primary'           },
                    { label: 'Grasa',   value: macros.fat,      color: 'text-muted-foreground'  },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`font-display text-xl leading-none tabular-nums ${color}`}>{value}</p>
                      <p className="mt-0.5 font-label text-[9px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Macros manuales (si el usuario escribe sin seleccionar) ── */}
              {form.manually_entered && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calories_100g', label: 'Kcal / 100g' },
                    { key: 'protein_100g',  label: 'Proteína / 100g' },
                    { key: 'carbs_100g',    label: 'Carbohidratos / 100g' },
                    { key: 'fat_100g',      label: 'Grasa / 100g' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="font-label text-[11px] text-muted-foreground">{label}</label>
                      <input
                        type="number" min="0" step="0.1"
                        value={(form as any)[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                        className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={addMut.isPending || !form.food_name || !form.grams}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {addMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {addMut.isPending ? 'Registrando…' : 'Registrar alimento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}