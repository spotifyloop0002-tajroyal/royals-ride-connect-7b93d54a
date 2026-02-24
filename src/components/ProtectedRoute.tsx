import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectError, setRedirectError] = useState(false);

  useEffect(() => {
    if (loading) return;

    try {
      if (!user) {
        navigate(requireAdmin ? '/admin/login' : '/auth', { 
          replace: true,
          state: { from: location.pathname }
        });
      } else if (requireAdmin && !isAdmin) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Redirect failed:', err);
      setRedirectError(true);
    }
  }, [user, loading, isAdmin, requireAdmin, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (redirectError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">Something went wrong during redirect.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">Return to Home</a>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
