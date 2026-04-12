import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import TrainerLayout from '../layouts/TrainerLayout';
import ClientLayout from '../layouts/ClientLayout';
import TrainerDashboard from '../pages/trainer/DashboardPage.tsx';
import ClientsPage from '../pages/trainer/ClientsPage.tsx';
import RoutinesPage from '../pages/trainer/RoutinesPage.tsx';
import RoutineDetailPage from '../pages/trainer/RoutineDetailPage.tsx';  // ← NUEVO
import ExercisesPage from '../pages/trainer/ExercisesPage.tsx';
import InventoryPage from '../pages/trainer/InventoryPage.tsx';
import OrdersPage from '../pages/trainer/OrdersPage.tsx';
import ClientDashboard from '../pages/client/DashboardPage.tsx';
import MyRoutinesPage from '../pages/client/MyRoutinesPage.tsx';
import NutritionPage from '../pages/client/NutritionPage.tsx';
import AppointmentsPage from '../pages/client/AppointmentsPage.tsx';
import ClientOrdersPage from '../pages/client/OrdersPage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import RegisterPage from '../pages/RegisterPage.tsx';
import TrainerAppointmentsPage from '../pages/trainer/TrainerAppointmentsPage.tsx';

export const router = createBrowserRouter([
  { path: '/',         element: <Navigate to="/login" replace /> },
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/trainer',
    element: (
      <ProtectedRoute allowedRoles={['trainer']}>
        <TrainerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,               element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',         element: <TrainerDashboard /> },
      { path: 'clients',           element: <ClientsPage /> },
      { path: 'routines',          element: <RoutinesPage /> },
      { path: 'routines/:id',      element: <RoutineDetailPage /> },   // ← NUEVO
      { path: 'exercises',         element: <ExercisesPage /> },
      { path: 'inventory',         element: <InventoryPage /> },
      { path: 'orders',            element: <OrdersPage /> },
      { path: 'appointments',      element: <TrainerAppointmentsPage /> },
    ],
  },

  {
    path: '/client',
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,               element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',         element: <ClientDashboard /> },
      { path: 'routines',          element: <MyRoutinesPage /> },
      { path: 'nutrition',         element: <NutritionPage /> },
      { path: 'appointments',      element: <AppointmentsPage /> },
      { path: 'orders',            element: <ClientOrdersPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);
