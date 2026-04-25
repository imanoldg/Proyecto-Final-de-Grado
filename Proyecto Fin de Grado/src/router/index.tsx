import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import TrainerLayout from '../layouts/TrainerLayout';
import ClientLayout from '../layouts/ClientLayout';
import AdminLayout from '../layouts/AdminLayout';                          // ← nuevo
import TrainerDashboard from '../pages/trainer/DashboardPage.tsx';
import ClientsPage from '../pages/trainer/ClientsPage.tsx';
import RoutinesPage from '../pages/trainer/RoutinesPage.tsx';
import RoutineDetailPage from '../pages/trainer/RoutineDetailPage.tsx';
import ExercisesPage from '../pages/trainer/ExercisesPage.tsx';
import ClientDashboard from '../pages/client/DashboardPage.tsx';
import MyRoutinesPage from '../pages/client/MyRoutinesPage.tsx';
import NutritionPage from '../pages/client/NutritionPage.tsx';
import AppointmentsPage from '../pages/client/AppointmentsPage.tsx';
import ClientOrdersPage from '../pages/client/OrdersPage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import TrainerAppointmentsPage from '../pages/trainer/TrainerAppointmentsPage.tsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.tsx';    // ← nuevo
import AdminUsersPage from '../pages/admin/AdminUsersPage.tsx';            // ← nuevo
import AdminInventoryPage from '../pages/admin/AdminInventoryPage.tsx';       // reutiliza el existente
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.tsx';


export const router = createBrowserRouter([
  { path: '/',         element: <Navigate to="/login" replace /> },
  { path: '/login',    element: <LoginPage /> },

  // ── TRAINER ──────────────────────────────────────────────
  {
    path: '/trainer',
    element: (
      <ProtectedRoute allowedRoles={['trainer']}>
        <TrainerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,           element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <TrainerDashboard /> },
      { path: 'clients',       element: <ClientsPage /> },
      { path: 'routines',      element: <RoutinesPage /> },
      { path: 'routines/:id',  element: <RoutineDetailPage /> },
      { path: 'exercises',     element: <ExercisesPage /> },
      { path: 'appointments',  element: <TrainerAppointmentsPage /> },
    ],
  },

  // ── CLIENT ───────────────────────────────────────────────
  {
    path: '/client',
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,           element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <ClientDashboard /> },
      { path: 'routines',      element: <MyRoutinesPage /> },
      { path: 'nutrition',     element: <NutritionPage /> },
      { path: 'appointments',  element: <AppointmentsPage /> },
      { path: 'orders',        element: <ClientOrdersPage /> },
    ],
  },

  // ── ADMIN ────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,           element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <AdminDashboardPage /> },
      { path: 'users',         element: <AdminUsersPage /> },
      { path: 'inventory',     element: <AdminInventoryPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);