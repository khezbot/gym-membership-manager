import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import MyMemberships from './pages/MyMemberships';
import ManagePlans from './pages/admin/ManagePlans';
import { useAuth } from './context/AuthContext';

// Temporary placeholder until the admin review page is built (GMM-11)
const ComingSoon = ({ text }) => <p className="p-6 text-gray-600">{text}</p>;

const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/requests' : '/plans'} replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute role="member"><Plans /></ProtectedRoute>} />
        <Route path="/my-memberships" element={<ProtectedRoute role="member"><MyMemberships /></ProtectedRoute>} />
        <Route path="/admin/plans" element={<ProtectedRoute role="admin"><ManagePlans /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute role="admin"><ComingSoon text="Membership requests – coming in GMM-11" /></ProtectedRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;