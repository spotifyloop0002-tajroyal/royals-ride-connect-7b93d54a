import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SupervisorRouteProps {
  children: React.ReactNode;
}

export function SupervisorRoute({ children }: SupervisorRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("supervisor_access") !== "granted") {
      navigate('/supervisor/login');
    }
  }, [navigate]);

  if (localStorage.getItem("supervisor_access") !== "granted") {
    return null;
  }

  return <>{children}</>;
}
