import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const Logo = () => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" aria-label="GymApp">
    <rect width="50" height="50" rx="10" fill="rgb(232, 56, 79)" />
    <image
      href="/helmet.png"
      x="5"
      y="5"
      width="40"
      height="40"
    />
  </svg>
);
export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.token, res.user);
      navigate(
        res.user.role === 'trainer' ? '/trainer/dashboard' : '/client/dashboard',
        { replace: true }
      );
    } catch {
      setError('Email o contraseña incorrectos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="text-xl font-semibold">GymApp</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Inicia sesión en tu cuenta
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
              disabled={loading || !email || !password}
              className="w-full py-2 px-4 text-sm font-medium rounded-md
                         bg-primary text-primary-foreground
                         hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* ── Enlace a registro ── */}
          <p className="text-center text-sm text-muted-foreground pt-1">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Regístrate
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
