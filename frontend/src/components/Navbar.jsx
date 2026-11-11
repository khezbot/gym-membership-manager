import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) => `mr-4 hover:underline ${isActive ? 'font-bold underline' : ''}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        Gym Membership Manager
      </Link>
      <div className="flex items-center">
        {user ? (
          <>
            {user.role === 'admin' ? (
              <>
                <NavLink to="/admin/requests" className={linkClass}>Requests</NavLink>
                <NavLink to="/admin/plans" className={linkClass}>Manage plans</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/plans" className={linkClass}>Plans</NavLink>
                <NavLink to="/my-memberships" className={linkClass}>My memberships</NavLink>
              </>
            )}
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            <span className="mr-4 text-sm bg-indigo-900 px-2 py-1 rounded">
              {user.name} · {user.role}
            </span>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">
              Join the gym
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
