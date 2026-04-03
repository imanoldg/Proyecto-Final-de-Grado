import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface Props {
  children: React.ReactNode;
  allowedRoles: Array<'trainer' | 'client'>;
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};