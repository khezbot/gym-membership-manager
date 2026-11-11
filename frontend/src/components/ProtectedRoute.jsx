import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sends visitors to /login, and users with the wrong role to their own home page.
// (The backend enforces roles too; this only keeps the UI tidy.)
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/requests' : '/plans'} replace />;
  return children;
};

export default ProtectedRoute;
