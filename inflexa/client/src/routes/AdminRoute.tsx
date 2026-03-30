import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useEffect } from 'react';
import Spinner from '@/components/common/Spinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { addToast } = useToast();

  const shouldRedirectHome = !isLoading && isAuthenticated && !isAdmin;

  useEffect(() => {
    if (shouldRedirectHome) {
      addToast('error', 'You do not have permission to access the admin panel.');
    }
  }, [shouldRedirectHome, addToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
