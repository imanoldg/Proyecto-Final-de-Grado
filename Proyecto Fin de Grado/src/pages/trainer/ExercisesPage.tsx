import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExercises, createExercise, deleteExercise } from '../../api/exercises.api.ts';
import { Plus, Trash2, Search, Loader2, X, Dumbbell } from 'lucide-react';
import type { Exercise } from '../../types';

export default function ExercisesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  type Form = { name: string; muscle_group: string; description: string; video_url: string };
  const [form, setForm] = useState<Form>({ name: '', muscle_group: '', description: '', video_url: '' });

  const { data: exercises = [], isLoading } = useQuery({ queryKey: ['exercises'], queryFn: getExercises });
  const createMut = useMutation({ mutationFn: createExercise, onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); setOpen(false); setForm({ name: '', muscle_group: '', description: '', video_url: '' }); } });
  const deleteMut = useMutation({ mutationFn: deleteExercise, onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }) });

  const filtered = exercises.filter((e: Exercise) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscle_group ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Biblioteca de ejercicios</h1>
          <p className="text-sm text-muted-foreground">{exercises.length} ejercicios</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />Nuevo ejercicio
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background" placeholder="Buscar ejercicio o grupo muscular..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Dumbbell className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Añade el primer ejercicio</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Grupo muscular</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Descripción</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex: Exercise) => (
                <tr key={ex.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{ex.name}</td>
                  <td className="px-4 py-3">
                    {ex.muscle_group && <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{ex.muscle_group}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{ex.description ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(ex.id); }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Nuevo ejercicio</h2><button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button></div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
              {([
                { key: 'name', label: 'Nombre *' },
                { key: 'muscle_group', label: 'Grupo muscular' },
                { key: 'description', label: 'Descripción' },
                { key: 'video_url', label: 'URL de vídeo' },
              ] as Array<{ key: keyof Form; label: string }>).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value } as Form))}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              ))}
              <button type="submit" disabled={!form.name || createMut.isPending} className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {createMut.isPending ? 'Añadiendo...' : 'Añadir ejercicio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}