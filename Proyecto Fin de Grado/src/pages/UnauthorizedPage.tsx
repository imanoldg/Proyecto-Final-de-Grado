import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center bg-background">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="w-7 h-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Acceso no autorizado</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          No tienes permiso para ver esta página.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium border border-border rounded-md
                     hover:bg-accent transition-colors"
        >
          Volver
        </button>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground
                     rounded-md hover:bg-primary/90 transition-colors"
        >
          Ir al login
        </button>
      </div>
    </div>
  );
}
