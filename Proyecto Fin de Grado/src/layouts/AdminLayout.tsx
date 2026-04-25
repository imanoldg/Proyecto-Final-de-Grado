import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/users',     label: 'Usuarios',   icon: Users },
  { to: '/admin/inventory', label: 'Inventario', icon: Package },
  { to: '/admin/orders',    label: 'Pedidos',    icon: ShoppingCart }, // ← nuevo
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin</p>
          <p className="text-sm font-semibold truncate mt-0.5">{user?.name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}