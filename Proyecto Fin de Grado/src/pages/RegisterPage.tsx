import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 30 30" fill="none" aria-label="GymApp">
    <rect width="30" height="30" rx="7" fill="#01696f" />
    <path d="M7 15h5M18 15h5M12 10v10M18 10v10"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

type Role = 'client' | 'trainer';

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

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [role, setRole]         = useState<Role>('client');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, password, role });
      setAuth(res.token, res.user);
      navigate(
        role === 'trainer' ? '/trainer/dashboard' : '/client/dashboard',
        { replace: true }
      );
    } catch (err: unknown) {
      let message = 'Error al registrarse. Inténtalo de nuevo.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } } };
        if (e.response?.data?.message) {
          message = e.response.data.message;
        }
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
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu cuenta
            </p>
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
                    onClick={() => setRole(r.value)}
                    className={`
                      flex flex-col items-start gap-1 p-3 rounded-lg border text-left
                      transition-colors cursor-pointer
                      ${role === r.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40 text-muted-foreground'
                      }
                    `}
                  >
                    <span className="text-sm font-medium leading-tight">
                      {r.label}
                    </span>
                    <span className="text-xs leading-tight opacity-70">
                      {r.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ana García"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || !password || !confirm}
              className="w-full py-2 px-4 text-sm font-medium rounded-md
                         bg-primary text-primary-foreground
                         hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Enlace a login */}
          <p className="text-center text-sm text-muted-foreground pt-1">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
