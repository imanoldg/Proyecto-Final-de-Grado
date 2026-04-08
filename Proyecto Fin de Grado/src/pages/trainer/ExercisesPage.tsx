import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExercises, createExercise, updateExercise, deleteExercise } from '../../api/exercises.api.ts';
import { Plus, Trash2, Pencil, Search, Loader2, X, Dumbbell } from 'lucide-react';
import type { Exercise } from '../../types';

type Form = { name: string; muscle_group: string; description: string; video_url: string };

const MUSCLE_GROUPS = [
  'Pectoral', 'Trapecio', 'Dorsales', 'Hombro',
  'Bíceps',   'Tríceps',  'Antebrazo', 'Abdominales',
  'Cuádriceps', 'Femoral', 'Glúteo', 'Gemelo',
];

const EMPTY_FORM: Form = { name: '', muscle_group: '', description: '', video_url: '' };

// 'create' | number (id del ejercicio que se edita)
type ModalMode = 'create' | number;

export default function ExercisesPage() {
  const qc = useQueryClient();
  const [search,      setSearch]      = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [modal,       setModal]       = useState<ModalMode | null>(null);
  const [form,        setForm]        = useState<Form>(EMPTY_FORM);

  const isEditing = modal !== null && modal !== 'create';

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (ex: Exercise) => {
    setForm({
      name:         ex.name,
      muscle_group: ex.muscle_group ?? "",
      description:  ex.description  ?? '',
      video_url:    ex.video_url    ?? '',
    });
    setModal(ex.id);
  };
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: getExercises,
  });

  const createMut = useMutation({
    mutationFn: createExercise,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Form> }) => updateExercise(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMut.mutate({ id: modal as number, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const isPending = isEditing ? updateMut.isPending : createMut.isPending;

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup  = filterGroup ? e.muscle_group === filterGroup : true;
    return matchSearch && matchGroup;
  });

  const groups = Array.from(new Set(exercises.map((e) => e.muscle_group))).sort();

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="rounded-lg border border-border bg-card px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <span className="font-label text-xs text-energy">Biblioteca</span>
            <h1 className="font-display text-4xl leading-none tracking-[0.04em] md:text-5xl">Ejercicios</h1>
            <p className="text-sm text-muted-foreground">{exercises.length} ejercicios registrados</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo ejercicio
          </button>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio…"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Todos los grupos</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-14 text-center">
          <Dumbbell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search || filterGroup ? 'Sin resultados' : 'Añade el primer ejercicio'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ex) => (
            <article
              key={ex.id}
              className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
            >
              {/* Muscle group badge */}
              <span className="mb-3 inline-flex w-fit items-center rounded-full border border-energy/15 bg-energy/10 px-2.5 py-1 font-label text-[10px] text-energy">
                {ex.muscle_group}
              </span>

              <p className="font-medium text-foreground leading-snug">{ex.name}</p>

              {ex.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ex.description}</p>
              )}

              {ex.video_url && (
                <a
                  href={ex.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 font-label text-[10px] text-primary underline-offset-2 hover:underline"
                >
                  Ver vídeo →
                </a>
              )}

              {/* ── Acciones: aparecen al hacer hover ── */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(ex)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  title="Editar ejercicio"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar ejercicio?')) deleteMut.mutate(ex.id); }}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  title="Eliminar ejercicio"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Modal crear / editar (mismo formulario) ── */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-label text-[11px] text-energy">
                  {isEditing ? 'Editar ejercicio' : 'Nuevo ejercicio'}
                </p>
                <h2 className="font-display text-2xl leading-none tracking-[0.03em]">
                  {isEditing ? 'Editar ejercicio' : 'Crear ejercicio'}
                </h2>
              </div>
              <button onClick={closeModal} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Nombre <span className="text-primary">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="font-label text-[11px] text-muted-foreground">
                  Grupo muscular <span className="text-primary">*</span>
                </label>
                <select
                  required
                  value={form.muscle_group}
                  onChange={(e) => setForm((f) => ({ ...f, muscle_group: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Seleccionar…</option>
                  {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="font-label text-[11px] text-muted-foreground">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="font-label text-[11px] text-muted-foreground">URL vídeo</label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://youtube.com/…"
                  className="mt-1.5 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-label text-xs text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isPending
                  ? (isEditing ? 'Guardando…' : 'Creando…')
                  : (isEditing ? 'Guardar cambios' : 'Crear ejercicio')
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
