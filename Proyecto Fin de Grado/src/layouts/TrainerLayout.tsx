import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList,
  Package, ShoppingCart, LogOut, Menu, X,
} from 'lucide-react';

const navItems = [
  { to: '/trainer/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/trainer/clients',    icon: Users,            label: 'Clientes'   },
  { to: '/trainer/routines',   icon: ClipboardList,    label: 'Rutinas'    },
  { to: '/trainer/exercises',  icon: Dumbbell,         label: 'Ejercicios' },
  { to: '/trainer/inventory',  icon: Package,          label: 'Inventario' },
  { to: '/trainer/orders',     icon: ShoppingCart,     label: 'Pedidos'    },
];

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-label="GymApp">
    <rect width="30" height="30" rx="7" fill="#01696f" />
    <path d="M7 15h5M18 15h5M12 10v10M18 10v10"
      stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export default function TrainerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64',
          'bg-card border-r border-border transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-semibold text-sm tracking-tight">GymApp</span>
          </div>
          <button
            className="lg:hidden p-1 text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                ].join(' ')
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Entrenador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center h-12 px-4 border-b border-border bg-card shrink-0">
          <button
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
