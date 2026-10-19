import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'features/auth/context/AuthContext';
import AppShell from 'components/layout/AppShell';
import { ErrorProvider } from 'features/errors/context/ErrorContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </ErrorProvider>
  );
};

export default ProtectedRoute;

