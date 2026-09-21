import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';
import PageLoader from './Loaders';

export default function ProtectedRoute({ children, allow }: { children: ReactNode; allow: Exclude<Role, null>[] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    const loginPath = allow.includes('admin') && !allow.includes('student') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/menu'} replace />;
  }

  return <>{children}</>;
}
