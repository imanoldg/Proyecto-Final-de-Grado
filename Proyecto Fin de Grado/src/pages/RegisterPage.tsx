import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { getTrainers } from '../api/users.api';
import { useAuthStore } from '../store/auth.store';
import { Search, Check } from 'lucide-react';

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 30 30" fill="none" aria-label="GymApp">
    <rect width="30" height="30" rx="7" fill="rgb(232, 56, 79)" />
    <path d="M7 15h5M18 15h5M12 10v10M18 10v10"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

type Role = 'client' | 'trainer';
type Trainer = { id: number; name: string; email: string };

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: 'client',
    label: 'Cliente',
    description: 'Consulta rutinas, registra alimentación y reserva citas',
  },
  {
    value: 'trainer',
    label: 'Entrenador personal',
    description: 'Gestiona clientes, crea rutinas y administra el gimnasio',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [role, setRole]               = useState<Role>('client');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  // Buscador de entrenador
  const [trainerSearch, setTrainerSearch]     = useState('');
  const [trainers, setTrainers]               = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [showDropdown, setShowDropdown]       = useState(false);

  const searchTrainers = async (query: string) => {
    setTrainerSearch(query);
    setSelectedTrainer(null);
    if (query.length < 2) { setTrainers([]); setShowDropdown(false); return; }
    setSearchLoading(true);
    try {
      const all: Trainer[] = await getTrainers();
      const filtered = all.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.email.toLowerCase().includes(query.toLowerCase())
      );
      setTrainers(filtered);
      setShowDropdown(true);
    } catch {
      setTrainers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectTrainer = (t: Trainer) => {
    setSelectedTrainer(t);
    setTrainerSearch(t.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 8)  { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (role === 'client' && !selectedTrainer) { setError('Selecciona un entrenador para continuar.'); return; }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === 'client' && selectedTrainer ? { trainer_id: selectedTrainer.id } : {}),
      };
      const res = await register(payload);
      setAuth(res.token, res.user);
      navigate(role === 'trainer' ? '/trainer/dashboard' : '/client/dashboard', { replace: true });
    } catch (err: unknown) {
      let message = 'Error al registrarse. Inténtalo de nuevo.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } } };
        if (e.response?.data?.message) message = e.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="text-xl font-semibold">GymApp</h1>
            <p className="text-sm text-muted-foreground mt-1">Crea tu cuenta</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Selector de rol */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de cuenta</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setRole(r.value); setSelectedTrainer(null); setTrainerSearch(''); }}
                    className={`
                      flex flex-col items-start gap-1 p-3 rounded-lg border text-left
                      transition-colors cursor-pointer
                      ${role === r.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40 text-muted-foreground'
                      }
                    `}
                  >
                    <span className="text-sm font-medium leading-tight">{r.label}</span>
                    <span className="text-xs leading-tight opacity-70">{r.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">Nombre completo</label>
              <input
                id="name" type="text" required autoComplete="name"
                value={name} onChange={e => setName(e.target.value)} placeholder="Ana García"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <input
                id="password" type="password" required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium">Confirmar contraseña</label>
              <input
                id="confirm" type="password" required autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Buscador de entrenador — solo visible si rol es cliente */}
            {role === 'client' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Entrenador <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={trainerSearch}
                      onChange={e => searchTrainers(e.target.value)}
                      onFocus={() => trainers.length > 0 && setShowDropdown(true)}
                      placeholder="Busca tu entrenador por nombre o email…"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-md
                                 placeholder:text-muted-foreground
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                                 transition-colors"
                    />
                  </div>

                  {/* Dropdown resultados */}
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg overflow-hidden">
                      {searchLoading ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando...</p>
                      ) : trainers.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                      ) : (
                        <ul>
                          {trainers.map(t => (
                            <li key={t.id}>
                              <button
                                type="button"
                                onClick={() => selectTrainer(t)}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2.5
                                           text-left text-sm hover:bg-secondary transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{t.name}</p>
                                  <p className="text-xs text-muted-foreground">{t.email}</p>
                                </div>
                                {selectedTrainer?.id === t.id && (
                                  <Check className="h-4 w-4 shrink-0 text-primary" />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Entrenador seleccionado */}
                {selectedTrainer && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Entrenador seleccionado: <span className="font-medium">{selectedTrainer.name}</span>
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={
                loading || !name || !email || !password || !confirm ||
                (role === 'client' && !selectedTrainer)
              }
              className="w-full py-2 px-4 text-sm font-medium rounded-md
                         bg-primary text-primary-foreground
                         hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-1">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}